<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'company_id'      => $this->company_id,
            'folder_id'       => $this->folder_id,
            'category_id'     => $this->category_id,
            'title'           => $this->title,
            'description'     => $this->description,
            'file_name'       => $this->file_name,
            'file_path'       => $this->file_path,
            'mime_type'       => $this->mime_type,
            'extension'       => $this->extension,
            'size'            => (int) $this->size,
            'checksum'        => $this->checksum,
            'status'          => $this->status,
            'current_version' => (int) $this->current_version,
            'uploaded_by'     => $this->uploaded_by,
            'created_at'      => $this->created_at?->toIso8601String(),
            'updated_at'      => $this->updated_at?->toIso8601String(),

            'versions_count'  => $this->versions_count ?? $this->versions()->count(),

            'folder' => $this->relationLoaded('folder') && $this->folder ? [
                'id'   => $this->folder->id,
                'name' => $this->folder->name,
            ] : null,

            'category' => $this->relationLoaded('category') && $this->category ? [
                'id'   => $this->category->id,
                'name' => $this->category->name,
            ] : null,

            'uploader' => $this->relationLoaded('uploader') && $this->uploader ? [
                'id'   => $this->uploader->id,
                'name' => $this->uploader->name,
            ] : null,

            'tags' => $this->relationLoaded('tags') ? $this->tags->map(fn($t) => [
                'id'   => $t->id,
                'name' => $t->name,
            ]) : [],

            'employees' => $this->relationLoaded('employees') ? $this->employees->map(fn($e) => [
                'id'   => $e->id,
                'name' => $e->first_name . ' ' . $e->last_name,
            ]) : [],
        ];
    }
}
