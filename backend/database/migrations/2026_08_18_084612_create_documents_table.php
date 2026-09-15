<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('companies')->cascadeOnDelete();
            $table->foreignId('folder_id')->nullable()->constrained('folders')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('document_categories')->nullOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('file_name');
            $table->string('file_path');
            $table->string('mime_type');
            $table->string('extension');
            $table->bigInteger('size');
            $table->string('checksum');
            $table->enum('status', ['active', 'archived', 'deleted'])->default('active');
            $table->unsignedInteger('current_version')->default(1);
            $table->foreignId('uploaded_by')->constrained('users')->cascadeOnDelete();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
    }
};
