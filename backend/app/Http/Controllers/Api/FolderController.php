<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFolderRequest;
use App\Http\Requests\UpdateFolderRequest;
use App\Models\Folder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Resources\FolderResource;
use Illuminate\Validation\ValidationException;

class FolderController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Folder::class);

        $companyId = $request->user()->company_id;
        $query = Folder::where('company_id', $companyId);

        if ($request->has('parent_id')) {
            $parentId = $request->input('parent_id');
            if ($parentId === 'null' || $parentId === null || $parentId === '') {
                $query->whereNull('parent_id');
            } else {
                $query->where('parent_id', $parentId);
            }
        }

        $folders = $query->withCount('documents')->get();

        return ResponseHelper::success('Folders retrieved successfully.', FolderResource::collection($folders));
    }

    public function tree(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Folder::class);

        $companyId = $request->user()->company_id;
        $tree = Folder::whereNull('parent_id')
            ->where('company_id', $companyId)
            ->with(['allChildren' => function ($q) {
                $q->withCount('documents');
            }])
            ->withCount('documents')
            ->get();

        return ResponseHelper::success('Folders retrieved successfully.', FolderResource::collection($tree));
    }

    public function store(StoreFolderRequest $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $userId = $request->user()->id;

        $folder = Folder::create(array_merge($request->validated(), [
            'company_id' => $companyId,
            'created_by' => $userId,
        ]));

        return ResponseHelper::success('Folder created successfully.', new FolderResource($folder), 201);
    }

    public function show(Folder $folder): JsonResponse
    {
        $this->authorize('view', $folder);

        $folder->load(['children', 'creator'])
            ->loadCount('documents');

        return ResponseHelper::success('Folder details retrieved.', new FolderResource($folder));
    }

    public function update(UpdateFolderRequest $request, Folder $folder): JsonResponse
    {
        $this->authorize('update', $folder);

        if ($request->has('parent_id')) {
            $parentId = $request->parent_id;
            while ($parentId) {
                if ((int) $parentId === (int) $folder->id) {
                    throw ValidationException::withMessages(['parent_id' => 'Circular folder structure detected.']);
                }
                $parentId = Folder::find($parentId)?->parent_id;
            }
        }

        $folder->update($request->validated());

        return ResponseHelper::success('Folder updated successfully.', new FolderResource($folder));
    }

    public function destroy(Request $request, Folder $folder): JsonResponse
    {
        $this->authorize('delete', $folder);

        if ($request->input('force') === 'true') {
            $this->cascadeDeleteFolder($folder);
            return ResponseHelper::success('Folder and all its contents deleted successfully.');
        }

        if ($folder->children()->exists() || $folder->documents()->exists()) {
            return ResponseHelper::error('Folder is not empty.', [], 422);
        }

        $folder->delete();

        return ResponseHelper::success('Folder deleted successfully.');
    }

    private function cascadeDeleteFolder(Folder $folder): void
    {
        // Soft delete all documents inside this folder
        $folder->documents()->delete();

        // Recursively soft delete nested subfolders
        foreach ($folder->children as $subfolder) {
            $this->cascadeDeleteFolder($subfolder);
        }

        // Soft delete the folder itself
        $folder->delete();
    }
}
