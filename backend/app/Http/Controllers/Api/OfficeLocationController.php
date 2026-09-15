<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOfficeRequest;
use App\Http\Requests\UpdateOfficeRequest;
use App\Http\Resources\OfficeLocationResource;
use App\Models\OfficeLocation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class OfficeLocationController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', OfficeLocation::class);

        $query = OfficeLocation::where('company_id', $request->user()->company_id);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('city', 'like', '%' . $request->search . '%')
                  ->orWhere('country', 'like', '%' . $request->search . '%');
            });
        }

        $offices = $query->latest()->paginate($request->query('per_page', 10));

        return response()->json([
            'success' => true,
            'message' => 'Office locations retrieved successfully.',
            'data' => OfficeLocationResource::collection($offices),
            'meta' => [
                'current_page' => $offices->currentPage(),
                'last_page' => $offices->lastPage(),
                'per_page' => $offices->perPage(),
                'total' => $offices->total(),
            ]
        ]);
    }

    public function store(StoreOfficeRequest $request): JsonResponse
    {
        $this->authorize('create', OfficeLocation::class);

        $data = $request->validated();
        $data['company_id'] = $request->user()->company_id;

        $office = OfficeLocation::create($data);

        return ResponseHelper::success(
            'Office location created successfully.',
            new OfficeLocationResource($office),
            201
        );
    }

    public function show(OfficeLocation $officeLocation): JsonResponse
    {
        $this->authorize('view', $officeLocation);

        return ResponseHelper::success(
            'Office location retrieved successfully.',
            new OfficeLocationResource($officeLocation)
        );
    }

    public function update(UpdateOfficeRequest $request, OfficeLocation $officeLocation): JsonResponse
    {
        $this->authorize('update', $officeLocation);

        $officeLocation->update($request->validated());

        return ResponseHelper::success(
            'Office location updated successfully.',
            new OfficeLocationResource($officeLocation)
        );
    }

    public function destroy(OfficeLocation $officeLocation): JsonResponse
    {
        $this->authorize('delete', $officeLocation);

        // Guard: Prevent deletion of the last office location
        $count = OfficeLocation::where('company_id', $officeLocation->company_id)->count();
        if ($count <= 1) {
            return ResponseHelper::error(
                'Cannot delete the last remaining office location of your company.',
                ['office' => 'Last remaining office.'],
                422
            );
        }

        // TODO Sprint 3: also block if employees assigned

        $officeLocation->delete();

        return ResponseHelper::success('Office location deleted successfully.');
    }
}
