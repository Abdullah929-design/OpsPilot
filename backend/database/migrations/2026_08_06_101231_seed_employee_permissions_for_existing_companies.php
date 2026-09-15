<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use App\Models\Role;
use App\Models\Company;

return new class extends Migration
{
    public function up(): void
    {
        $permissions = [
            'employees.view',
            'employees.create',
            'employees.update',
            'employees.delete',
            'employees.import',
            'employees.export',
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

            // Admin gets view, create, update
            $admin = Role::where('company_id', $company->id)->where('name', 'Admin')->first();
            if ($admin) {
                $admin->givePermissionTo([
                    'employees.view',
                    'employees.create',
                    'employees.update'
                ]);
            }

            // Manager gets view
            $manager = Role::where('company_id', $company->id)->where('name', 'Manager')->first();
            if ($manager) {
                $manager->givePermissionTo([
                    'employees.view'
                ]);
            }
        }
    }

    public function down(): void
    {
        // No down actions needed for permission seedings
    }
};
