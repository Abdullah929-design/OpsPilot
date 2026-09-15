<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_conditions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained()->cascadeOnDelete();
            $table->string('field');      // e.g. 'department_id', 'document_type'
            $table->string('operator');   // e.g. '=', '!=', '<', '>', 'contains'
            $table->string('value');
            $table->timestamps();

            $table->index(['workflow_id', 'field']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_conditions');
    }
};
