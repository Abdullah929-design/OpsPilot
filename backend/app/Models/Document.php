<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Document extends Model
{
    use SoftDeletes, LogsActivity;

     public $is_copy_action = false;

    protected static function booted()
    {
         static::forceDeleted(function ($document) {
             // Delete original file
             if (\Storage::disk('local')->exists($document->file_path)) {
                 \Storage::disk('local')->delete($document->file_path);
             }
             // Delete version files
             $document->versions()->each(function ($version) {
                 if (\Storage::disk('local')->exists($version->file_path)) {
                     \Storage::disk('local')->delete($version->file_path);
                 }
             });
             // Delete preview PDF cache
             $previewRelativePath = "companies/{$document->company_id}/previews/{$document->id}.pdf";
             if (\Storage::disk('local')->exists($previewRelativePath)) {
                 \Storage::disk('local')->delete($previewRelativePath);             }
         });
     }


    protected $fillable = [
        'company_id',
        'folder_id',
        'category_id',
        'title',
        'description',
        'file_name',
        'file_path',
        'mime_type',
        'extension',
        'size',
        'checksum',
        'status',
        'current_version',
        'uploaded_by'
    ];

    protected $casts = [
        'size' => 'integer',
        'current_version' => 'integer',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function folder()
    {
        return $this->belongsTo(Folder::class);
    }

    public function category()
    {
        return $this->belongsTo(DocumentCategory::class, 'category_id');
    }

    public function versions()
    {
        return $this->hasMany(DocumentVersion::class)->orderByDesc('version');
    }

    public function latestVersion()
    {
        return $this->hasOne(DocumentVersion::class)->latestOfMany('version');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function employees()
    {
        return $this->belongsToMany(Employee::class, 'document_employee')
            ->withPivot('note')
            ->withTimestamps();
    }

    public function tags()
    {
        return $this->morphToMany(Tag::class, 'taggable');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'description', 'folder_id', 'category_id', 'status', 'current_version'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('activity');
    }

    public function tapActivity($activity, string $eventName)
    {
        $activity->properties = $activity->properties->merge([
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
        $logName = 'activity';
        $description = "document.{$eventName}";

        if ($eventName === 'created') {
            if ($this->is_copy_action) {
                $description = 'document.copied';
            } else {
                $description = 'document.created';
            }
            $logName = 'activity';
        } elseif ($eventName === 'deleted') {
            $logName = 'audit';
            $description = 'document.deleted';
        } elseif ($eventName === 'restored') {
            $logName = 'audit';
            $description = 'document.restored';
        } elseif ($eventName === 'updated') {
            $properties = $activity->properties->toArray();
            $attributes = $properties['attributes'] ?? [];

            if (array_key_exists('folder_id', $attributes)) {
                $logName = 'activity';
                $description = 'document.moved';
            } elseif (array_key_exists('category_id', $attributes)) {
                $logName = 'audit';
                $description = 'document.metadata_changed';
            } elseif (array_key_exists('title', $attributes) || array_key_exists('description', $attributes)) {
                $logName = 'audit';
                $description = 'document.renamed';
            }
        }

        $activity->log_name = $logName;
        $activity->description = $description;
    }
}
