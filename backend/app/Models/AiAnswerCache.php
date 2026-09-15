<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AiAnswerCache extends Model
{
    protected $table = 'ai_answer_caches';

    protected $fillable = [
        'company_id',
        'question_hash',
        'question',
        'answer',
        'source_document_ids',
    ];

    protected $casts = [
        'source_document_ids' => 'array',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
