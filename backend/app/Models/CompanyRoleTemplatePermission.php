<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyRoleTemplatePermission extends Model
{
    use HasFactory;

    protected $fillable = ['company_role_template_id', 'permission_name'];

    public function template()
    {
        return $this->belongsTo(CompanyRoleTemplate::class, 'company_role_template_id');
    }
}
