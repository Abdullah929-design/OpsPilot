<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SyncUserPermissionDenialsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'permissions' => ['array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $targetUser = $this->route('user');

                        $companyId = $this->user()?->company_id;

            // AFTER:
            if ($targetUser && $companyId && $targetUser->can('permissions.manage')) {
                // Count active administrators who can manage permissions in the current company
                $adminCount = \App\Models\User::permission('permissions.manage')
                    ->whereHas('companyMemberships', fn($q) => $q->where('companies.id', $companyId))
                    ->count();

                if ($superAdminCount <= 1) {
                    $criticalPermissions = ['roles.manage', 'users.update', 'permissions.manage'];
                    $deniedPermissions = $this->input('permissions', []);
                    $intersect = array_intersect($criticalPermissions, $deniedPermissions);

                    if (!empty($intersect)) {
                        $validator->errors()->add(
                            'permissions',
                            'Cannot deny critical permissions (' . implode(', ', $intersect) . ') for the last remaining Super Admin.'
                        );
                    }
                }
            }
        });
    }
}
