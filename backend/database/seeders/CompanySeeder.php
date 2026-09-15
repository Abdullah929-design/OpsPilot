<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Department;
use App\Models\Designation;
use App\Models\OfficeLocation;
use App\Models\CompanySetting;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    public function run(int $companyId): void
    {
        $company = Company::find($companyId);
        if (!$company) return;

        // 1. Seed Departments and Teams
        $hr = Department::create([
            'company_id' => $company->id,
            'name' => 'Human Resources',
            'description' => 'Handles recruitment and personnel management.'
        ]);

        $eng = Department::create([
            'company_id' => $company->id,
            'name' => 'Engineering',
            'description' => 'Core software engineering and development.'
        ]);

        $hr->teams()->create(['name' => 'Recruiting']);
        $eng->teams()->create(['name' => 'Backend Development']);
        $eng->teams()->create(['name' => 'Frontend Development']);

        // 2. Seed Designations
        Designation::create(['company_id' => $company->id, 'title' => 'Software Engineer']);
        Designation::create(['company_id' => $company->id, 'title' => 'HR Manager']);

        // 3. Seed Office Locations
        OfficeLocation::create([
            'company_id' => $company->id,
            'name' => 'Headquarters',
            'country' => 'United States',
            'city' => 'New York',
            'address' => '123 Tech Blvd',
            'timezone' => 'America/New_York'
        ]);

        // 4. Seed Company Settings
        CompanySetting::create(['company_id' => $company->id, 'key' => 'allow_remote_work', 'value' => 'true']);
        CompanySetting::create(['company_id' => $company->id, 'key' => 'working_days', 'value' => json_encode(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'])]);
        CompanySetting::create(['company_id' => $company->id, 'key' => 'office_hours_start', 'value' => '09:00']);
        CompanySetting::create(['company_id' => $company->id, 'key' => 'office_hours_end', 'value' => '17:00']);
        CompanySetting::create(['company_id' => $company->id, 'key' => 'weekend', 'value' => json_encode(['Saturday', 'Sunday'])]);
        CompanySetting::create(['company_id' => $company->id, 'key' => 'leave_year_start', 'value' => '01-01']);
        CompanySetting::create(['company_id' => $company->id, 'key' => 'default_language', 'value' => 'en']);
        CompanySetting::create(['company_id' => $company->id, 'key' => 'default_currency', 'value' => 'USD']);
        CompanySetting::create(['company_id' => $company->id, 'key' => 'email_signature', 'value' => 'Regards, Acme Corporation']);
    }
}
