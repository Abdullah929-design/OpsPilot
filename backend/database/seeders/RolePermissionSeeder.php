<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use App\Models\Role;

class RolePermissionSeeder extends Seeder
{
    public function run(int $companyId): void
    {
        // 1. Set Spatie teams context
        app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId($companyId);

        // 2. Create all permissions (including Sprint 2)
             $permissions = [
         'users.view', 'users.create', 'users.update', 'users.delete',
         'roles.manage', 'permissions.manage',
         'profile.update', 'dashboard.view', 'logs.activity.view', 'logs.audit.view',
         
         // Sprint 2 Organization Permissions
         'company.view', 'company.update',
         'departments.view', 'departments.create', 'departments.update', 'departments.delete',
         'teams.manage',
         'designations.manage',
         'offices.manage',

         // Sprint 3 Employee Permissions
         'employees.view', 'employees.create', 'employees.update', 'employees.delete', 'employees.import', 'employees.export',

         // Sprint 4 Document Management Permissions
            'documents.view', 'documents.create', 'documents.update', 'documents.delete',
            'documents.download', 'documents.version',
            'folders.manage',
            'categories.manage',

         // Sprint 5 AI Permissions
         'ai.access',
         'ai.search',
         'ai.documents',

         // Sprint 6 Workflow Engine Permissions
         'workflow.view', 'workflow.create', 'workflow.edit', 'workflow.delete', 'workflow.activate',
     ];


        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'web']);
         
        }

                // 3. Create roles and assign permissions (explicitly scoped to the company)
        $superAdmin = Role::firstOrCreate([
            'name' => 'Super Admin',
            'guard_name' => 'web',
            'company_id' => $companyId
        ]);
         $superAdmin->givePermissionTo(Permission::where('guard_name', 'web')->get());

        $admin = Role::firstOrCreate([
            'name' => 'Admin',
            'guard_name' => 'web',
            'company_id' => $companyId
        ]);
             $admin->givePermissionTo([
         'users.view', 'users.create', 'users.update',
         'roles.manage', 'dashboard.view', 'profile.update',
         'logs.activity.view', 'logs.audit.view', 
         
         // Sprint 2 Organization Permissions
         'company.view', 'company.update',
         'departments.view', 'departments.create', 'departments.update', 'departments.delete',
         'teams.manage',
         'designations.manage',
         'offices.manage',

         // Sprint 3 Employee Permissions
         'employees.view', 'employees.create', 'employees.update',

         // Sprint 4 Document Management Permissions
            'documents.view', 'documents.create', 'documents.update', 'documents.delete',
            'documents.download', 'documents.version',
            'folders.manage',
            'categories.manage',

         // Sprint 5 AI Permissions
         'ai.access',
         'ai.search',
         'ai.documents',

         // Sprint 6 Workflow Engine Permissions
         'workflow.view', 'workflow.create', 'workflow.edit', 'workflow.delete', 'workflow.activate',
     ]);


             Role::firstOrCreate([
         'name' => 'Manager',
         'guard_name' => 'web',
         'company_id' => $companyId
     ])->givePermissionTo([
         'users.view', 'dashboard.view', 'profile.update', 'logs.activity.view',
         // Sprint 2 Organization Permissions
         'company.view', 'departments.view',
         
         // Sprint 3 Employee Permissions
         'employees.view',

          // Sprint 4 Document Management Permissions
            'documents.view', 'documents.download', 'ai.access','ai.search',

         // Sprint 6 Workflow Engine Permissions
         'workflow.view', 'workflow.create', 'workflow.edit',
     ]); 


        Role::firstOrCreate([
            'name' => 'Employee',
            'guard_name' => 'web',
            'company_id' => $companyId
        ])->givePermissionTo(['dashboard.view', 'profile.update',
    // Sprint 4 Document Management Permissions
            'documents.view', 'documents.download',
            
            // AI Permissions
            'ai.access',
            'ai.search',
            'ai.documents',
        ]);

        // 4. Seed Super Admin user
        $user = User::firstOrCreate(
            ['email' => 'admin@opspilot.test'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('P@ssword123'),
            ]
        );

        // Associate with company in pivot table
        if (!$user->companyMemberships()->where('companies.id', $companyId)->exists()) {
            $user->companyMemberships()->attach($companyId, ['role' => 'Super Admin', 'is_active' => true]);
        }
    }
}
