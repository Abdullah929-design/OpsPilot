<?php

namespace App\Policies;

use App\Models\User;

class ActivityPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function viewAudit(User $user): bool
    {
        return $user->can('logs.audit.view');
    }
}
