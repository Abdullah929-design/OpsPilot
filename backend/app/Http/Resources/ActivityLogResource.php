<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ActivityLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
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
            'ip_address' => $this->getExtraProperty('ip_address'),
            'user_agent' => $this->getExtraProperty('user_agent'),
            'meta' => collect($this->properties)->except(['old', 'attributes', 'ip_address', 'user_agent'])->toArray(),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
