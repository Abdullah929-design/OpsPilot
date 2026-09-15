<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Models\DocumentCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Resources\CategoryResource;


class CategoryController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $categories = DocumentCategory::where('company_id', $companyId)->get();

        return ResponseHelper::success('Document categories retrieved.', CategoryResource::collection($categories));

    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $userId = $request->user()->id;

        $category = DocumentCategory::create(array_merge($request->validated(), [
            'company_id' => $companyId,
            'created_by' => $userId,
        ]));

        return ResponseHelper::success('Document category created.', new CategoryResource($category), 201);

    }

    public function update(StoreCategoryRequest $request, DocumentCategory $documentCategory): JsonResponse
    {
        $this->authorize('update', $documentCategory);

        $documentCategory->update($request->validated());

        return ResponseHelper::success('Document category updated.', new CategoryResource($documentCategory));

    }

    public function destroy(DocumentCategory $documentCategory): JsonResponse
    {
        $this->authorize('delete', $documentCategory);

        // Check if category is used by any documents
        if ($documentCategory->documents()->exists()) {
            return ResponseHelper::error('Cannot delete category. It is assigned to one or more documents.', [], 422);
        }

        $documentCategory->delete();

        return ResponseHelper::success('Document category deleted.');
    }
}
