<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOfficeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('offices.manage');
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'country' => ['required', 'string', 'max:255'],
            'city' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string'],
            'timezone' => ['nullable', 'string', 'max:50'],
            'status' => ['nullable', 'string', 'in:active,inactive'],
        ];
    }
}
