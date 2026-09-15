<?php

namespace Database\Seeders;

use App\Models\CompanyRoleTemplate;
use App\Models\CompanyRoleTemplatePermission;
use Illuminate\Database\Seeder;

class CompanyRoleTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            'Super Admin' => [
                'description' => 'Has all company permissions.',
                'permissions' => [
                    'users.view', 'users.create', 'users.update', 'users.delete',
                    'roles.manage', 'permissions.manage',
                    'profile.update', 'dashboard.view', 'logs.activity.view', 'logs.audit.view',
                    'company.view', 'company.update',
                    'departments.view', 'departments.create', 'departments.update', 'departments.delete',
                    'teams.manage',
                    'designations.manage',
                    'offices.manage',
                ]
            ],
            'Admin' => [
                'description' => 'Can manage company settings, users, and departments.',
                'permissions' => [
                    'users.view', 'users.create', 'users.update',
                    'roles.manage', 'dashboard.view', 'profile.update',
                    'logs.activity.view', 'logs.audit.view',
                    'company.view', 'company.update',
                    'departments.view', 'departments.create', 'departments.update', 'departments.delete',
                    'teams.manage',
                    'designations.manage',
                    'offices.manage',
                ]
            ],
            'Manager' => [
                'description' => 'Can view users and manage departments.',
                'permissions' => [
                    'users.view', 'dashboard.view', 'profile.update', 'logs.activity.view',
                    'company.view', 'departments.view'
                ]
            ],
            'Employee' => [
                'description' => 'Standard user access.',
                'permissions' => [
                    'dashboard.view', 'profile.update'
                ]
            ]
        ];

        foreach ($templates as $name => $data) {
            $template = CompanyRoleTemplate::updateOrCreate(
                ['name' => $name],
                ['description' => $data['description']]
            );

            // Clear old template permissions first
            $template->permissions()->delete();

            foreach ($data['permissions'] as $permission) {
                CompanyRoleTemplatePermission::create([
                    'company_role_template_id' => $template->id,
                    'permission_name' => $permission
                ]);
            }
        }
    }
}
