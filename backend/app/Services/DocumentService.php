<?php

namespace App\Services;

use App\Models\Document;
use App\Models\DocumentVersion;
use App\Models\Tag;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class DocumentService
{
    public function __construct(private UploadService $uploadService) {}

    public function createDocument(UploadedFile $file, array $data, int $companyId, int $userId): Document
    {
        $fileData = $this->uploadService->store($file, $companyId);

        // Filter out tags from input array before creating the document
        $documentData = collect($data)->except('tags')->toArray();

// Automatically handle duplicate titles in the same folder scope

$title = $documentData['title'] ?? 'Untitled';
        $folderId = $documentData['folder_id'] ?? null;
        $originalTitle = $title;
        $counter = 2;

        while (Document::where('company_id', $companyId)
            ->where('folder_id', $folderId)
            ->where('title', $title)
            ->exists()) {
            $title = $originalTitle . " ({$counter})";
            $counter++;
        }
        $documentData['title'] = $title;




        $document = Document::create(array_merge($documentData, $fileData, [
            'company_id'      => $companyId,
            'uploaded_by'     => $userId,
            'current_version' => 1,
            'status'          => 'active',
        ]));

        // Create version 1 record
        DocumentVersion::create([
            'document_id' => $document->id,
            'version'     => 1,
            'file_name'   => $fileData['file_name'],
            'file_path'   => $fileData['file_path'],
            'mime_type'   => $fileData['mime_type'],
            'size'        => $fileData['size'],
            'checksum'    => $fileData['checksum'],
            'uploaded_by' => $userId,
        ]);

        // Sync tags if provided
        if (isset($data['tags'])) {
            $this->syncTags($document, $data['tags'], $companyId);
        }

        dispatch(new \App\Jobs\ExtractDocumentTextJob($document));
        return $document->load(['folder', 'category', 'uploader', 'versions', 'tags']);
    }

    public function moveDocument(Document $document, ?int $folderId): Document
    {
        $document->update(['folder_id' => $folderId]);
        return $document;
    }

    public function copyDocument(Document $document, ?int $targetFolderId, int $userId): Document
    {
        $oldPath = $document->file_path;
        $extension = pathinfo($oldPath, PATHINFO_EXTENSION);
        $newPath = "companies/{$document->company_id}/documents/" . Str::random(40) . "." . $extension;

        // Duplicate the latest version file on disk
        Storage::disk('local')->copy($oldPath, $newPath);

        // Create the copied Document record
        $newDocument = new Document([
            'company_id'      => $document->company_id,
            'folder_id'       => $targetFolderId,
            'category_id'     => $document->category_id,
            'title'           => $document->title . ' (Copy)',
            'description'     => $document->description,
            'file_name'       => $document->file_name,
            'file_path'       => $newPath,
            'mime_type'       => $document->mime_type,
            'extension'       => $document->extension,
            'size'            => $document->size,
            'checksum'        => $document->checksum,
            'status'          => 'active',
            'current_version' => 1,
            'uploaded_by'     => $userId,
        ]);
         $newDocument->is_copy_action = true;
         $newDocument->save();

        // Create the Version 1 record for the copy
        DocumentVersion::create([
            'document_id' => $newDocument->id,
            'version'     => 1,
            'file_name'   => $newDocument->file_name,
            'file_path'   => $newDocument->file_path,
            'mime_type'   => $newDocument->mime_type,
            'size'        => $newDocument->size,
            'checksum'    => $newDocument->checksum,
            'uploaded_by' => $userId,
        ]);

        // Sync tags
        $tagIds = $document->tags()->pluck('tags.id')->toArray();
        $newDocument->tags()->sync($tagIds);

        return $newDocument->load(['folder', 'category', 'uploader', 'versions', 'tags']);
    }

        public function syncTags(Document $document, array $tagNames, int $companyId): void
    {
        $oldTags = $document->tags()->pluck('name')->toArray();
        $tagIds = collect($tagNames)->map(fn($name) =>
            Tag::firstOrCreate(['name' => $name, 'company_id' => $companyId])->id
        );

        $changes = $document->tags()->sync($tagIds);

        // If any tags were attached or detached, log metadata change
        if (count($changes['attached']) > 0 || count($changes['detached']) > 0) {
            activity('audit')
                ->performedOn($document)
                ->causedBy(auth()->user())
                ->withProperties([
                    'old_tags'   => $oldTags,
                    'new_tags'   => $tagNames,
                    'ip_address' => request()->ip(),
                    'user_agent' => request()->userAgent(),
                ])
                ->log('document.metadata_changed');
        }
    }
    public function getOrCreatePreviewPdf(Document $document): ?string
    {
        $extension = strtolower($document->extension);
        $previewableTypes = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'];

        // If already PDF or image, return original path
        if (in_array($extension, $previewableTypes)) {
            return $document->file_path;
        }

        $companyId = $document->company_id;
        $previewDirectory = "companies/{$companyId}/previews";
        $previewFileName = "{$document->id}.pdf";
        $previewRelativePath = "{$previewDirectory}/{$previewFileName}";

        // Return cached preview if it already exists
        if (Storage::disk('local')->exists($previewRelativePath)) {
            return $previewRelativePath;
        }

        // Verify original file exists
        if (!Storage::disk('local')->exists($document->file_path)) {
            return null;
        }
        // Resolve full paths and normalize separators (Windows backslash compatibility)
        $sourceFullPath = str_replace('/', DIRECTORY_SEPARATOR, Storage::disk('local')->path($document->file_path));
        // Verify SHA256 checksum integrity of source file
        if (hash_file('sha256', $sourceFullPath) !== $document->checksum) {
            \Log::error("Document checksum mismatch. Source file may be corrupted: {$document->id}");
            return null;        }

        // Isolated temp directory for this specific conversion to avoid race conditions
        $tempDirRelative = "{$previewDirectory}/tmp_{$document->id}";
        $outputFullDirectory = str_replace('/', DIRECTORY_SEPARATOR, Storage::disk('local')->path($tempDirRelative));
        $finalPreviewDirFull = str_replace('/', DIRECTORY_SEPARATOR, Storage::disk('local')->path($previewDirectory));
        if (!file_exists($outputFullDirectory)) {
            mkdir($outputFullDirectory, 0755, true);
        }

        $libreofficePath = str_replace('/', DIRECTORY_SEPARATOR, env('LIBREOFFICE_PATH', 'soffice'));

        // Command to convert Office file to PDF headlessly
        $command = sprintf(
            '"%s" --headless --convert-to pdf --outdir "%s" "%s" 2>&1',
            $libreofficePath,
            $outputFullDirectory,
            $sourceFullPath
        );

        exec($command, $output, $returnVar);

        if ($returnVar !== 0) {
            \Log::error("LibreOffice conversion failed. Command: {$command}. Output: " . implode("\n", $output));
            if (file_exists($outputFullDirectory)) {
                @rmdir($outputFullDirectory);
            }
            return null;
        }

        // Find the generated PDF file in the isolated temp directory
        $files = glob("{$outputFullDirectory}/*.pdf");
        if (!empty($files)) {
            $generatedPdfPath = $files[0];
            $cachedFullPath = "{$finalPreviewDirFull}/{$previewFileName}";
            
            // Rename to cache and clean up
            rename($generatedPdfPath, $cachedFullPath);
            @unlink($generatedPdfPath);
            @rmdir($outputFullDirectory);
            
            return $previewRelativePath;
        }

        // Cleanup empty temp directory if PDF wasn't found
        if (file_exists($outputFullDirectory)) {
            @rmdir($outputFullDirectory);
        }

        return null;
    }


}
