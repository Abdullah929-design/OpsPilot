<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'user_id' => $this->user_id,
            'department_id' => $this->department_id,
            'team_id' => $this->team_id,
            'designation_id' => $this->designation_id,
            'office_location_id' => $this->office_location_id,
            'manager_id' => $this->manager_id,
            'employee_code' => $this->employee_code,
            'first_name' => $this->first_name,
            'last_name' => $this->last_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'gender' => $this->gender,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'joining_date' => $this->joining_date?->toDateString(),
            'employment_type' => $this->employment_type?->value,
            'employment_status' => $this->employment_status?->value,
            'profile_photo' => $this->profile_photo ? url($this->profile_photo) : null,
            'address' => $this->address,
            'city' => $this->city,
            'country' => $this->country,
            'emergency_contact_name' => $this->emergency_contact_name,
            'emergency_contact_phone' => $this->emergency_contact_phone,
            
            // Nested relations as id+name only
            'department' => $this->department ? [
                'id' => $this->department->id,
                'name' => $this->department->name,
            ] : null,
            'team' => $this->team ? [
                'id' => $this->team->id,
                'name' => $this->team->name,
            ] : null,
            'designation' => $this->designation ? [
                'id' => $this->designation->id,
                'title' => $this->designation->title,
            ] : null,
            'office_location' => $this->officeLocation ? [
                'id' => $this->officeLocation->id,
                'name' => $this->officeLocation->name,
            ] : null,
            'manager' => $this->manager ? [
                'id' => $this->manager->id,
                'name' => $this->manager->first_name . ' ' . $this->manager->last_name,
            ] : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
