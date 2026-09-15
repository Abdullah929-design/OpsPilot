<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UploadDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('documents.create');
    }

    public function rules(): array
    {
        $companyId = $this->user()->company_id;

        return [
            'file' => [
                'required',
                'file',
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif,webp,zip',
                'max:51200'
            ],
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
