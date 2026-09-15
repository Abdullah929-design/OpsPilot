<?php

namespace App\Services;

use App\Models\Employee;
use App\Models\User;
use App\Enums\EmploymentStatus;
use Exception;

class EmployeeService
{
    /**
     * Create an employee record.
     *
     * @throws Exception
     */
    public function createEmployee(array $data): Employee
    {
        // Cycle check
        $managerId = $data['manager_id'] ?? null;
        if ($managerId) {
            $manager = Employee::findOrFail($managerId);
            if ($manager->company_id !== $data['company_id']) {
                throw new Exception('The selected manager must belong to the same company.');
            }
             if (!$manager->designation || !$manager->designation->is_manager) {
                throw new Exception('The selected manager must hold a manager-eligible designation.');
            }
        }


        // Sourcing identity fields if user_id is provided
        if (!empty($data['user_id'])) {
            $user = User::findOrFail($data['user_id']);
            $parts = explode(' ', $user->name, 2);
            $data['first_name'] = $parts[0];
            $data['last_name'] = $parts[1] ?? '';
            $data['email'] = $user->email;
            $data['profile_photo'] = $user->avatar;
        }

        return Employee::create($data);
    }

    /**
     * Update an employee record.
     *
     * @throws Exception
     */
        public function updateEmployee(Employee $employee, array $data): Employee
    {
        $statusChangedToTerminated = isset($data['employment_status']) 
            && $data['employment_status'] === EmploymentStatus::TERMINATED->value
            && $employee->employment_status !== EmploymentStatus::TERMINATED;

         $statusChangedToActive = isset($data['employment_status'])
            && $data['employment_status'] === EmploymentStatus::ACTIVE->value
            && $employee->employment_status !== EmploymentStatus::ACTIVE;

        if ($statusChangedToTerminated) {
            $this->checkDirectReports($employee);
        }


        // Cycle check if manager_id is being updated
        if (isset($data['manager_id'])) {
            $this->checkManagerCycle($employee, $data['manager_id']);
            if ($data['manager_id']) {
                $manager = Employee::findOrFail($data['manager_id']);
                if ($manager->company_id !== $employee->company_id) {
                    throw new Exception('The selected manager must belong to the same company.');
                }
                if (!$manager->designation || !$manager->designation->is_manager) {
                throw new Exception('The selected manager must hold a manager-eligible designation.');
            }

            }
        }

        // Sourcing identity fields if user_id is set
        $userId = $data['user_id'] ?? $employee->user_id;
        if ($userId) {
            $user = User::findOrFail($userId);
            $parts = explode(' ', $user->name, 2);
            $data['first_name'] = $parts[0];
            $data['last_name'] = $parts[1] ?? '';
            $data['email'] = $user->email;
            $data['profile_photo'] = $user->avatar;
        }

        $employee->update($data);

        // Auto-deactivate linked user access on termination
        if ($statusChangedToTerminated && $employee->user_id) {
            $user = User::find($employee->user_id);
            if ($user) {
                app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId($employee->company_id);
                 if ($user->can('permissions.manage')) {
                    $activeAdminsCount = User::permission('permissions.manage')
                        ->whereHas('companyMemberships', function ($q) use ($employee) {
                            $q->where('companies.id', $employee->company_id)
                              ->where('company_memberships.is_active', true);
                        })
                        ->count();
                    if ($activeAdminsCount <= 1) {
                        throw new Exception('Cannot terminate this employee because their linked user is the last remaining active permission manager of the company.');
                    }
                }                $user->companyMemberships()->updateExistingPivot($employee->company_id, ['is_active' => false]);
            }
        }
        // Auto-reactivate linked user access on status changing back to active
        if ($statusChangedToActive && $employee->user_id) {
            $employee->user->companyMemberships()->updateExistingPivot($employee->company_id, ['is_active' => true]);
        }


        return $employee;
    }

    /**
     * Delete an employee record.
     *
     * @throws Exception
     */
    public function deleteEmployee(Employee $employee): bool
    {
        $this->checkDirectReports($employee);

        $userId = $employee->user_id;
        $companyId = $employee->company_id;

        // Verify if linked user is the last active Super Admin before deleting the employee
        if ($userId) {
            $user = User::find($userId);
            if ($user) {
                app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId($companyId);
                 if ($user->can('permissions.manage')) {
                    $activeAdminsCount = User::permission('permissions.manage')
                        ->whereHas('companyMemberships', function ($q) use ($companyId) {
                            $q->where('companies.id', $companyId)
                              ->where('company_memberships.is_active', true);
                        })
                        ->count();
                    if ($activeAdminsCount <= 1) {
                        throw new Exception('Cannot delete this employee because their linked user is the last remaining active permission manager of the company.');
                    }
                }
            }
        }

        $employee->delete();

        return true;
    }

    /**
     * Restore a deleted employee.
     */
    public function restoreEmployee(Employee $employee): Employee
    {
        $employee->restore();
        return $employee;
    }

    /**
     * Check if the manager selection creates a loop.
     *
     * @throws Exception
     */
    protected function checkManagerCycle(Employee $employee, ?int $managerId): void
    {
        if (!$managerId) {
            return;
        }

        if ($employee->id === $managerId) {
            throw new Exception('An employee cannot be their own manager.');
        }

        $currentManager = Employee::find($managerId);
        while ($currentManager) {
            if ($currentManager->id === $employee->id) {
                throw new Exception('Circular manager reference detected. This manager choice would create a cycle.');
            }
            $currentManager = $currentManager->manager;
        }
    }

    /**
     * Check if the employee has active direct reports.
     *
     * @throws Exception
     */
    protected function checkDirectReports(Employee $employee): void
    {
        if ($employee->directReports()->exists()) {
            throw new Exception('Cannot terminate or delete an employee who has direct reports. Please reassign their direct reports first.');
        }
    }
}
