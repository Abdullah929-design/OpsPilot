<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $user->can('users.view');
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, User $model): bool
    {
        return $model->companyMemberships()->where('companies.id', $user->company_id)->exists() && $user->can('users.view');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->can('users.create');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        if (!$model->companyMemberships()->where('companies.id', $user->company_id)->exists()) {
            return false;
        }

        // Hierarchy Guard: A tenant operator cannot update users with equal or higher roles
        if ($user->id !== $model->id) {
            $userWeight = $this->getRoleWeight($user, $user->company_id);
            $modelWeight = $this->getRoleWeight($model, $user->company_id);
            if ($userWeight <= $modelWeight) {
                return false;
            }
        }

        return $user->can('users.update');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        if ($user->id === $model->id) {
            return false;
        }

        // Hierarchy Guard: A tenant operator cannot delete users with equal or higher roles
        $userWeight = $this->getRoleWeight($user, $user->company_id);
        $modelWeight = $this->getRoleWeight($model, $user->company_id);
        if ($userWeight <= $modelWeight) {
            return false;
        }

                 if ($model->can('permissions.manage')) {
            $adminCount = User::permission('permissions.manage')
                ->whereHas('companyMemberships', fn($q) => $q->where('companies.id', $user->company_id))
                ->count();
                
            if ($adminCount <= 1) {
                return false;
            }
        }

        return $model->companyMemberships()->where('companies.id', $user->company_id)->exists() && $user->can('users.delete');
    }

    /**
     * Helper to get role weights for hierarchy checks
     */
      private function getRoleWeight(User $user, int $companyId): int
    {
        app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId($companyId);
        
        if ($user->can('permissions.manage')) {
            return 4;
        }
        if ($user->can('roles.manage')) {
            return 3;
        }
        if ($user->can('users.view')) {
            return 2;
        }
        return 1;
    }
}
