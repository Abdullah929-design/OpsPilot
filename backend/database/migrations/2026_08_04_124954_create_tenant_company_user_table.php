<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tenant_company_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['user_id', 'company_id']);
        });

        // Data migration: Automatically copy all existing single-company mappings into the pivot
        DB::table('users')
            ->whereNotNull('company_id')
            ->orderBy('id')
            ->chunk(100, function ($users) {
                $records = [];
                foreach ($users as $user) {
                    $records[] = [
                        'user_id' => $user->id,
                        'company_id' => $user->company_id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
                DB::table('tenant_company_user')->insert($records);
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_company_user');
    }
};
