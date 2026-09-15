<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Company extends Model
{
    use HasFactory, LogsActivity;

    protected $fillable = [
        'name', 'subdomain', 'legal_name', 'email', 'phone', 'website', 'logo',
        'timezone', 'currency', 'language', 'address', 'city',
        'country', 'postal_code', 'status', 'assigned_manager_id', 'plan_id', 'platform_status'
    ];
    public function scopeBySubdomain($query, string $subdomain)
    {
        return $query->where('subdomain', $subdomain);
    }


    public function departments() { return $this->hasMany(Department::class); }
    public function designations() { return $this->hasMany(Designation::class); }
    public function officeLocations() { return $this->hasMany(OfficeLocation::class); }
    public function settings() { return $this->hasMany(CompanySetting::class); }
    public function users() { return $this->memberships(); }

    public function memberships()
    {
        return $this->belongsToMany(User::class, 'company_memberships')
                    ->withPivot('role', 'is_active')
                    ->withTimestamps();
    }

    public function tenantUsers()
    {
        return $this->memberships();
    }


    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'name', 'subdomain', 'legal_name', 'email', 'phone', 'website', 'logo',
                'timezone', 'currency', 'language', 'address', 'city',
                'country', 'postal_code', 'status'
            ])
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

        // Guard: If it is already a custom platform log, do not overwrite the log name/description
        if ($activity->log_name === 'platform') {
            return;
        }

        if ($eventName === 'updated') {

            $dirty = $this->getDirty();
            if (array_key_exists('timezone', $dirty) || array_key_exists('currency', $dirty)) {
                $activity->log_name = 'audit';
                $activity->description = 'company.' . (array_key_exists('timezone', $dirty) ? 'timezone_changed' : 'currency_changed');
            } else {
                $activity->log_name = 'activity';
                $activity->description = 'company.updated';
            }
        } else {
            $activity->log_name = 'activity';
            $activity->description = "company.{$eventName}";
        }
    }

    public function assignedManager()
    {
        return $this->belongsTo(PlatformUser::class, 'assigned_manager_id');
    }

    public function plan()
    {
        return $this->belongsTo(Plan::class);
    }

    public function accessiblePlatformUsers()
    {
        return $this->belongsToMany(PlatformUser::class, 'company_user');
    }
} // <-- This brace MUST be at the very end of the file to close the Company class
