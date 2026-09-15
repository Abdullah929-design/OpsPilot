<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Resources\RoleResource;
use App\Models\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;

class PlatformCompanyRoleController extends Controller
{
    public function index(Request $request, $companyId): JsonResponse
    {
        $company = \App\Models\Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('view', $company);
         if (!$request->user('platform')->can('companies.view')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        // Retrieve the company-scoped roles (guard 'web')
        $roles = Role::where('company_id', $companyId)
            ->where('guard_name', 'web')
            ->with('permissions')
            ->get();

        return ResponseHelper::success('Roles retrieved successfully.', RoleResource::collection($roles));
    }

    public function syncPermissions(Request $request, $companyId, $roleId): JsonResponse
    {
         $company = \App\Models\Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('update', $company);
        if (!$request->user('platform')->can('companies.update')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $role = Role::where('company_id', $companyId)->findOrFail($roleId);
        $validated = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['string'],
        ]);

        // Temporarily bind Spatie context to the company to scope permission sync
        app(PermissionRegistrar::class)->setPermissionsTeamId($companyId);
        $role->syncPermissions($validated['permissions']);

        // Dual-side Audit Logging
        activity('platform')
            ->causedBy($request->user('platform'))
            ->performedOn($role)
            ->withProperty('role', $role->name)
            ->withProperty('permissions', $validated['permissions'])
            ->log('company.role_permissions_synced');

        activity('audit')
            ->causedBy($request->user('platform'))
            ->performedOn($role)
            ->withProperty('role', $role->name)
            ->withProperty('permissions', $validated['permissions'])
            ->log('role.permissions_synced');

        return ResponseHelper::success('Role permissions synced successfully.', new RoleResource($role->load('permissions')));
    }
}
