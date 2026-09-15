<?php

namespace App\Services;

use App\Models\CompanySetting;

class SettingService
{
    public function get(int $companyId, string $key, $default = null)
    {
        return CompanySetting::where('company_id', $companyId)->where('key', $key)->value('value') ?? $default;
    }

    public function set(int $companyId, string $key, $value): void
    {
        $oldValue = $this->get($companyId, $key);

        // Standardize value format to compare (arrays vs string representations)
        $normalizedOld = is_array(json_decode($oldValue, true)) ? json_decode($oldValue, true) : $oldValue;
        $normalizedNew = is_array($value) ? $value : $value;

        if ($normalizedOld !== $normalizedNew) {
            $dbValue = is_array($value) ? json_encode($value) : $value;

            CompanySetting::updateOrCreate(
                ['company_id' => $companyId, 'key' => $key],
                ['value' => $dbValue]
            );

            // Log change manually as an audit log entry
            activity('audit')
                ->withProperties([
                    'key' => $key,
                    'old' => $normalizedOld,
                    'new' => $normalizedNew,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent()
                ])
                ->log('company_settings.changed');
        }
    }

    public function all(int $companyId): array
    {
        return CompanySetting::where('company_id', $companyId)
            ->pluck('value', 'key')
            ->map(function ($value) {
                // Decode JSON values automatically (for arrays like working_days, weekend)
                $decoded = json_decode($value, true);
                return is_array($decoded) ? $decoded : $value;
            })
            ->toArray();
    }
}
