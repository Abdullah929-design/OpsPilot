<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreDepartmentRequest;
use App\Http\Requests\UpdateDepartmentRequest;
use App\Http\Resources\DepartmentResource;
use App\Models\Department;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class DepartmentController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Department::class);

        $query = Department::where('company_id', $request->user()->company_id)
            ->withCount('teams');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $departments = $query->latest()->paginate($request->query('per_page', 10));

        return response()->json([
            'success' => true,
            'message' => 'Departments retrieved successfully.',
            'data' => DepartmentResource::collection($departments),
            'meta' => [
                'current_page' => $departments->currentPage(),
                'last_page' => $departments->lastPage(),
                'per_page' => $departments->perPage(),
                'total' => $departments->total(),
            ]
        ]);
    }

    public function store(StoreDepartmentRequest $request): JsonResponse
    {
        $this->authorize('create', Department::class);

        $data = $request->validated();
        $data['company_id'] = $request->user()->company_id;

        $department = Department::create($data);

        return ResponseHelper::success(
            'Department created successfully.',
            new DepartmentResource($department),
            201
        );
    }

    public function show(Department $department): JsonResponse
    {
        $this->authorize('view', $department);

        return ResponseHelper::success(
            'Department retrieved successfully.',
            new DepartmentResource($department->loadCount('teams'))
        );
    }

    public function update(UpdateDepartmentRequest $request, Department $department): JsonResponse
    {
        $this->authorize('update', $department);

        $department->update($request->validated());

        return ResponseHelper::success(
            'Department updated successfully.',
            new DepartmentResource($department->loadCount('teams'))
        );
    }

    public function destroy(Department $department): JsonResponse
    {
        $this->authorize('delete', $department);

        // Edge Case: Block deletion if department contains active teams
        if ($department->teams()->exists()) {
            return ResponseHelper::error(
                'Cannot delete department because it has active teams.',
                ['teams' => 'Active teams found.'],
                422
            );
        }

        $department->delete();

        return ResponseHelper::success('Department deleted successfully.');
    }
}
