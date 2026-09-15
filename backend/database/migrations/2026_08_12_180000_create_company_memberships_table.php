<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Create company_memberships table
        Schema::create('company_memberships', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->string('role')->default('Employee');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'company_id']);
        });

        // 2. Data Migration: Copy records from tenant_company_user and map roles from model_has_roles
        if (Schema::hasTable('tenant_company_user')) {
            $memberships = DB::table('tenant_company_user')->get();
            foreach ($memberships as $membership) {
                // Find role name from Spatie model_has_roles table for this user & company
                $roleName = DB::table('model_has_roles')
                    ->join('roles', 'model_has_roles.role_id', '=', 'roles.id')
                    ->where('model_has_roles.model_id', $membership->user_id)
                    ->where('model_has_roles.model_type', 'App\Models\User')
                    ->where('model_has_roles.team_id', $membership->company_id)
                    ->value('roles.name') ?: 'Employee';

                DB::table('company_memberships')->insert([
                    'user_id' => $membership->user_id,
                    'company_id' => $membership->company_id,
                    'role' => $roleName,
                    'is_active' => $membership->is_active,
                    'created_at' => $membership->created_at ?? now(),
                    'updated_at' => $membership->updated_at ?? now(),
                ]);
            }

            // Drop tenant_company_user table
            Schema::dropIfExists('tenant_company_user');
        }

        // 3. Drop legacy company_id column on users table
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'company_id')) {
                // Drop foreign key if database engine is relational and supports it
                try {
                    $table->dropForeign(['company_id']);
                } catch (\Exception $e) {
                    // Ignore if no foreign key exists
                }
                $table->dropColumn('company_id');
            }
        });
    }

    public function down(): void
    {
        // 1. Recreate legacy company_id column on users table
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'company_id')) {
                $table->foreignId('company_id')->after('id')->nullable()->constrained('companies')->nullOnDelete();
            }
        });

        // 2. Recreate tenant_company_user table
        Schema::create('tenant_company_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'company_id']);
        });

        // 3. Roll back data
        if (Schema::hasTable('company_memberships')) {
            $memberships = DB::table('company_memberships')->get();
            foreach ($memberships as $m) {
                DB::table('tenant_company_user')->insert([
                    'user_id' => $m->user_id,
                    'company_id' => $m->company_id,
                    'is_active' => $m->is_active,
                    'created_at' => $m->created_at,
                    'updated_at' => $m->updated_at,
                ]);

                // Update users table with a default company_id to keep compatibility on rollback
                DB::table('users')->where('id', $m->user_id)->update(['company_id' => $m->company_id]);
            }

            Schema::dropIfExists('company_memberships');
        }
    }
};
