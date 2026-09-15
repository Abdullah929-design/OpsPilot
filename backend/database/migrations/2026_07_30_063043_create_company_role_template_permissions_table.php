<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
        public function up(): void
    {
        Schema::create('company_role_template_permissions', function (Blueprint $table) {
            $table->id();
            
            // Set the column
            $table->unsignedBigInteger('company_role_template_id');
            
            // Set the foreign key constraint with a custom short name
            $table->foreign('company_role_template_id', 'crt_perm_template_fk')
                  ->references('id')
                  ->on('company_role_templates')
                  ->cascadeOnDelete();
                  
            $table->string('permission_name');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('company_role_template_permissions');
    }
};
