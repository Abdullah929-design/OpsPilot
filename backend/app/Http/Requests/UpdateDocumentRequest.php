<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $document = $this->route('document');
        return $document ? $this->user()->can('update', $document) : $this->user()->can('documents.update');
    }

    public function rules(): array
    {
        $companyId = $this->user()->company_id;

        return [
            'title'       => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'folder_id' => [
                'nullable',
                'integer',
                Rule::exists('folders', 'id')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                })
            ],
            'category_id' => [
                'nullable',
                'integer',
                Rule::exists('document_categories', 'id')->where(function ($query) use ($companyId) {
                    return $query->where('company_id', $companyId);
                })
            ],
            'tags'        => ['nullable', 'array'],
            'tags.*'      => ['string', 'max:100'],
        ];
    }
}
