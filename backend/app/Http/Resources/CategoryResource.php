<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'              => $this->id,
            'name'            => $this->name,
            'description'     => $this->description,
            'documents_count' => $this->documents_count ?? $this->documents()->count(),
            'created_at'      => $this->created_at?->toIso8601String(),
        ];
    }
}
