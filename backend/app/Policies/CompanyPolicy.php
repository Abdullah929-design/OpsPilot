<?php

namespace App\Policies;

use App\Models\Company;
use App\Models\User;
use App\Models\PlatformUser;
use Illuminate\Contracts\Auth\Authenticatable;

class CompanyPolicy
{
    public function view(Authenticatable $user, Company $company): bool
    {
        if ($user instanceof PlatformUser) {
            if ($user->can('companies.view-all')) {
                return $user->can('companies.view');
            }
            return $user->can('companies.view') && (
                $company->assigned_manager_id === $user->id ||
                $user->accessibleCompanies()->where('companies.id', $company->id)->exists()
            );
        }

        if ($user instanceof User) {
            $belongsToCompany = ($user->company_id !== null && $user->company_id === $company->id)
                || $user->companyMemberships()->where('companies.id', $company->id)->exists();
            return $belongsToCompany && $user->can('company.view');
        }

        return false;
    }

    public function update(Authenticatable $user, Company $company): bool
    {
        if ($user instanceof PlatformUser) {
            if ($user->can('companies.view-all')) {
                return $user->can('companies.update');
            }
            return $user->can('companies.update') && (
                $company->assigned_manager_id === $user->id ||
                $user->accessibleCompanies()->where('companies.id', $company->id)->exists()
            );
        }

        if ($user instanceof User) {
            $belongsToCompany = ($user->company_id !== null && $user->company_id === $company->id)
                || $user->companyMemberships()->where('companies.id', $company->id)->exists();
            return $belongsToCompany && $user->can('company.update');
        }

        return false;
    }

    public function suspend(Authenticatable $user, Company $company): bool
    {
        if ($user instanceof PlatformUser) {
            if ($user->can('companies.view-all')) {
                return $user->can('companies.suspend');
            }
            return $user->can('companies.suspend') && (
                $company->assigned_manager_id === $user->id ||
                $user->accessibleCompanies()->where('companies.id', $company->id)->exists()
            );
        }
        return false;
    }

    public function activate(Authenticatable $user, Company $company): bool
    {
        if ($user instanceof PlatformUser) {
            if ($user->can('companies.view-all')) {
                return $user->can('companies.suspend');
            }
            return $user->can('companies.suspend') && (
                $company->assigned_manager_id === $user->id ||
                $user->accessibleCompanies()->where('companies.id', $company->id)->exists()
            );
        }
        return false;
    }

    public function assignManager(Authenticatable $user, Company $company): bool
    {
        if ($user instanceof PlatformUser) {
            if ($user->can('companies.view-all')) {
                return $user->can('companies.assign-manager');
            }
            return $user->can('companies.assign-manager') && (
                $company->assigned_manager_id === $user->id ||
                $user->accessibleCompanies()->where('companies.id', $company->id)->exists()
            );
        }
        return false;
    }

    public function changePlan(Authenticatable $user, Company $company): bool
    {
        if ($user instanceof PlatformUser) {
            if ($user->can('companies.view-all')) {
                return $user->can('companies.update');
            }
            return $user->can('companies.update') && (
                $company->assigned_manager_id === $user->id ||
                $user->accessibleCompanies()->where('companies.id', $company->id)->exists()
            );
        }
        return false;
    }


        public function delete(Authenticatable $user, Company $company): bool
    {
        if ($user instanceof PlatformUser) {
            if ($user->can('companies.view-all')) {
                return $user->can('companies.delete');
            }
            return $user->can('companies.delete') && (
                $company->assigned_manager_id === $user->id ||
                $user->accessibleCompanies()->where('companies.id', $company->id)->exists()
            );
        }
        return false;
    }

}
