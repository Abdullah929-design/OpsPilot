<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'preferences' => ['nullable', 'array'],
            'preferences.theme' => ['nullable', 'string', 'in:light,dark,system'],
            'preferences.email_notifications' => ['nullable', 'boolean'],
            'preferences.browser_notifications' => ['nullable', 'boolean'],
        ];
    }
}
