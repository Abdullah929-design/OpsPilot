<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'user_limit',
        'company_storage_limit_mb',
        'price',
        'billing_interval',
        'trial_days',
        'features',
        'is_archived',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'user_limit' => 'integer',
        'company_storage_limit_mb' => 'integer',
        'trial_days' => 'integer',
        'features' => 'array',
        'is_archived' => 'boolean',
    ];

    public function companies()
    {
        return $this->hasMany(Company::class);
    }
}
