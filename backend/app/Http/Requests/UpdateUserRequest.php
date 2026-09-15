<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if ($user instanceof \App\Models\PlatformUser) {
            // 1. Force platform context (0) to verify the operator's admin/manager roles
            app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId(0);
             $isAuthorized = $user->can('companies.update');

            if (!$isAuthorized) {
                return false;
            }

            // 2. Switch Spatie context to the tenant company for validation rules
            $companyId = $this->route('id') ?? $this->route('companyId');
            if ($companyId) {
                app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId($companyId);
            }

            return true;
        }
        return $user->can('users.update');
    }


    public function rules(): array
    {
        $routeUser = $this->route('user') ?? $this->route('userId');
        $userId = is_object($routeUser) ? $routeUser->id : $routeUser;

        return [
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($userId)],
            'password' => ['sometimes', 'nullable', 'string', new \App\Rules\PasswordPolicyRule],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
            'is_active' => ['nullable', 'boolean'],
            'avatar' => ['nullable', 'string'],
        ];
    }
}
