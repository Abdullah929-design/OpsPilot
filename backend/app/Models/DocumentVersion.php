<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DocumentVersion extends Model
{
    public $timestamps = false; // Only created_at timestamp is used

     protected $casts = [
        'created_at' => 'datetime',
    ];

    protected $fillable = [
        'document_id',
        'version',
        'file_name',
        'file_path',
        'mime_type',
        'size',
        'checksum',
        'uploaded_by'
    ];

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }


    public static function boot()
    {
        parent::boot();
        static::updating(function ($version) {
            throw new \Exception('Document versions are immutable.');
        });
    }
}
