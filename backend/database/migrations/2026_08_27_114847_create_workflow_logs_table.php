<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete(); // Added for tenant performance isolation
            $table->foreignId('workflow_id')->constrained()->cascadeOnDelete();
            $table->string('status'); // 'success', 'failed', 'condition_not_met'
            $table->json('context')->nullable(); // snapshot of triggering data
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->index(['company_id', 'workflow_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_logs');
    }
};
