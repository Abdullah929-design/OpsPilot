<?php

namespace App\Models;

use App\Enums\EmploymentStatus;
use App\Enums\EmploymentType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Employee extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected static function booted()
    {
        static::deleted(function (Employee $employee) {
            $userId = $employee->user_id;
            $companyId = $employee->company_id;

            if ($userId) {
                $user = User::find($userId);
                if ($user) {
                    $user->companyMemberships()->updateExistingPivot($companyId, ['is_active' => false]);
                }
            }
            // Detach document memberships on delete
          $employee->documents()->detach();
        });

        static::restored(function (Employee $employee) {
            $userId = $employee->user_id;
            $companyId = $employee->company_id;

            if ($userId) {
                $user = User::find($userId);
                if ($user) {
                    $user->companyMemberships()->updateExistingPivot($companyId, ['is_active' => true]);
                }
            }
        });
    }

    protected $fillable = [
        'company_id',
        'user_id',
        'department_id',
        'team_id',
        'designation_id',
        'office_location_id',
        'manager_id',
        'employee_code',
        'first_name',
        'last_name',
        'email',
        'phone',
        'gender',
        'date_of_birth',
        'joining_date',
        'employment_type',
        'employment_status',
        'profile_photo',
        'address',
        'city',
        'country',
        'emergency_contact_name',
        'emergency_contact_phone',
    ];

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'joining_date' => 'date',
            'employment_status' => EmploymentStatus::class,
            'employment_type' => EmploymentType::class,
        ];
    }

    // --- Relationships ---

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function department()
    {
        return $this->belongsTo(Department::class);
    }

    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    public function designation()
    {
        return $this->belongsTo(Designation::class);
    }

    public function officeLocation()
    {
        return $this->belongsTo(OfficeLocation::class);
    }

    public function manager()
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function directReports()
    {
        return $this->hasMany(Employee::class, 'manager_id');
    }

    // --- Activity Log Setup ---

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly([
                'company_id',
                'user_id',
                'department_id',
                'team_id',
                'designation_id',
                'office_location_id',
                'manager_id',
                'employee_code',
                'first_name',
                'last_name',
                'email',
                'phone',
                'gender',
                'date_of_birth',
                'joining_date',
                'employment_type',
                'employment_status',
                'profile_photo',
                'address',
                'city',
                'country',
                'emergency_contact_name',
                'emergency_contact_phone',
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

        if ($eventName === 'updated') {
            $dirty = $this->getDirty();
            if (array_key_exists('manager_id', $dirty) || array_key_exists('employment_status', $dirty)) {
                $activity->log_name = 'audit';
                $activity->description = 'employee.audit_change';
            } else {
                $activity->log_name = 'activity';
                $activity->description = 'employee.updated';
            }
        } else {
            $activity->log_name = 'activity';
            $activity->description = "employee.{$eventName}";
        }
    }

    public function documents()
    {
        return $this->belongsToMany(Document::class, 'document_employee')
            ->withPivot('note')
            ->withTimestamps();
    }
}
