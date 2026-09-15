<?php

namespace App\Models;

use Spatie\Activitylog\Models\Activity as SpatieActivity;

class Activity extends SpatieActivity
{
        protected static function booted()
    {
        static::creating(function ($activity) {
            if ($user = request()->user()) {
                if ($user instanceof \App\Models\PlatformUser) {
                    // For platform operators, dynamically associate the log with the company in the route context
                    $companyId = request()->route('id') ?? request()->route('companyId') ?? request()->input('company_id');
                    if ($companyId && \App\Models\Company::where('id', $companyId)->exists()) {
                        $activity->company_id = $companyId;
                    }
                } else {
                    $activity->company_id = $user->company_id;
                }
            }
        });
    }

}
