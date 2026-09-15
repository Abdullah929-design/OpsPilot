<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('designations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->cascadeOnDelete(); // <-- Restored
            $table->string('title');
            $table->string('status')->default('active');
            $table->softDeletes();
            $table->timestamps();
            
            $table->unique(['company_id', 'title']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('designations');
    }
};
