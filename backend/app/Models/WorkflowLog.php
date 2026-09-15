<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowLog extends Model
{
    protected $fillable = [
        'company_id',
        'workflow_id',
        'status',
        'context',
        'error_message',
    ];

    protected $casts = [
        'context' => 'array', // Decodes the JSON contextual snapshot to an array
    ];

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }
}
