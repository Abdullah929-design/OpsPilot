<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UploadService
{
    public function store(UploadedFile $file, int $companyId): array
    {
        $extension = $file->getClientOriginalExtension();
        $fileName  = $file->getClientOriginalName();
        $path      = $file->store("companies/{$companyId}/documents", 'local');
        $checksum  = hash_file('sha256', $file->getRealPath());

        return [
            'file_name' => $fileName,
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'extension' => $extension,
            'size'      => $file->getSize(),
            'checksum'  => $checksum,
        ];
    }

    public function delete(string $path): void
    {
        Storage::disk('local')->delete($path);
    }

    public function allowedMimes(): array
    {
        return [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/zip',
        ];
    }

    public function maxSizeMb(): int
    {
        return 50;
    }
}
