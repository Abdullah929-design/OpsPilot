<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_employee', function (Blueprint $table) {
            $table->id();
            $table->foreignId('document_id')->constrained('documents')->cascadeOnDelete();
            $table->foreignId('employee_id')->constrained('employees')->cascadeOnDelete();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique(['document_id', 'employee_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('document_employee');
    }
};
