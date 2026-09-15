<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDesignationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('designations.manage');
    }

    public function rules(): array
    {
        $designationId = $this->route('designation')->id;

        return [
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('designations')
                    ->ignore($designationId)
                    ->where(fn ($query) => $query->where('company_id', $this->user()->company_id)),
            ],
                        'status' => ['nullable', 'string', 'in:active,inactive'],
            'is_manager' => ['nullable', 'boolean'],
            'is_system' => ['nullable', 'boolean'],

        ];
    }
}
