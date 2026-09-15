<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDesignationRequest;
use App\Http\Requests\UpdateDesignationRequest;
use App\Http\Resources\DesignationResource;
use App\Models\Designation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class DesignationController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Designation::class);

        $query = Designation::where('company_id', $request->user()->company_id);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where('title', 'like', '%' . $request->search . '%');
        }

        $designations = $query->latest()->paginate($request->query('per_page', 10));

        return response()->json([
            'success' => true,
            'message' => 'Designations retrieved successfully.',
            'data' => DesignationResource::collection($designations),
            'meta' => [
                'current_page' => $designations->currentPage(),
                'last_page' => $designations->lastPage(),
                'per_page' => $designations->perPage(),
                'total' => $designations->total(),
            ]
        ]);
    }

    public function store(StoreDesignationRequest $request): JsonResponse
    {
        $this->authorize('create', Designation::class);

        $data = $request->validated();
        $data['company_id'] = $request->user()->company_id;

        $designation = Designation::create($data);

        return ResponseHelper::success(
            'Designation created successfully.',
            new DesignationResource($designation),
            201
        );
    }

    public function show(Designation $designation): JsonResponse
    {
        $this->authorize('view', $designation);

        return ResponseHelper::success(
            'Designation retrieved successfully.',
            new DesignationResource($designation)
        );
    }

    public function update(UpdateDesignationRequest $request, Designation $designation): JsonResponse
    {
        $this->authorize('update', $designation);

        $designation->update($request->validated());

        return ResponseHelper::success(
            'Designation updated successfully.',
            new DesignationResource($designation)
        );
    }

        public function destroy(Designation $designation): JsonResponse
    {
        $this->authorize('delete', $designation);

        if ($designation->is_system) {
            return ResponseHelper::error('Cannot delete system designations.', [], 400);
        }

        $designation->delete();

        return ResponseHelper::success('Designation deleted successfully.');
    }

}
