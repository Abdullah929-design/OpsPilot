<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRoleRequest;
use App\Http\Requests\UpdateRoleRequest;
use App\Http\Requests\SyncRolePermissionsRequest;
use App\Http\Resources\PermissionResource;
use App\Http\Resources\RoleResource;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Permission;
use App\Models\Role;

class RoleController extends Controller
{
    use AuthorizesRequests;

    protected array $systemRoles = ['Super Admin', 'Admin', 'Manager', 'Employee'];

        public function index(): JsonResponse
    {
        $this->authorize('viewAny', Role::class);

        // Fetch only roles scoped to the active tenant and using 'web' guard
        $roles = Role::where('company_id', auth()->user()->company_id)
            ->where('guard_name', 'web')
            ->with('permissions')
            ->get();

        return ResponseHelper::success('Roles retrieved successfully.', RoleResource::collection($roles));
    }

    public function permissions(): JsonResponse
    {
        $this->authorize('viewAny', Role::class);

        // Fetch only tenant-specific 'web' guard permissions, excluding platform operator permissions
        $permissions = Permission::where('guard_name', 'web')->get();

        return ResponseHelper::success('Permissions retrieved successfully.', PermissionResource::collection($permissions));
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $this->authorize('create', Role::class);

        $requestedPermissions = $request->validated('permissions', []);
        $currentUser = auth()->user();

        // Privilege Escalation Guard: Cannot grant permissions you do not possess
         if (!$currentUser->can('permissions.manage')) {
            $userPermissions = $currentUser->getAllPermissions()->pluck('name')->toArray();
            $unownedPermissions = array_diff($requestedPermissions, $userPermissions);

            if (!empty($unownedPermissions)) {
                return ResponseHelper::error(
                    'You cannot grant permissions that you do not possess: ' . implode(', ', $unownedPermissions),
                    [],
                    403
                );
            }
        }

        // Create the role explicitly scoped to the active tenant
        $role = Role::create([
            'name' => $request->validated('name'),
            'guard_name' => 'web',
            'company_id' => $currentUser->company_id,
        ]);

        if (!empty($requestedPermissions)) {
            $role->syncPermissions($requestedPermissions);
        }

        return ResponseHelper::success('Role created successfully.', new RoleResource($role->load('permissions')), 201);
    }


    public function show(Role $role): JsonResponse
    {
        $this->authorize('view', $role);

        return ResponseHelper::success('Role details retrieved.', new RoleResource($role->load('permissions', 'users')));
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        $this->authorize('update', $role);

        if (in_array($role->name, $this->systemRoles)) {
            return ResponseHelper::error('System roles cannot be renamed.', 422);
        }

        $role->update(['name' => $request->validated('name')]);

        return ResponseHelper::success('Role updated successfully.', new RoleResource($role->load('permissions')));
    }

    public function destroy(Role $role): JsonResponse
    {
        $this->authorize('delete', $role);

        if (in_array($role->name, $this->systemRoles)) {
            return ResponseHelper::error('System default roles cannot be deleted.', 422);
        }

        if ($role->users()->count() > 0) {
            return ResponseHelper::error('Cannot delete a role that is currently assigned to users.', 422);
        }

        $role->delete();

        return ResponseHelper::success('Role deleted successfully.');
    }

        public function syncPermissions(SyncRolePermissionsRequest $request, Role $role): JsonResponse
    {
        $this->authorize('syncPermissions', $role);

        $requestedPermissions = $request->validated('permissions', []);
        $currentUser = auth()->user();

        // Privilege Escalation Guard: Cannot grant permissions you do not possess
         if (!$currentUser->can('permissions.manage')) {
            $userPermissions = $currentUser->getAllPermissions()->pluck('name')->toArray();
            $unownedPermissions = array_diff($requestedPermissions, $userPermissions);

            if (!empty($unownedPermissions)) {
                return ResponseHelper::error(
                    'You cannot grant permissions that you do not possess: ' . implode(', ', $unownedPermissions),
                    [],
                    403
                );
            }
        }

        $role->syncPermissions($requestedPermissions);

        // Log permission change under 'audit'
        activity('audit')
            ->performedOn($role)
            ->causedBy($currentUser)
            ->withProperty('permissions', $requestedPermissions)
            ->withProperty('ip_address', request()->ip())
            ->withProperty('user_agent', request()->userAgent())
            ->log('permission changed');

        return ResponseHelper::success("Permissions synced for role '{$role->name}'.", new RoleResource($role->load('permissions')));
    }
}
