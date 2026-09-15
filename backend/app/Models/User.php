<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Traits\LogsActivity; // <-- Add
use Spatie\Activitylog\LogOptions; // <-- Add
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Role;

#[Fillable(['name', 'email', 'password', 'avatar', 'is_active', 'preferences'])]
#[Hidden(['password', 'remember_token'])]

class User extends Authenticatable
{
     use HasApiTokens, HasFactory, Notifiable, SoftDeletes, LogsActivity;
    
    use HasRoles {
        hasPermissionTo as spatieHasPermissionTo;
    }

    protected $guard_name = 'web';

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
            'preferences' => 'array',
        ];
    }

    public function companyMemberships()
    {
        return $this->belongsToMany(Company::class, 'company_memberships')
                    ->withPivot('role', 'is_active')
                    ->withTimestamps();
    }

    public function permissionDenials()
    {
        return $this->hasMany(UserPermissionDenial::class);
    }

    public function hasPermissionTo($permission, ?string $guardName = null): bool
    {
        try {
            // Resolve the permission name using Spatie's built-in filtering (handles strings, IDs, models)
            $permissionName = $this->filterPermission($permission, $guardName)->name;
        } catch (\Spatie\Permission\Exceptions\PermissionDoesNotExist $e) {
            return false;
        }

        // Check if there is an explicit denial for this permission and company
        $isDenied = $this->permissionDenials()
            ->where('company_id', $this->company_id)
            ->whereHas('permission', fn ($q) => $q->where('name', $permissionName))
            ->exists();

        if ($isDenied) {
            return false; // Explicit deny takes precedence
        }

        // Resolve active company membership role
        $membership = DB::table('company_memberships')
            ->where('user_id', $this->id)
            ->where('company_id', $this->company_id)
            ->first();

        if (!$membership || !$membership->is_active) {
            return false;
        }

        // Lookup the Spatie Role matching the membership role name for this company context
        $role = Role::where('name', $membership->role)
            ->where('company_id', $this->company_id)
            ->first();

        return $role ? $role->hasPermissionTo($permissionName) : false;
    }

    public function hasRole($roles, ?string $guard = null): bool
    {
        // Resolve active company membership role
        $membership = DB::table('company_memberships')
            ->where('user_id', $this->id)
            ->where('company_id', $this->company_id)
            ->first();

        if (!$membership || !$membership->is_active) {
            return false;
        }

        if (is_array($roles)) {
            return in_array($membership->role, $roles);
        }

        if (is_string($roles)) {
            return $membership->role === $roles;
        }

        if ($roles instanceof Role) {
            return $membership->role === $roles->name;
        }

        if ($roles instanceof \Illuminate\Support\Collection) {
            return $roles->contains('name', $membership->role);
        }

        return false;
    }




    // --- Auto-Logging Options ---
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'avatar', 'is_active', 'preferences']) // Exclude 'password'
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs()
            ->useLogName('audit');
    }

    public function tapActivity(\Spatie\Activitylog\Models\Activity $activity, string $eventName)
    {
        $activity->properties = $activity->properties->merge([
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        if ($eventName === 'created') {
            $activity->log_name = 'activity';
            $activity->description = 'created';
        } elseif ($eventName === 'updated') {
            $dirty = $this->getDirty();
            if (array_key_exists('is_active', $dirty)) {
                $activity->log_name = 'audit';
                $activity->description = $this->is_active ? 'activated' : 'deactivated';
            } else {
                $activity->log_name = 'audit';
                $activity->description = 'updated';
            }
        } else {
            $activity->log_name = 'audit';
            $activity->description = $eventName; // 'deleted'
        }
    }

    
}
