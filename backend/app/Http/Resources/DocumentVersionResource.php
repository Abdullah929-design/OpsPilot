<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentVersionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'document_id' => $this->document_id,
            'version'     => (int) $this->version,
            'file_name'   => $this->file_name,
            'size'        => (int) $this->size,
            'mime_type'   => $this->mime_type,
            'checksum'    => $this->checksum,
            'uploaded_by' => $this->uploaded_by,
            'created_at'  => $this->created_at?->toIso8601String(),

            'uploader' => $this->relationLoaded('uploader') && $this->uploader ? [
                'id'   => $this->uploader->id,
                'name' => $this->uploader->name,
            ] : null,
        ];
    }
}
