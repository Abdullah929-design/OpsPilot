<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('employees.update');
    }

    public function rules(): array
    {
        $companyId = $this->user()->company_id;
        $employeeId = $this->route('employee')->id;

        return [
            'user_id' => [
                'nullable',
                'integer',
                Rule::unique('employees', 'user_id')->ignore($employeeId)->where('company_id', $companyId),
                Rule::exists('company_memberships', 'user_id')->where('company_id', $companyId),
            ],
            'department_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('departments', 'id')
                    ->where('company_id', $companyId)
                    ->where('status', 'active')
                    ->whereNull('deleted_at'),
            ],
            'team_id' => [
                'nullable',
                'integer',
                Rule::exists('teams', 'id')
                    ->where('status', 'active')
                    ->whereNull('deleted_at'),
            ],
            'designation_id' => [
                'sometimes',
                'required',
                'integer',
                Rule::exists('designations', 'id')
                    ->where('company_id', $companyId)
                    ->where('status', 'active')
                    ->whereNull('deleted_at'),
            ],
            'office_location_id' => [
                'nullable',
                'integer',
                Rule::exists('office_locations', 'id')
                    ->where('company_id', $companyId)
                    ->where('status', 'active')
                    ->whereNull('deleted_at'),
            ],
            'manager_id' => [
                'nullable',
                'integer',
                Rule::exists('employees', 'id')
                    ->where('company_id', $companyId)
                    ->whereNull('deleted_at'),
            ],
            'employee_code' => [
                'sometimes',
                'required',
                'string',
                'max:255',
                Rule::unique('employees', 'employee_code')->ignore($employeeId)->where('company_id', $companyId),
            ],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('employees', 'email')->ignore($employeeId)->where('company_id', $companyId),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date'],
            'joining_date' => ['sometimes', 'required', 'date'],
            'employment_type' => ['sometimes', 'required', 'string', 'in:full_time,part_time,contract,intern'],
            'employment_status' => ['sometimes', 'required', 'string', 'in:active,inactive,terminated'],
            'profile_photo' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
        ];
    }
}
