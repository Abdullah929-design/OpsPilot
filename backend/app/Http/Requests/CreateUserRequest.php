<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateUserRequest extends FormRequest
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
        return $user->can('users.create');
    }



        public function rules(): array
    {
        $isPlatform = $this->user() instanceof \App\Models\PlatformUser;
        $emailExists = \App\Models\User::where('email', $this->email)->exists();

        // If a Platform Operator is adding an existing system user, bypass unique email/password requirements
        if ($isPlatform && $emailExists) {
            return [
                'name' => ['nullable', 'string', 'max:255'],
                'email' => ['required', 'string', 'email', 'max:255'],
                'password' => ['nullable', 'string'],
                'roles' => ['nullable', 'array'],
                'roles.*' => ['string', 'exists:roles,name'],
                'is_active' => ['nullable', 'boolean'],
                'avatar' => ['nullable', 'string'],
            ];
        }

        // Standard validation (for new users, or any tenant-level user creations)
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', new \App\Rules\PasswordPolicyRule],
            'roles' => ['nullable', 'array'],
            'roles.*' => ['string', 'exists:roles,name'],
            'is_active' => ['nullable', 'boolean'],
            'avatar' => ['nullable', 'string'],
        ];
    }
}
