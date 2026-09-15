<?php

use Illuminate\Database\Migrations\Migration;
use Spatie\Permission\Models\Permission;
use App\Models\Role;
use App\Models\Company;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = [
            'documents.view',
            'documents.create',
            'documents.update',
            'documents.delete',
            'documents.download',
            'documents.version',
            'folders.manage',
            'categories.manage',
        ];

        foreach ($permissions as $name) {
            Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web']);
        }

        // Apply new permissions to existing companies
        $companies = Company::all();
        foreach ($companies as $company) {
            app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId($company->id);

            // Super Admin gets all permissions
            $superAdmin = Role::where('company_id', $company->id)->where('name', 'Super Admin')->first();
            if ($superAdmin) {
                $superAdmin->givePermissionTo(Permission::where('guard_name', 'web')->get());
            }

            // Admin gets documents.*, folders.manage, categories.manage
            $admin = Role::where('company_id', $company->id)->where('name', 'Admin')->first();
            if ($admin) {
                $admin->givePermissionTo([
                    'documents.view',
                    'documents.create',
                    'documents.update',
                    'documents.delete',
                    'documents.download',
                    'documents.version',
                    'folders.manage',
                    'categories.manage',
                ]);
            }

            // Manager gets documents.view, documents.download
            $manager = Role::where('company_id', $company->id)->where('name', 'Manager')->first();
            if ($manager) {
                $manager->givePermissionTo([
                    'documents.view',
                    'documents.download',
                ]);
            }

            // Employee gets documents.view, documents.download
            $employee = Role::where('company_id', $company->id)->where('name', 'Employee')->first();
            if ($employee) {
                $employee->givePermissionTo([
                    'documents.view',
                    'documents.download',
                ]);
            }
        }
    }

    public function down(): void
    {
        // No down actions needed for permission seedings
    }
};
