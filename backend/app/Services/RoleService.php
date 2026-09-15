<?php

namespace App\Services;

use App\Models\User;
use Exception;

class RoleService
{
    /**
     * Sync roles for a user with guardrail checks.
     *
     * @throws Exception
     */
    public function syncRoles(User $user, array $newRoles, ?int $companyId = null): User
    {
        $companyId = $companyId ?? app(\Spatie\Permission\PermissionRegistrar::class)->getPermissionsTeamId() ?: ($user->company_id ?? auth()->user()?->company_id);
        
        $hasPermissionsManage = $user->can('permissions.manage');
        $newRolesHavePermission = false;
        
        foreach ($newRoles as $roleName) {
            $role = \App\Models\Role::where('name', $roleName)
                ->where('company_id', $companyId)
                ->first();
            if ($role && $role->hasPermissionTo('permissions.manage')) {
                $newRolesHavePermission = true;
                break;
            }
        }
        if ($hasPermissionsManage && !$newRolesHavePermission) {
            $adminCount = User::permission('permissions.manage')
                ->whereHas('companyMemberships', fn($q) => $q->where('companies.id', $companyId))
                ->count();
                
            if ($adminCount <= 1) {
                throw new Exception('Cannot remove permission management capabilities from the last administrator user.');
            }
        }

        $roleName = !empty($newRoles) ? $newRoles[0] : 'Employee';
        if ($user->companyMemberships()->where('companies.id', $companyId)->exists()) {
            $user->companyMemberships()->updateExistingPivot($companyId, ['role' => $roleName]);
        } else {
            $user->companyMemberships()->attach($companyId, ['role' => $roleName, 'is_active' => true]);
        }

        // Notify user of role assignment
        $user->notify(new \App\Notifications\RoleAssignedNotification($newRoles));

        // Log role change under 'audit'
        activity('audit')
            ->performedOn($user)
            ->causedBy(auth()->user())
            ->withProperty('roles', $newRoles)
            ->withProperty('ip_address', request()->ip())
            ->withProperty('user_agent', request()->userAgent())
            ->log('roles changed');

        return $user;
    }
}

