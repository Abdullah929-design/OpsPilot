<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Models\PlatformUser;
use App\Http\Resources\PlatformUserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\PermissionRegistrar;

class PlatformUserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (!$request->user('platform')->can('platform.users.view')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $users = PlatformUser::with('roles')->latest()->get();

        return ResponseHelper::success('Platform users retrieved.', PlatformUserResource::collection($users));
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user('platform')->can('platform.users.create')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:platform_users,email'],
            'password' => ['required', 'string', new \App\Rules\PasswordPolicyRule],
            'role' => ['required', 'string', Rule::exists('roles', 'name')->where('guard_name', 'platform')],
        ]);

        $user = PlatformUser::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'is_active' => true,
        ]);

        // Assign platform guard role context
        app(PermissionRegistrar::class)->setPermissionsTeamId(0);
        $user->assignRole($validated['role']);

        // Platform Log
        activity('platform')
            ->causedBy($request->user('platform'))
            ->performedOn($user)
            ->log('platform_user.created');

        return ResponseHelper::success('Platform user created successfully.', new PlatformUserResource($user->load('roles')), 201);
    }

    public function update(Request $request, $id): JsonResponse
    {
        if (!$request->user('platform')->can('platform.users.update')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $user = PlatformUser::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('platform_users', 'email')->ignore($user->id)],
            'password' => ['nullable', 'string', new \App\Rules\PasswordPolicyRule],
            'role' => ['sometimes', 'required', 'string', Rule::exists('roles', 'name')->where('guard_name', 'platform')],
        ]);

        $user->fill($validated);

        if (!empty($validated['password'])) {
            $user->password = Hash::make($validated['password']);
        }

        $user->save();

        if (!empty($validated['role'])) {
            app(PermissionRegistrar::class)->setPermissionsTeamId(0);
            $user->syncRoles([$validated['role']]);
        }

        // Platform Log
        activity('platform')
            ->causedBy($request->user('platform'))
            ->performedOn($user)
            ->log('platform_user.updated');

        return ResponseHelper::success('Platform user updated successfully.', new PlatformUserResource($user->load('roles')));
    }

    public function destroy(Request $request, $id): JsonResponse
    {
        if (!$request->user('platform')->can('platform.users.delete')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $user = PlatformUser::findOrFail($id);

        // Security Guardrail: Cannot delete your own account
        if ($request->user('platform')->id === $user->id) {
            return ResponseHelper::error('You cannot delete your own active operator account.', [], 400);
        }

        $user->delete();

        // Platform Log
        activity('platform')
            ->causedBy($request->user('platform'))
            ->log('platform_user.deleted');

        return ResponseHelper::success('Platform user deleted successfully.');
    }
}
