<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class UserCreatedNotification extends Notification
{
    protected string $creatorName;

    public function __construct(string $creatorName)
    {
        $this->creatorName = $creatorName;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

            public function toArray(object $notifiable): array
    {
        // Use Spatie's team ID context (which is always set to the active company during user creation)
        $companyId = app(\Spatie\Permission\PermissionRegistrar::class)->getPermissionsTeamId();
        
        // Fallback if not set
        if (!$companyId || $companyId === 0) {
            $companyId = auth()->user()?->company_id ?? (app()->bound('current_tenant_company') ? app('current_tenant_company')->id : null);
        }

        return [
            'company_id' => $companyId ? (int)$companyId : null,
            'title' => 'Account Created',
            'message' => "Your account has been created by {$this->creatorName}.",
            'action_url' => '/profile',
        ];
    }


}
