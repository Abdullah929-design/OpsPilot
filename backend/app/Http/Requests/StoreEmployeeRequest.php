<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('employees.create');
    }

    public function rules(): array
    {
        $companyId = $this->user()->company_id;

        return [
            'user_id' => [
                'nullable',
                'integer',
                Rule::unique('employees', 'user_id')->where('company_id', $companyId),
                Rule::exists('company_memberships', 'user_id')->where('company_id', $companyId),
            ],
            'department_id' => [
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
                'required',
                'string',
                'max:255',
                Rule::unique('employees', 'employee_code')->where('company_id', $companyId),
            ],
            'first_name' => ['required_without:user_id', 'nullable', 'string', 'max:255'],
            'last_name' => ['required_without:user_id', 'nullable', 'string', 'max:255'],
            'email' => [
                'required_without:user_id',
                'nullable',
                'email',
                'max:255',
                Rule::unique('employees', 'email')->where('company_id', $companyId),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date'],
            'joining_date' => ['required', 'date'],
            'employment_type' => ['required', 'string', 'in:full_time,part_time,contract,intern'],
            'employment_status' => ['required', 'string', 'in:active,inactive,terminated'],
            'profile_photo' => ['nullable', 'string'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
        ];
    }
}
