<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Workflow;
use Illuminate\Auth\Access\HandlesAuthorization;

class WorkflowPolicy
{
    use HandlesAuthorization;

    public function viewAny(User $user): bool
    {
        return $user->hasPermissionTo('workflow.view');
    }

    public function view(User $user, Workflow $workflow): bool
    {
        return $user->hasPermissionTo('workflow.view') && $user->company_id === $workflow->company_id;
    }

    public function create(User $user): bool
    {
        return $user->hasPermissionTo('workflow.create');
    }

    public function update(User $user, Workflow $workflow): bool
    {
        return $user->hasPermissionTo('workflow.edit') && $user->company_id === $workflow->company_id;
    }

    public function delete(User $user, Workflow $workflow): bool
    {
        return $user->hasPermissionTo('workflow.delete') && $user->company_id === $workflow->company_id;
    }

    public function activate(User $user, Workflow $workflow): bool
    {
        return $user->hasPermissionTo('workflow.activate') && $user->company_id === $workflow->company_id;
    }
}
