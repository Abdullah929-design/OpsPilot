<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('company_role_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // "Super Admin", "Admin", "Manager", "Employee"
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_role_templates');
    }
};
