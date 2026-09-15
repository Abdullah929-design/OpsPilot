<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowAction extends Model
{
    protected $fillable = [
        'workflow_id',
        'action_type',
        'action_config',
        'order',
    ];

    protected $casts = [
        'action_config' => 'array', // Decodes the JSON config dynamically to an array
    ];

    public function workflow(): BelongsTo
    {
        return $this->belongsTo(Workflow::class);
    }
}
