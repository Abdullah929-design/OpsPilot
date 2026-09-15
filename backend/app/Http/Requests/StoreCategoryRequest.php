<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('categories.manage');
    }

    public function rules(): array
    {
        $companyId = $this->user()->company_id;
        $categoryId = $this->route('document_category') ?? $this->route('category') ?? $this->route('id');

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('document_categories')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                })->ignore($categoryId)
            ],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
