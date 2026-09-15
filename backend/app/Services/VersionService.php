<?php

namespace App\Services;

use App\Models\Document;
use App\Models\DocumentVersion;
use Illuminate\Http\UploadedFile;

class VersionService
{
    public function __construct(private UploadService $uploadService) {}

    public function uploadVersion(Document $document, UploadedFile $file, int $userId): DocumentVersion
    {
        $fileData   = $this->uploadService->store($file, $document->company_id);
        $newVersion = $document->current_version + 1;

        $version = DocumentVersion::create(array_merge($fileData, [
            'document_id' => $document->id,
            'version'     => $newVersion,
            'uploaded_by' => $userId,
        ]));

        $document->update([
            'current_version' => $newVersion,
            'file_path'       => $fileData['file_path'],
            'file_name'       => $fileData['file_name'],
            'mime_type'       => $fileData['mime_type'],
            'size'            => $fileData['size'],
            'checksum'        => $fileData['checksum'],
        ]);
        dispatch(new \App\Jobs\ExtractDocumentTextJob($document));

        return $version;
    }

    public function restoreVersion(Document $document, DocumentVersion $version, int $userId): DocumentVersion
    {
        $newVersion = $document->current_version + 1;

        // Restore works by copying the metadata of the old version into a new version entry
        $restoredVersion = DocumentVersion::create([
            'document_id' => $document->id,
            'version'     => $newVersion,
            'file_name'   => $version->file_name,
            'file_path'   => $version->file_path, // Reuse the same physical storage path
            'mime_type'   => $version->mime_type,
            'size'        => $version->size,
            'checksum'    => $version->checksum,
            'uploaded_by' => $userId,
        ]);

        $document->update([
            'current_version' => $newVersion,
            'file_path'       => $version->file_path,
            'file_name'       => $version->file_name,
            'mime_type'       => $version->mime_type,
            'size'            => $version->size,
            'checksum'        => $version->checksum,
        ]);

        return $restoredVersion;
    }
}
