<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreDesignationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('designations.manage');
    }

    public function rules(): array
    {
        return [
            'title' => [
                'required',
                'string',
                'max:255',
                Rule::unique('designations')->where(fn ($query) => $query->where('company_id', $this->user()->company_id)),
            ],
                        'status' => ['nullable', 'string', 'in:active,inactive'],
            'is_manager' => ['nullable', 'boolean'],
            'is_system' => ['nullable', 'boolean'],

        ];
    }
}
