<?php

namespace App\Http\Requests;

use App\Rules\ValidSubdomain;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSubdomainRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        // Resolve company parameter (handles route model binding or ID parameter fallback)
        $company = $this->route('company');
        $companyId = $company instanceof \App\Models\Company ? $company->id : $company;

        return [
            'subdomain' => [
                'required',
                'string',
                new ValidSubdomain,
                Rule::unique('companies', 'subdomain')->ignore($companyId),
            ],
        ];
    }
}
