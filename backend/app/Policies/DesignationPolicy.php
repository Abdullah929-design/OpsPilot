<?php

namespace App\Policies;

use App\Models\Designation;
use App\Models\User;

class DesignationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('designations.manage');
    }

    public function view(User $user, Designation $designation): bool
    {
        return $user->company_id === $designation->company_id && $user->can('designations.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('designations.manage');
    }

    public function update(User $user, Designation $designation): bool
    {
        return $user->company_id === $designation->company_id && $user->can('designations.manage');
    }

        public function delete(User $user, Designation $designation): bool
    {
        if ($designation->is_system) {
            return false;
        }

        return $user->company_id === $designation->company_id && $user->can('designations.manage');
    }

}
