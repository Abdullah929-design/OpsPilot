<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTeamRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->route('team');

        // Verify the team's department belongs to the user's company
        return $this->user()->can('teams.manage') && 
               $team && 
               $team->department->company_id === $this->user()->company_id;
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
