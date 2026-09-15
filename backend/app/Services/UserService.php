<?php

namespace App\Services;

use App\Models\User;
use Exception;

class UserService
{
    protected RoleService $roleService;

    public function __construct(RoleService $roleService)
    {
        $this->roleService = $roleService;
    }

    public function getPaginatedUsers(?string $search = null, ?string $role = null, ?bool $status = null, int $perPage = 15)
    {
        $companyId = auth()->user()->company_id;
        return User::whereHas('companyMemberships', fn($q) => $q->where('companies.id', $companyId))
            ->with(['roles', 'companyMemberships'])
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%");
                });
            })
            ->when($role, function ($query, $role) {
                $query->whereHas('companyMemberships', function ($q) use ($role) {
                    $q->where('company_memberships.role', $role);
                });
            })
            ->when(! is_null($status), function ($query) use ($status, $companyId) {
                $query->whereHas('companyMemberships', function ($q) use ($status, $companyId) {
                    $q->where('companies.id', $companyId)
                      ->where('company_memberships.is_active', $status);
                });
            })
            ->latest()
            ->paginate($perPage);
    }

    public function createUser(array $data): User
    {
        $roles = $data['roles'] ?? [];
        unset($data['roles']);

        $isActive = $data['is_active'] ?? true;
        unset($data['is_active']);

        if (!isset($data['company_id']) && $user = request()->user()) {
            $companyId = $user->company_id;
        } else {
            $companyId = $data['company_id'] ?? null;
        }
        unset($data['company_id']);

        // Hierarchy Guard: Tenant Admins cannot assign roles equal or higher than their own
        $updater = auth()->user() ?? request()->user('platform');
        $isPlatformAdmin = $updater instanceof \App\Models\PlatformUser;
        if (!empty($roles) && !$isPlatformAdmin && $companyId) {
            $updaterWeight = $this->getRoleWeight($updater, $companyId);
            foreach ($roles as $roleName) {
                if ($this->getRoleWeightByName($roleName, $companyId) >= $updaterWeight) {
                    throw new Exception("You cannot assign a role equal to or higher than your own.");
                }
            }
        }

        // Determine the role string to write
        $roleName = !empty($roles) ? $roles[0] : 'Employee';

        // Check if user already exists in the system (global user table)
        $user = User::where('email', $data['email'])->first();

        if ($user) {
            // Already exists, just attach to this company portal if not already a member
            if ($companyId && !$user->companyMemberships()->where('companies.id', $companyId)->exists()) {
                $user->companyMemberships()->attach($companyId, ['role' => $roleName, 'is_active' => $isActive]);
            }
        } else {
            // Create user account
            $user = User::create($data);
            if ($companyId) {
                $user->companyMemberships()->attach($companyId, ['role' => $roleName, 'is_active' => $isActive]);
            }
        }

        // Notify user of creation
        $user->notify(new \App\Notifications\UserCreatedNotification(auth()->user()?->name ?? 'System'));

        // Load the in-memory context properties
        if ($companyId) {
            $user->company_id = $companyId;
        }

        return $user->load('roles', 'permissions', 'companyMemberships');
    }

    public function updateUser(User $user, array $data, ?int $companyId = null): User
    {
        $updater = auth()->user() ?? request()->user('platform');

        // Determine if the updater is editing their own account
        $isSelfEdit = ($updater instanceof User && $updater->id === $user->id);

        // Platform Admins (PlatformUser) have full authority over global identity fields
        $isPlatformAdmin = $updater instanceof \App\Models\PlatformUser;

        // Tenant Admins editing someone else's account may ONLY touch membership-level fields
        // (roles, is_active). Global identity (name, email, password, avatar) is protected.
        if (!$isSelfEdit && !$isPlatformAdmin) {
            unset($data['name'], $data['email'], $data['password'], $data['avatar'], $data['preferences']);
        }

        if (empty($data['password'])) {
            unset($data['password']);
        }

        $roles = $data['roles'] ?? null;
        unset($data['roles']);

        // Resolve target company context
        $companyId = $companyId ?? (auth()->user()?->company_id) ?? $user->company_id ?? $user->companyMemberships()->first()?->id;

        // Intercept is_active and update it on the tenant pivot table instead of the global users table
        if (isset($data['is_active'])) {
            if ($companyId) {
                $user->companyMemberships()->updateExistingPivot($companyId, ['is_active' => (bool)$data['is_active']]);
            }
            unset($data['is_active']);
        }

        if (!empty($data)) {
            $user->update($data);
        }

        if ($user->wasChanged('password')) {
            activity('activity')
                ->performedOn($user)
                ->causedBy($updater)
                ->withProperty('ip_address', request()->ip())
                ->withProperty('user_agent', request()->userAgent())
                ->log('password changed');
        }

        if (!is_null($roles)) {
            // Skip hierarchy check for self-edits (user cannot change their own role to something higher
            // than allowed, but they should be able to save their profile without this check blocking them)
            if (!$isPlatformAdmin && !$isSelfEdit && $companyId) {
                $updaterWeight = $this->getRoleWeight($updater, $companyId);
                foreach ($roles as $roleName) {
                    if ($this->getRoleWeightByName($roleName, $companyId) >= $updaterWeight) {
                        throw new Exception("You cannot assign a role equal to or higher than your own.");
                    }
                }
            }
            $this->roleService->syncRoles($user, $roles, $companyId);
        }

        if ($companyId) {
            $user->company_id = $companyId;
        }

        return $user->fresh(['roles', 'permissions', 'companyMemberships']);
    }



    public function deleteUser($currentUser, User $userToDelete, ?int $companyId = null): bool
    {
        if ($currentUser instanceof User && $currentUser->id === $userToDelete->id) {
            throw new Exception('You cannot delete your own account.');
        }

        // Fall back to authenticated user context if not explicitly provided (tenant space)
        $companyId = $companyId ?? (auth()->user()?->company_id);

        if (!$companyId) {
            throw new Exception('Company context is required to delete a user.');
        }

        // Detach the user from this specific company portal
        $userToDelete->companyMemberships()->detach($companyId);

        // Unlink user from the employee record in this company (remains standalone HR record)
        \App\Models\Employee::where('company_id', $companyId)
            ->where('user_id', $userToDelete->id)
            ->update(['user_id' => null]);

        // If the user no longer belongs to ANY company, soft-delete their account
        if ($userToDelete->companyMemberships()->count() === 0) {
            $userToDelete->delete();
        }

        return true;
    }

    public function toggleActiveStatus(User $user, bool $status): User
    {
        $companyId = auth()->user()?->company_id;

        if ($companyId) {
            $user->companyMemberships()->updateExistingPivot($companyId, ['is_active' => $status]);
            $user->is_active = $status;
        } else {
            $user->update(['is_active' => $status]);
        }

        return $user;
    }

    // AFTER:
    private function getRoleWeightByName(?string $roleName, int $companyId): int
    {
        if (!$roleName) {
            return 1;
        }
        
        $role = \App\Models\Role::where('name', $roleName)
            ->where('company_id', $companyId)
            ->first();
            
        if (!$role) {
            return 1;
        }
        
        if ($role->hasPermissionTo('permissions.manage')) {
            return 4;
        }
        if ($role->hasPermissionTo('roles.manage')) {
            return 3;
        }
        if ($role->hasPermissionTo('users.view')) {
            return 2;
        }
        return 1;
    }
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
