<?php

namespace App\Observers;

use App\Models\User;
use App\Models\Employee;

class UserObserver
{
    public function updated(User $user): void
    {
        $dirty = $user->getDirty();
        $changes = [];

        // Sync name changes
        if (array_key_exists('name', $dirty)) {
            $parts = explode(' ', $user->name, 2);
            $changes['first_name'] = $parts[0];
            $changes['last_name'] = $parts[1] ?? '';
        }

        // Sync email changes
        if (array_key_exists('email', $dirty)) {
            $changes['email'] = $user->email;
        }

        // Sync profile avatar changes
        if (array_key_exists('avatar', $dirty)) {
            $changes['profile_photo'] = $user->avatar;
        }

        if (!empty($changes)) {
            // Update all linked employee records across all company domains
            Employee::where('user_id', $user->id)->update($changes);
        }
    }
}
