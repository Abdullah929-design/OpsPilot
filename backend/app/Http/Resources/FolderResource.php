<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FolderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'company_id'      => $this->company_id,
            'parent_id'       => $this->parent_id,
            'name'            => $this->name,
            'description'     => $this->description,
            'created_by'      => $this->created_by,
            'children_count'  => $this->children_count ?? $this->children()->count(),
            'documents_count' => $this->documents_count ?? $this->documents()->count(),
            'created_at'      => $this->created_at?->toIso8601String(),
            'children'        => FolderResource::collection(
                $this->relationLoaded('allChildren') ? $this->allChildren : ($this->relationLoaded('children') ? $this->children : [])
            ),
        ];
    }
}
