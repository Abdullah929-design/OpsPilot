<?php

namespace App\Services;

use App\Models\Company;
use App\Models\CompanyRoleTemplate;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\PermissionRegistrar;

class CompanyService
{
    /**
     * Create a new company and clone default roles/permissions from templates.
     */
    public function createCompanyWithDefaults(array $data): Company
    {
        // 1. Extract and remove default admin details to prevent database column errors
        $adminName = $data['admin_name'];
        $adminEmail = $data['admin_email'];
        $adminPassword = $data['admin_password'];
        unset($data['admin_name'], $data['admin_email'], $data['admin_password']);

        // 2. Create the company
        $company = Company::create($data);

        // 3. Set the Spatie teams context BEFORE creating roles
        app(PermissionRegistrar::class)->setPermissionsTeamId($company->id);

                // 3. Load templates and create company roles
        $templates = CompanyRoleTemplate::with('permissions')->get();

        if ($templates->isEmpty()) {
            throw new \Exception('Cannot create company: No company role templates have been seeded.');
        }

        foreach ($templates as $template) {
            // Create role scoped to this company_id
            $role = Role::create([
                'name' => $template->name,
                'guard_name' => 'web',
                'company_id' => $company->id // Explicitly pass the company ID
            ]);

            // Map template permissions
            $permissionNames = $template->permissions->pluck('permission_name')->toArray();

            // Ensure permissions exist in the database globally before assignment
            foreach ($permissionNames as $name) {
                Permission::firstOrCreate([
                    'name' => $name,
                    'guard_name' => 'web'
                ]);
            }

            // Sync permissions to the scoped role
            $role->givePermissionTo($permissionNames);
        }

                // 5. Create default system "Manager" designation
        \App\Models\Designation::create([
            'company_id' => $company->id,
            'title' => 'Manager',
            'status' => 'active',
            'is_manager' => true,
            'is_system' => true,
        ]);

        // 6. Create the default Super Admin user for the company
        $adminUser = \App\Models\User::create([
            'name' => $adminName,
            'email' => $adminEmail,
            'password' => bcrypt($adminPassword),
            'is_active' => true,
        ]);

        // Associate with company in pivot table
        $adminUser->companyMemberships()->attach($company->id, ['role' => 'Super Admin', 'is_active' => true]);

        return $company;
    }
}
