<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class PlatformSettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'app_name' => 'OpsPilot Platform',
            'logo' => '/assets/logo-dark.png',
            'smtp_host' => 'smtp.mailtrap.io',
            'smtp_port' => '2525',
            'smtp_username' => '',
            'smtp_password' => '',
            'default_timezone' => 'UTC',
            'default_language' => 'en',
            'password_policy' => json_encode([
                'min_length' => 8,
                'require_special' => true,
                'require_numbers' => true,
            ]),
            'maintenance_mode' => '0',
        ];

        foreach ($defaults as $key => $value) {
            Setting::firstOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }
    }
}
