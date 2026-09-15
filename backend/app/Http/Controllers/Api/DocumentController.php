<?php

namespace App\Http\Controllers\Api;

use App\Events\DocumentUploaded;
use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\UploadDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Http\Requests\MoveDocumentRequest;
use App\Models\Document;
use App\Services\DocumentService;
use App\Services\SearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Resources\DocumentResource;

class DocumentController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private DocumentService $documentService,
        private SearchService $searchService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Document::class);

        $companyId = $request->user()->company_id;
        $filters = $request->only(['q', 'category_id', 'folder_id', 'uploaded_by', 'employee_id', 'extension', 'date_from', 'date_to', 'per_page']);

        $documents = $this->searchService->searchDocuments($companyId, $filters);

         return ResponseHelper::success('Documents retrieved successfully.', [
            'items' => DocumentResource::collection($documents->items()),
            'pagination' => [
                'total' => $documents->total(),
                'per_page' => $documents->perPage(),
                'current_page' => $documents->currentPage(),
                'last_page' => $documents->lastPage(),
            ],
        ]);    }

    public function store(UploadDocumentRequest $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $userId = $request->user()->id;

        $document = $this->documentService->createDocument(
            $request->file('file'),
            $request->validated(),
            $companyId,
            $userId
        );

          event(new DocumentUploaded($document)); // Dispatch event

         return ResponseHelper::success('Document uploaded successfully.', new DocumentResource($document), 201);


    }

    public function show($id): JsonResponse
    {
        // Fetch including soft-deleted documents to support viewing/restoring
        $document = Document::withTrashed()->findOrFail($id);
        $this->authorize('view', $document);

        $document->load(['folder', 'category', 'uploader', 'versions.uploader', 'tags', 'employees']);

        return ResponseHelper::success('Document details retrieved.', new DocumentResource($document));

    }

    public function update(UpdateDocumentRequest $request, Document $document): JsonResponse
    {
        $this->authorize('update', $document);

        $document->update($request->validated());

        if ($request->has('tags')) {
            $this->documentService->syncTags($document, $request->tags, $request->user()->company_id);
        }

        return ResponseHelper::success('Document metadata updated successfully.', new DocumentResource($document->load('tags')));

    }

    public function destroy(Document $document): JsonResponse
    {
        $this->authorize('delete', $document);

        $document->delete();

        return ResponseHelper::success('Document deleted successfully.');
    }

    public function restore($id): JsonResponse
    {
        $document = Document::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $document);

        $document->restore();

        return ResponseHelper::success('Document restored successfully.', new DocumentResource($document));

    }

    public function download(Document $document): mixed
    {
        $this->authorize('download', $document);

        if (!Storage::disk('local')->exists($document->file_path)) {
            return ResponseHelper::error('File not found on storage.', [], 404);
        }

         // Verify SHA256 checksum integrity
        $fullPath = Storage::disk('local')->path($document->file_path);
        if (hash_file('sha256', $fullPath) !== $document->checksum) {
            return ResponseHelper::error('File checksum mismatch. Storage file may be corrupted.', [], 409);
        }

         activity('activity')
            ->causedBy(auth()->user())
            ->performedOn($document)
            ->withProperties([
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ])
            ->log('document.downloaded');


        

        return Storage::disk('local')->download($document->file_path, $document->file_name);

    }

    public function preview(Document $document): mixed
    {
        $this->authorize('view', $document);

        $previewPath = $this->documentService->getOrCreatePreviewPdf($document);
        if (!$previewPath || !Storage::disk('local')->exists($previewPath)) {           return ResponseHelper::error('Preview not available for this document.', [], 404);
        }

        $fileName = pathinfo($previewPath, PATHINFO_BASENAME);
        $mimeType = str_contains($previewPath, '.pdf') ? 'application/pdf' : $document->mime_type;

        return response()->file(Storage::disk('local')->path($previewPath), [
            'Content-Type' => $mimeType,
           'Content-Disposition' => 'inline; filename="' . $fileName . '"'
        ]);
    }

    public function move(MoveDocumentRequest $request, Document $document): JsonResponse
    {
        $this->authorize('update', $document);

        $updated = $this->documentService->moveDocument($document, $request->folder_id);

        return ResponseHelper::success('Document moved successfully.', new DocumentResource($updated));

    }

    public function copy(MoveDocumentRequest $request, Document $document): JsonResponse
    {
        $this->authorize('create', Document::class);

        $userId = $request->user()->id;
        $copied = $this->documentService->copyDocument($document, $request->folder_id, $userId);

        return ResponseHelper::success('Document copied successfully.', new DocumentResource($copied), 201);

    }

    public function suggestMetadata(Document $document, \App\Actions\Documents\SuggestDocumentMetadataAction $action): JsonResponse
    {
        $this->authorize('update', $document);

        // Ensure text extraction has run; if not, execute it inline synchronously for immediate response
        if (empty($document->content_text)) {
            $extractor = new \App\Actions\ExtractDocumentTextAction();
            $extractor->execute($document);
            $document->refresh();
        }

        $suggestions = $action->execute($document);

        return ResponseHelper::success('Metadata suggestions generated.', $suggestions);
    }
}
