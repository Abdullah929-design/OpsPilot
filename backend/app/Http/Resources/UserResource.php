<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $companyId = auth()->user()?->company_id ?? $request->route('id') ?? $request->route('companyId');
        $resolvedRoles = collect();
        $resolvedPermissions = collect();

        if ($companyId) {
            $roleName = 'Employee';
            if ($this->relationLoaded('companyMemberships')) {
                $membershipRecord = $this->companyMemberships->firstWhere('id', (int) $companyId);
                if ($membershipRecord && isset($membershipRecord->pivot->role)) {
                    $roleName = $membershipRecord->pivot->role;
                    $isActive = (bool) $membershipRecord->pivot->is_active;
                }
            } else {
                $membershipRecord = \Illuminate\Support\Facades\DB::table('company_memberships')
                    ->where('user_id', $this->id)
                    ->where('company_id', $companyId)
                    ->first();
                if ($membershipRecord) {
                    $roleName = $membershipRecord->role;
                    $isActive = (bool) $membershipRecord->is_active;
                }
            }

            $dbRole = \Spatie\Permission\Models\Role::where('name', $roleName)
                ->where('company_id', $companyId)
                ->with('permissions')
                ->first();
            if ($dbRole) {
                $resolvedRoles->push($dbRole);
                $resolvedPermissions = $dbRole->permissions;
            }
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar ? url($this->avatar) : null,
            'is_active' => $isActive,
            'preferences' => $this->preferences,
            'roles' => $resolvedRoles->map(fn ($role) => [
                'id' => $role->id,
                'name' => $role->name,
            ]),
            'permissions' => $resolvedPermissions->map(fn ($perm) => [
                'id' => $perm->id,
                'name' => $perm->name,
            ]),
            'companies' => $this->relationLoaded('companyMemberships')
                ? $this->companyMemberships->map(fn ($company) => [
                    'id' => $company->id,
                    'name' => $company->name,
                    'subdomain' => $company->subdomain,
                ])
                : [],
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];

    }
}
