<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\Auth;

class PlatformRoleController extends Controller
{
    /**
     * Retrieve platform-specific roles and all available permissions.
     */
    public function index(Request $request): JsonResponse
    {
         if (!$request->user('platform')->can('platform.roles.view')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $roles = Role::where('guard_name', 'platform')->with('permissions')->get();
        $permissions = Permission::where('guard_name', 'platform')->pluck('name');

        return ResponseHelper::success('Platform roles and permissions retrieved.', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Sync platform-specific permissions to a platform role.
     */
    public function syncPermissions(Request $request, $roleId): JsonResponse
    {
         if (!$request->user('platform')->can('platform.roles.update')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $validated = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::where('guard_name', 'platform')->findOrFail($roleId);
        
        $role->syncPermissions($validated['permissions']);

        activity('platform')
            ->causedBy($request->user('platform'))
            ->performedOn($role)
            ->log('platform.role.permissions_synced');

        return ResponseHelper::success('Role permissions updated successfully.', $role->load('permissions'));
    }
}
