<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\VersionUploadRequest;
use App\Models\Document;
use App\Models\DocumentVersion;
use App\Services\VersionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Resources\DocumentVersionResource;

class DocumentVersionController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private VersionService $versionService) {}

    public function index(Document $document): JsonResponse
    {
        $this->authorize('view', $document);

        $versions = $document->versions()
            ->with('uploader')
            ->orderByDesc('version')
            ->paginate(10);

        return ResponseHelper::success('Document versions retrieved.', DocumentVersionResource::collection($versions));
    }

    public function store(VersionUploadRequest $request, Document $document): JsonResponse
    {
        $this->authorize('version', $document);

        $userId = $request->user()->id;
        $version = $this->versionService->uploadVersion($document, $request->file('file'), $userId);

        activity('audit')
            ->performedOn($document)
            ->causedBy(auth()->user())
            ->withProperties([
                'version'    => $version->version,
                'file_name'  => $version->file_name,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ])
            ->log('document.version_uploaded');

        return ResponseHelper::success('New version uploaded successfully.', new DocumentVersionResource($version), 201);
    }

    public function download(Document $document, DocumentVersion $version): mixed
    {
        $this->authorize('download', $document);

        if ((int) $version->document_id !== (int) $document->id) {
            abort(404);
        }

        if (!Storage::disk('local')->exists($version->file_path)) {
            return ResponseHelper::error('File not found on storage.', [], 404);
        }

         // Verify SHA256 checksum integrity
        $fullPath = Storage::disk('local')->path($version->file_path);
        if (hash_file('sha256', $fullPath) !== $version->checksum) {
        return ResponseHelper::error('File checksum mismatch. Storage file may be corrupted.', [], 409);
        }
        activity('audit')
            ->performedOn($document)
            ->causedBy(auth()->user())
            ->withProperties([
                'version'    => $version->version,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ])
            ->log('document.version_downloaded');

        return Storage::disk('local')->download($version->file_path, $version->file_name);
    }

    public function restore(Document $document, DocumentVersion $version): JsonResponse
    {
        $this->authorize('version', $document);

        if ((int) $version->document_id !== (int) $document->id) {
            abort(404);
        }

        $userId = auth()->user()->id;
        $newVersion = $this->versionService->restoreVersion($document, $version, $userId);

        activity('audit')
            ->performedOn($document)
            ->causedBy(auth()->user())
            ->withProperties([
                'restored_version' => $version->version,
                'new_version'      => $newVersion->version,
                'ip_address'       => request()->ip(),
                'user_agent'       => request()->userAgent(),
            ])
            ->log('document.version_restored');

        return ResponseHelper::success("Version {$version->version} restored as new version {$newVersion->version} successfully.", new DocumentVersionResource($newVersion));
    }
}
