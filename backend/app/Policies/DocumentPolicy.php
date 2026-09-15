<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;

class DocumentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('documents.view');
    }

    public function view(User $user, Document $document): bool
    {
        return (int) $user->company_id === (int) $document->company_id && $user->can('documents.view');
    }

    public function create(User $user): bool
    {
        return $user->can('documents.create');
    }

    public function update(User $user, Document $document): bool
    {
        return (int) $user->company_id === (int) $document->company_id && $user->can('documents.update');
    }

    public function delete(User $user, Document $document): bool
    {
        return (int) $user->company_id === (int) $document->company_id && $user->can('documents.delete');
    }

    public function restore(User $user, Document $document): bool
    {
        return (int) $user->company_id === (int) $document->company_id && $user->can('documents.create');
    }

    public function download(User $user, Document $document): bool
    {
        return (int) $user->company_id === (int) $document->company_id && $user->can('documents.download');
    }

    public function version(User $user, Document $document): bool
    {
        return (int) $user->company_id === (int) $document->company_id && $user->can('documents.version');
    }
}
