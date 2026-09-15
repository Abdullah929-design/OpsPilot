<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;

class PlatformCompanyUserController extends Controller
{
    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index(Request $request, $companyId): JsonResponse
    {
        $company = \App\Models\Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('view', $company);

        if (!$request->user('platform')->can('companies.view')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        // Switch Spatie context to tenant AFTER platform auth checks pass
        app(PermissionRegistrar::class)->setPermissionsTeamId($companyId);

        $search = $request->query('search');
        $role = $request->query('role');
        $status = $request->has('is_active') ? $request->boolean('is_active') : null;
        $perPage = (int) $request->query('per_page', 15);

                $users = User::whereHas('companyMemberships', fn($q) => $q->where('companies.id', $companyId))
            ->with(['roles', 'companyMemberships'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role, function ($query, $role) {
                $query->whereHas('companyMemberships', function ($q) use ($role) {
                    $q->where('company_memberships.role', $role);
                });
            })
            ->when(!is_null($status), function ($query) use ($status, $companyId) {
                $query->whereHas('companyMemberships', function ($q) use ($status, $companyId) {
                    $q->where('companies.id', $companyId)
                      ->where('company_memberships.is_active', $status);
                });
            })
            ->latest()
            ->paginate($perPage);

        return ResponseHelper::success('Users retrieved successfully.', [
            'items' => UserResource::collection($users->items()),
            'pagination' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    public function store(CreateUserRequest $request, $companyId): JsonResponse
    {
        $company = \App\Models\Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('update', $company);

         if (!$request->user('platform')->can('companies.update')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        // Switch Spatie context to tenant AFTER platform auth checks pass
        app(PermissionRegistrar::class)->setPermissionsTeamId($companyId);

        $data = $request->validated();
        $data['company_id'] = $companyId; // Scope to the target company

        $user = $this->userService->createUser($data);

        // Dual-side Audit Logging
        activity('platform')
            ->causedBy($request->user('platform'))
            ->performedOn($user)
            ->log('company.user_created');

        activity('audit')
            ->causedBy($request->user('platform'))
            ->performedOn($user)
            ->log('user.created');

        return ResponseHelper::success('User created successfully.', new UserResource($user), 201);
    }

    public function update(UpdateUserRequest $request, $companyId, $userId): JsonResponse
    {
        $company = \App\Models\Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('update', $company);

         if (!$request->user('platform')->can('companies.update')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        // Switch Spatie context to tenant AFTER platform auth checks pass
        app(PermissionRegistrar::class)->setPermissionsTeamId($companyId);

                       $user = User::whereHas('companyMemberships', fn($q) => $q->where('companies.id', $companyId))->findOrFail($userId);
        $updatedUser = $this->userService->updateUser($user, $request->validated(), (int) $companyId);

        // Dual-side Audit Logging
        activity('platform')
            ->causedBy($request->user('platform'))
            ->performedOn($updatedUser)
            ->log('company.user_updated');

        activity('audit')
            ->causedBy($request->user('platform'))
            ->performedOn($updatedUser)
            ->log('user.updated');

        return ResponseHelper::success('User updated successfully.', new UserResource($updatedUser));
    }

    public function destroy(Request $request, $companyId, $userId): JsonResponse
    {
        $company = \App\Models\Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('update', $company);

         if (!$request->user('platform')->can('companies.update')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        // Switch Spatie context to tenant AFTER platform auth checks pass
        app(PermissionRegistrar::class)->setPermissionsTeamId($companyId);

                $user = User::whereHas('companyMemberships', fn($q) => $q->where('companies.id', $companyId))->findOrFail($userId);
        $this->userService->deleteUser($request->user('platform'), $user, (int) $companyId);


        // Dual-side Audit Logging
        activity('platform')
            ->causedBy($request->user('platform'))
            ->performedOn($user)
            ->log('company.user_deleted');

        activity('audit')
            ->causedBy($request->user('platform'))
            ->performedOn($user)
            ->log('user.deleted');

        return ResponseHelper::success('User deleted successfully.');
    }
}
