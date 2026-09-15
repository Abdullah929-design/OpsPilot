<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use App\Models\Setting;

class PasswordPolicyRule implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // Load settings from the DB
        $policyJson = Setting::where('key', 'password_policy')->value('value');
        $policy = $policyJson ? json_decode($policyJson, true) : null;

        $minLength = $policy['min_length'] ?? 8;
        $requireSpecial = $policy['require_special'] ?? false;
        $requireNumbers = $policy['require_numbers'] ?? false;

        if (strlen($value) < $minLength) {
            $fail("The password must be at least {$minLength} characters.");
        }

        if ($requireSpecial && !preg_match('/[^a-zA-Z0-9]/', $value)) {
            $fail("The password must contain at least one special character.");
        }

        if ($requireNumbers && !preg_match('/[0-9]/', $value)) {
            $fail("The password must contain at least one number.");
        }
    }
}
