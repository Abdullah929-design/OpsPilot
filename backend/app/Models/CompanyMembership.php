<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\Pivot;

class CompanyMembership extends Pivot
{
    protected $table = 'company_memberships';

    protected $fillable = [
        'user_id',
        'company_id',
        'role',
        'is_active',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
