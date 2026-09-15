<?php

namespace App\Models;

use Spatie\Permission\Models\Role as SpatieRole;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Role extends SpatieRole
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name'])
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('audit');
    }

    public function tapActivity(\Spatie\Activitylog\Models\Activity $activity, string $eventName)
    {
        $activity->description = $eventName;
        $activity->properties = $activity->properties->merge([
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
