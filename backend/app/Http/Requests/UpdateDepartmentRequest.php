<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDepartmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('departments.update');
    }

    public function rules(): array
    {
        $departmentId = $this->route('department')->id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('departments')
                    ->ignore($departmentId)
                    ->where(fn ($query) => $query->where('company_id', $this->user()->company_id)),
            ],
            'description' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
        ];
    }
}
