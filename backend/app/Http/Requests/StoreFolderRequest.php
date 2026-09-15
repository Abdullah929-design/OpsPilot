<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreFolderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('folders.manage');
    }

    public function rules(): array
    {
        $companyId = $this->user()->company_id;
        $parentId = $this->parent_id;

        return [
            'name' => [
                'required',
                'string',
                'max:255',
                Rule::unique('folders')->where(function ($query) use ($companyId, $parentId) {
                    return $query->where('company_id', $companyId)
                                 ->where('parent_id', $parentId);
                })
            ],
            'parent_id' => [
                'nullable',
                'integer',
                Rule::exists('folders', 'id')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                })
            ],
            'description' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
