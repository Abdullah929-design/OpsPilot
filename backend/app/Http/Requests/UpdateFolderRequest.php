<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFolderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('folders.manage');
    }

    public function rules(): array
    {
        $folderId = $this->route('folder') ?? $this->route('id');
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
                })->ignore($folderId)
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

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $folderId = $this->route('folder') ?? $this->route('id');
            $parentId = $this->parent_id;

            if ($folderId && $parentId) {
                // Prevent self-parenting
                if ((int) $folderId === (int) $parentId) {
                    $validator->errors()->add('parent_id', 'A folder cannot be its own parent.');
                    return;
                }

                // Prevent circular referencing (moving under a descendant)
                $parentFolder = \App\Models\Folder::find($parentId);
                while ($parentFolder) {
                    if ((int) $parentFolder->parent_id === (int) $folderId) {
                        $validator->errors()->add('parent_id', 'A folder cannot be moved under one of its own subfolders.');
                        return;
                    }
                    $parentFolder = $parentFolder->parent;
                }
            }
        });
    }
}
