<?php

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class RoleAssignedNotification extends Notification
{
    protected array $roles;

    public function __construct(array $roles)
    {
        $this->roles = $roles;
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

            public function toArray(object $notifiable): array
    {
        // Use Spatie's team ID context (which is always set to the active company during role assignment)
        $companyId = app(\Spatie\Permission\PermissionRegistrar::class)->getPermissionsTeamId();
        
        // Fallback if not set
        if (!$companyId || $companyId === 0) {
            $companyId = auth()->user()?->company_id ?? (app()->bound('current_tenant_company') ? app('current_tenant_company')->id : null);
        }

        $rolesStr = implode(', ', $this->roles);
        return [
            'company_id' => $companyId ? (int)$companyId : null,
            'title' => 'Roles Updated',
            'message' => "Your roles have been updated to: {$rolesStr}.",
            'action_url' => '/profile',
        ];
    }

}
