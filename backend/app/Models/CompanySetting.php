<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class CompanySetting extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = ['company_id', 'key', 'value'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['key', 'value'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('audit');
    }

    public function tapActivity($activity, string $eventName)
    {
        $activity->log_name = 'audit';
        $activity->description = 'company_settings.changed';
        $activity->properties = $activity->properties->merge([
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
