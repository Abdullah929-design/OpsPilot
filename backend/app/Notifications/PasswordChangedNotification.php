<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class PasswordChangedNotification extends Notification
{
    public function via(object $notifiable): array
    {
        return ['database'];
    }

        public function toArray(object $notifiable): array
    {
        $companyId = auth()->user()?->company_id ?? (app()->bound('current_tenant_company') ? app('current_tenant_company')->id : null);
        return [
            'company_id' => $companyId,
            'title' => 'Password Changed',
            'message' => 'Your account password was successfully updated.',
            'action_url' => '/profile',
        ];
    }

}
