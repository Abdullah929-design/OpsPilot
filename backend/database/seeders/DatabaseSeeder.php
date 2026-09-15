<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
                $company = \App\Models\Company::create([
            'name' => 'Acme Corporation',
            'subdomain' => 'acme',
            'legal_name' => 'Acme Corp LLC',
            'email' => 'info@acme.test',
            'phone' => '+15550199',
            'website' => 'https://acme.test',
            'timezone' => 'UTC',
            'currency' => 'USD',
            'language' => 'en',
            'status' => 'active'
        ]);

        // 1. Seed tenant database parts
        $this->callWith(RolePermissionSeeder::class, [
            'companyId' => $company->id
        ]);
        $this->callWith(CompanySeeder::class, [
            'companyId' => $company->id
        ]);

        // 2. Seed platform template and settings parts
        $this->call(CompanyRoleTemplateSeeder::class);
        $this->call(PlatformSeeder::class);
        $this->call(PlatformSettingSeeder::class);
    }
}
