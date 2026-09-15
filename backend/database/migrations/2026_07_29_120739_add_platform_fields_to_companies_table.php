<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->foreignId('assigned_manager_id')->nullable()->constrained('platform_users')->nullOnDelete();
            $table->foreignId('plan_id')->nullable()->constrained('plans')->nullOnDelete();
            $table->string('platform_status')->default('active'); // active / suspended
        });
    }

    public function down(): void
    {
        Schema::table('companies', function (Blueprint $table) {
            $table->dropForeign(['assigned_manager_id']);
            $table->dropColumn('assigned_manager_id');
            $table->dropForeign(['plan_id']);
            $table->dropColumn('plan_id');
            $table->dropColumn('platform_status');
        });
    }
};
