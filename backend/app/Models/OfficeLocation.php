<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class OfficeLocation extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = ['company_id', 'name', 'country', 'city', 'address', 'timezone', 'status'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'country', 'city', 'address', 'timezone', 'status'])
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

        if ($eventName === 'deleted') {
            $activity->log_name = 'audit';
            $activity->description = 'office.deleted';
        } else {
            $activity->log_name = 'activity';
            $activity->description = "office.{$eventName}";
        }
    }
}
