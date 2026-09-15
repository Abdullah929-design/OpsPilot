<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('teams.manage') || $user->can('departments.view');
    }

    public function view(User $user, Team $team): bool
    {
        return $user->company_id === $team->department->company_id && 
               ($user->can('teams.manage') || $user->can('departments.view'));
    }

    public function create(User $user): bool
    {
        return $user->can('teams.manage');
    }

    public function update(User $user, Team $team): bool
    {
        return $user->company_id === $team->department->company_id && $user->can('teams.manage');
    }

    public function delete(User $user, Team $team): bool
    {
        if ($user->company_id !== $team->department->company_id || !$user->can('teams.manage')) {
            return false;
        }

        // TODO Sprint 3: block delete if employees assigned

        return true;
    }
}
