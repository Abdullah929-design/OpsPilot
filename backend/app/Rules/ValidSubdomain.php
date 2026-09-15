<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class ValidSubdomain implements ValidationRule
{
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        // 1. Lowercase letters, numbers, and hyphens only, no double hyphens, must not start/end with hyphens
        if (!preg_match('/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/', $value)) {
            $fail('Subdomain must be lowercase letters, numbers, and hyphens only.');
            return;
        }

        // 2. Reject reserved subdomains
        $reserved = config('app.reserved_subdomains') ?? [];
        if (in_array(strtolower($value), $reserved)) {
            $fail('This subdomain is reserved.');
        }
    }
}
