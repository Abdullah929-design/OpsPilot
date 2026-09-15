<?php

namespace Database\Seeders;

use App\Models\PlatformUser;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PlatformSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Set team ID context to 0 for platform users (who are global, not tenant-scoped)
        app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId(0);

        // 2. Create platform-specific permissions
        // Note: Only users.* and roles.* are prefixed with "platform." (e.g., platform.users.*, platform.roles.*) 
        // to avoid visual and functional collision with Sprint 1's tenant-side permissions of the same name.
        // companies.* and plans.* are left unprefixed since there are no tenant-side equivalents.
         $permissions = [
            'platform.users.view', 'platform.users.create', 'platform.users.update',
            'platform.users.delete', 'platform.users.disable',
            'companies.view', 'companies.view-all', 'companies.create', 'companies.update', 'companies.delete',
            'companies.suspend', 'companies.assign-manager',
            'plans.view', 'plans.create', 'plans.update', 'plans.delete',
            'platform.roles.view', 'platform.roles.create', 'platform.roles.update', 'platform.roles.delete',
            'platform.activity.view',
            'platform.settings.manage',
        ];
        foreach ($permissions as $p) {
            Permission::firstOrCreate(['name' => $p, 'guard_name' => 'platform']);
        }

        // 3. Create platform roles
        $admin = Role::firstOrCreate(['name' => 'Admin', 'guard_name' => 'platform']);
        // Assign all platform-scoped permissions to Admin role
        $admin->givePermissionTo(Permission::where('guard_name', 'platform')->get());

        $manager = Role::firstOrCreate(['name' => 'Manager', 'guard_name' => 'platform']);
        $manager->givePermissionTo([
            'companies.view', 
            'companies.update', 
            'companies.assign-manager', 
            'plans.view', 
            'platform.activity.view'
        ]);

        // 4. Seed initial Platform Admin User
        $user = PlatformUser::firstOrCreate(
            ['email' => 'platform-admin@opspilot.test'],
            [
                'name' => 'Platform Admin',
                'password' => bcrypt('P@ssword123'),
                'is_active' => true,
            ]
        );

        $user->assignRole($admin);
    }
}
