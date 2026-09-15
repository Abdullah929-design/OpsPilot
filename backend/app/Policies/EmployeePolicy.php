<?php

namespace App\Policies;

use App\Models\Employee;
use App\Models\User;

class EmployeePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('employees.view');
    }

    public function view(User $user, Employee $employee): bool
    {
        return (int) $user->company_id === (int) $employee->company_id && $user->can('employees.view');
    }

    public function create(User $user): bool
    {
        return $user->can('employees.create');
    }

    public function update(User $user, Employee $employee): bool
    {
        return (int) $user->company_id === (int) $employee->company_id && $user->can('employees.update');
    }

    public function delete(User $user, Employee $employee): bool
    {
        return (int) $user->company_id === (int) $employee->company_id && $user->can('employees.delete');
    }

    public function restore(User $user, Employee $employee): bool
    {
        return (int) $user->company_id === (int) $employee->company_id && $user->can('employees.create');
    }
}
