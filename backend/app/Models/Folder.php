<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Folder extends Model
{
    use SoftDeletes, LogsActivity;

    protected $fillable = [
        'company_id',
        'parent_id',
        'name',
        'description',
        'created_by'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function parent()
    {
        return $this->belongsTo(Folder::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Folder::class, 'parent_id');
    }

    public function documents()
    {
        return $this->hasMany(Document::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // Recursive children for tree building
    public function allChildren()
    {
        return $this->children()->with('allChildren');
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'parent_id', 'description'])
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
        $description = "folder.{$eventName}";

        if ($eventName === 'created') {
            $logName = 'activity';
            $description = 'folder.created';
        } elseif ($eventName === 'deleted') {
            $logName = 'audit';
            $description = 'folder.deleted';
        } elseif ($eventName === 'updated') {
            $logName = 'audit';
            $description = 'folder.renamed';
        }

        $activity->log_name = $logName;
        $activity->description = $description;
    }

}
