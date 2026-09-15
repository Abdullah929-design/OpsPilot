<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Designation extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = ['company_id', 'title', 'status','is_manager','is_system'];


    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['title', 'status','is_manager','is_system'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('activity');
    }

    public function tapActivity($activity, string $eventName)
    {
        $activity->log_name = 'activity';
        $activity->description = "designation.{$eventName}";
        $activity->properties = $activity->properties->merge([
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
