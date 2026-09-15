<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        $department = $this->route('department');

        // Check permission and verify the department belongs to the user's company
        return $this->user()->can('teams.manage') && 
               $department && 
               $department->company_id === $this->user()->company_id;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
        ];
    }
}
