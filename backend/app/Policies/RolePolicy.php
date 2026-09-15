<?php

namespace App\Policies;

use App\Models\User;
use Spatie\Permission\Models\Role;

class RolePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('roles.manage') || $user->can('permissions.manage');
    }

    public function view(User $user, Role $role): bool
    {
        return $user->company_id === $role->company_id && ($user->can('roles.manage') || $user->can('permissions.manage'));
    }

    public function create(User $user): bool
    {
        return $user->can('roles.manage');
    }

    public function update(User $user, Role $role): bool
    {
        return $user->company_id === $role->company_id && $user->can('roles.manage');
    }

    public function delete(User $user, Role $role): bool
    {
        return $user->company_id === $role->company_id && $user->can('roles.manage');
    }

    public function syncPermissions(User $user, Role $role): bool
    {
        return $user->company_id === $role->company_id && $user->can('roles.manage');
    }
}
