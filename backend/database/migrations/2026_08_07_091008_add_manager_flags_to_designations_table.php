<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('designations', function (Blueprint $table) {
            $table->boolean('is_manager')->default(false)->after('status');
            $table->boolean('is_system')->default(false)->after('is_manager');
        });

        // Seed default manager designations for existing companies if they don't have one
        $companies = \App\Models\Company::all();
        foreach ($companies as $company) {
            $exists = \Illuminate\Support\Facades\DB::table('designations')
                ->where('company_id', $company->id)
                ->where('title', 'Manager')
                ->exists();

            if ($exists) {
                \Illuminate\Support\Facades\DB::table('designations')
                    ->where('company_id', $company->id)
                    ->where('title', 'Manager')
                    ->update([
                        'is_manager' => true,
                        'is_system' => true,
                    ]);
            } else {
                \Illuminate\Support\Facades\DB::table('designations')->insert([
                    'company_id' => $company->id,
                    'title' => 'Manager',
                    'status' => 'active',
                    'is_manager' => true,
                    'is_system' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('designations', function (Blueprint $table) {
            $table->dropColumn(['is_manager', 'is_system']);
        });
    }
};
