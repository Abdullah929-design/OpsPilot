<?php

namespace App\Policies;

use App\Models\PlatformUser;
use Illuminate\Contracts\Auth\Authenticatable;

class PlanPolicy
{
    public function view(Authenticatable $user): bool
    {
        if ($user instanceof PlatformUser) {
            return $user->can('plans.view');
        }
        return false;
    }

    public function create(Authenticatable $user): bool
    {
        if ($user instanceof PlatformUser) {
            return $user->can('plans.create');
        }
        return false;
    }

    public function update(Authenticatable $user): bool
    {
        if ($user instanceof PlatformUser) {
            return $user->can('plans.update');
        }
        return false;
    }

    public function delete(Authenticatable $user, \App\Models\Plan $plan): bool
    {
        if ($user instanceof PlatformUser) {
            if (!$user->can('plans.delete')) {
                return false;
            }
            // Block deletion if plan is still assigned to active companies
            return !\App\Models\Company::where('plan_id', $plan->id)->exists();
        }
        return false;
    }

}
