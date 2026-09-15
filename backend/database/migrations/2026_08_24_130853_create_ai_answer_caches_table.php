<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_answer_caches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained()->cascadeOnDelete();
            $table->string('question_hash', 64)->index();
            $table->text('question');
            $table->text('answer');
            $table->json('source_document_ids')->nullable();
            $table->timestamps();

            $table->unique(['company_id', 'question_hash']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_answer_caches');
    }
};
