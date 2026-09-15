<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('workflow_actions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_id')->constrained()->cascadeOnDelete();
            $table->string('action_type'); // 'notify', 'update_record', 'create_task', 'send_email'
            $table->json('action_config'); // e.g. {"target":"manager","message":"..."}
            $table->unsignedInteger('order')->default(0);
            $table->timestamps();

            $table->index(['workflow_id', 'order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('workflow_actions');
    }
};
