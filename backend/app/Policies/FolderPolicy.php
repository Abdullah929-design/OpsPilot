<?php

namespace App\Policies;

use App\Models\Folder;
use App\Models\User;

class FolderPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('documents.view');
    }

    public function view(User $user, Folder $folder): bool
    {
        return (int) $user->company_id === (int) $folder->company_id && $user->can('documents.view');
    }

    public function create(User $user): bool
    {
        return $user->can('folders.manage');
    }

    public function update(User $user, Folder $folder): bool
    {
        return (int) $user->company_id === (int) $folder->company_id && $user->can('folders.manage');
    }

    public function delete(User $user, Folder $folder): bool
    {
        return (int) $user->company_id === (int) $folder->company_id && $user->can('folders.manage');
    }
}
