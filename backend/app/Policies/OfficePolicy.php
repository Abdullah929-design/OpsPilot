<?php

namespace App\Policies;

use App\Models\OfficeLocation;
use App\Models\User;

class OfficePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('offices.manage');
    }

    public function view(User $user, OfficeLocation $officeLocation): bool
    {
        return $user->company_id === $officeLocation->company_id && $user->can('offices.manage');
    }

    public function create(User $user): bool
    {
        return $user->can('offices.manage');
    }

    public function update(User $user, OfficeLocation $officeLocation): bool
    {
        return $user->company_id === $officeLocation->company_id && $user->can('offices.manage');
    }

    public function delete(User $user, OfficeLocation $officeLocation)
    {
        if ($user->company_id !== $officeLocation->company_id || !$user->can('offices.manage')) {
            return \Illuminate\Auth\Access\Response::deny('Unauthorized.');
        }

        $count = \App\Models\OfficeLocation::where('company_id', $officeLocation->company_id)->count();
        if ($count <= 1) {
            return \Illuminate\Auth\Access\Response::deny('Cannot delete the last remaining office location of your company.', 422);
        }

        return \Illuminate\Auth\Access\Response::allow();
    }
}
