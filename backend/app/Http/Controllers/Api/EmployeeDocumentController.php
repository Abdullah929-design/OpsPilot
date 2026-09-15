<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Models\Employee;
use App\Models\Document;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class EmployeeDocumentController extends Controller
{
    use AuthorizesRequests;

    /**
     * List all documents linked to the employee.
     */
    public function index(Request $request, Employee $employee): JsonResponse
    {
        $this->authorize('view', $employee);

        if ($employee->company_id !== $request->user()->company_id) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $documents = $employee->documents()->with(['category', 'tags', 'uploader'])->get();

        return ResponseHelper::success('Employee documents retrieved.', DocumentResource::collection($documents));
    }

    /**
     * Attach a document to the employee.
     */
    public function store(Request $request, Employee $employee): JsonResponse
    {
        $this->authorize('update', $employee);

        if ($employee->company_id !== $request->user()->company_id) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $request->validate([
            'document_id' => ['required', 'integer', 'exists:documents,id'],
            'note'        => ['nullable', 'string', 'max:1000'],
        ]);

        $document = Document::where('company_id', $employee->company_id)->findOrFail($request->document_id);

        // Attach using syncWithoutDetaching to avoid duplicate pivot errors
        $employee->documents()->syncWithoutDetaching([
            $document->id => ['note' => $request->note]
        ]);

        // Spatie Activity Logging
        activity('activity')
            ->performedOn($employee)
            ->withProperties([
                'document_id'    => $document->id,
                'document_title' => $document->title,
                'note'           => $request->note,
                'ip_address'     => request()->ip(),
                'user_agent'     => request()->userAgent(),
            ])
            ->log('employee.document_attached');

        return ResponseHelper::success('Document attached to employee successfully.');
    }

    /**
     * Detach a document from the employee.
     */
    public function destroy(Request $request, Employee $employee, $documentId): JsonResponse
    {
        $this->authorize('update', $employee);

        if ($employee->company_id !== $request->user()->company_id) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $employee->documents()->detach($documentId);

        // Spatie Activity Logging
        activity('activity')
            ->performedOn($employee)
            ->withProperties([
                'document_id' => (int) $documentId,
                'ip_address'  => request()->ip(),
                'user_agent'  => request()->userAgent(),
            ])
            ->log('employee.document_detached');

        return ResponseHelper::success('Document detached from employee successfully.');
    }
}
