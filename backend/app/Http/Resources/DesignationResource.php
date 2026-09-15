<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DesignationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
                return [
            'id' => $this->id,
            'company_id' => $this->company_id,
            'title' => $this->title,
            'status' => $this->status,
            'is_manager' => (bool) $this->is_manager,
            'is_system' => (bool) $this->is_system,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];

    }
}
