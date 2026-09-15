<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Department extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = ['company_id', 'name', 'description', 'status'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function teams()
    {
        return $this->hasMany(Team::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'description', 'status'])
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

        if ($eventName === 'updated') {
            $dirty = $this->getDirty();
            if (array_key_exists('name', $dirty)) {
                $activity->log_name = 'audit';
                $activity->description = 'department.renamed';
            } else {
                $activity->log_name = 'activity';
                $activity->description = 'department.updated';
            }
        } else {
            $activity->log_name = 'activity';
            $activity->description = "department.{$eventName}";
        }
    }
}
