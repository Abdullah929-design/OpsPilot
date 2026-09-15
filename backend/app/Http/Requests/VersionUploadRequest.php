<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class VersionUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        $document = $this->route('document');
        return $document ? $this->user()->can('version', $document) : $this->user()->can('documents.version');
    }

    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,jpg,jpeg,png,gif,webp,zip',
                'max:51200'
            ],
        ];
    }
}
