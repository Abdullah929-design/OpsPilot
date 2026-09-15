<?php

namespace App\Http\Controllers\Api;


use App\Events\EmployeeCreated;
use App\Events\EmployeeUpdated;
use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeRequest;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Services\EmployeeService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EmployeeController extends Controller
{
    use AuthorizesRequests;

    protected EmployeeService $employeeService;

        public function uploadPhoto(Request $request, Employee $employee): JsonResponse
    {
        $this->authorize('update', $employee);

        if ($employee->user_id) {
            return ResponseHelper::error('Cannot upload photo for a linked employee. Change the photo on the linked user account instead.', [], 400);
        }

        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,webp', 'max:2048'],
        ]);

        if ($request->hasFile('photo')) {
            // Delete old photo file if it exists
            if ($employee->profile_photo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete(str_replace('/storage/', '', parse_url($employee->profile_photo, PHP_URL_PATH)));
            }

            $path = $request->file('photo')->store('employees', 'public');
            $employee->update(['profile_photo' => '/storage/' . $path]);
        }

        return ResponseHelper::success('Profile photo uploaded successfully.', new EmployeeResource($employee));
    }


    public function __construct(EmployeeService $employeeService)
    {
        $this->employeeService = $employeeService;
    }

        public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Employee::class);

        $companyId = $request->user()->company_id;

        $query = Employee::where('company_id', $companyId)
            ->with(['department', 'team', 'designation', 'officeLocation', 'manager']);

        // Search: name, employee_code, email, or phone
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($request->filled('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        if ($request->filled('team_id')) {
            $query->where('team_id', $request->team_id);
        }

        if ($request->filled('designation_id')) {
            $query->where('designation_id', $request->designation_id);
        }

        if ($request->filled('office_location_id')) {
            $query->where('office_location_id', $request->office_location_id);
        }

        if ($request->boolean('is_manager') === true) {
            $query->whereHas('designation', fn($q) => $q->where('is_manager', true))
                  ->where('employment_status', \App\Enums\EmploymentStatus::ACTIVE);
        }


        if ($request->filled('status')) {
            $query->where('employment_status', $request->status);
        }

        if ($request->filled('employment_type')) {
            $query->where('employment_type', $request->employment_type);
        }

        $employees = $query->latest()->paginate($request->query('per_page', 15));

        return ResponseHelper::success('Employees retrieved successfully.', [
            'items' => EmployeeResource::collection($employees->items()),
            'pagination' => [
                'total' => $employees->total(),
                'per_page' => $employees->perPage(),
                'current_page' => $employees->currentPage(),
                'last_page' => $employees->lastPage(),
            ],
        ]);
    }


    public function store(StoreEmployeeRequest $request): JsonResponse
    {
        $this->authorize('create', Employee::class);

        $data = $request->validated();
        $data['company_id'] = $request->user()->company_id;

        $employee = $this->employeeService->createEmployee($data);

        event(new EmployeeCreated($employee)); // Dispatch event

       return ResponseHelper::success('Employee created successfully.', new EmployeeResource($employee), 201);
    }

    public function show(Employee $employee): JsonResponse
    {
        $this->authorize('view', $employee);

        return ResponseHelper::success('Employee details retrieved.', new EmployeeResource($employee->load(['department', 'team', 'designation', 'officeLocation', 'manager'])));
    }

    public function update(UpdateEmployeeRequest $request, Employee $employee): JsonResponse
    {
        $this->authorize('update', $employee);

        $updatedEmployee = $this->employeeService->updateEmployee($employee, $request->validated());

         event(new EmployeeUpdated($updatedEmployee)); // Dispatch event

       return ResponseHelper::success('Employee updated successfully.', new EmployeeResource($updatedEmployee));
    }

    public function destroy(Employee $employee): JsonResponse
    {
        $this->authorize('delete', $employee);

        $this->employeeService->deleteEmployee($employee);

        return ResponseHelper::success('Employee deleted successfully.');
    }

    public function restore(int $id): JsonResponse
    {
        $employee = Employee::onlyTrashed()->findOrFail($id);
        $this->authorize('restore', $employee);

        $this->employeeService->restoreEmployee($employee);

        return ResponseHelper::success('Employee restored successfully.', new EmployeeResource($employee));
    }

    public function updateStatus(Request $request, Employee $employee): JsonResponse
    {
        $this->authorize('update', $employee);

        $validated = $request->validate([
            'employment_status' => ['required', 'string', Rule::in(['active', 'inactive', 'terminated'])],
        ]);

        $updatedEmployee = $this->employeeService->updateEmployee($employee, $validated);

        return ResponseHelper::success('Employee status updated successfully.', new EmployeeResource($updatedEmployee));
    }
}
