<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Workflow extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'trigger_type',
        'is_active',
        'created_by',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function conditions(): HasMany
    {
        return $this->hasMany(WorkflowCondition::class);
    }

    public function actions(): HasMany
    {
        return $this->hasMany(WorkflowAction::class)->orderBy('order');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(WorkflowLog::class);
    }
}
