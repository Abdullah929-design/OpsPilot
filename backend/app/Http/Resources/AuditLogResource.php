<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $changes = $this->changes();
        return [
            'id' => $this->id,
            'user' => $this->causer ? [
                'id' => $this->causer->id,
                'name' => $this->causer->name,
                'email' => $this->causer->email,
            ] : null,
            'action' => $this->description,
            'entity_type' => $this->subject_type,
            'entity_id' => $this->subject_id,
            'old_values' => $changes['old'] ?? null,
            'new_values' => $changes['attributes'] ?? null,
            'ip_address' => $this->getExtraProperty('ip_address'),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
