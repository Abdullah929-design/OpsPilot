<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('user_limit')->nullable();
            $table->integer('company_storage_limit_mb')->nullable();
            $table->decimal('price', 10, 2)->default(0);
            $table->string('billing_interval')->default('monthly'); // monthly / yearly
            $table->integer('trial_days')->default(0);
            $table->json('features')->nullable(); // flexible feature-flag list per plan
            $table->boolean('is_archived')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('plans');
    }
};
