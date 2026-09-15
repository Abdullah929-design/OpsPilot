<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Resources\EmployeeResource;
use App\Models\Employee;
use App\Models\Company;
use App\Services\EmployeeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\PermissionRegistrar;

class PlatformCompanyEmployeeController extends Controller
{
    protected EmployeeService $employeeService;

    public function __construct(EmployeeService $employeeService)
    {
        $this->employeeService = $employeeService;
    }

    public function index(Request $request, $companyId): JsonResponse
    {
        $company = Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('view', $company);

         if (!$request->user('platform')->can('companies.view')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        // Switch Spatie context to tenant AFTER platform auth checks pass
        app(PermissionRegistrar::class)->setPermissionsTeamId($companyId);

        $search = $request->query('search');
        $deptId = $request->query('department_id');
        $desgId = $request->query('designation_id');
        $status = $request->query('status');
        $perPage = (int) $request->query('per_page', 15);

        $query = Employee::where('company_id', $companyId)
            ->with(['department', 'team', 'designation', 'officeLocation', 'manager']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%");
            });
        }

        if ($deptId) {
            $query->where('department_id', $deptId);
        }

        if ($desgId) {
            $query->where('designation_id', $desgId);
        }

        if ($status) {
            $query->where('employment_status', $status);
        }

        $employees = $query->latest()->paginate($perPage);

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

    public function store(Request $request, $companyId): JsonResponse
    {
        $company = Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('update', $company);

        // Platform Managers cannot create employees
         if (!$request->user('platform')->can('platform.users.create')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        // Switch Spatie context to tenant AFTER platform auth checks pass
        app(PermissionRegistrar::class)->setPermissionsTeamId($companyId);

        $validated = $request->validate([
            'user_id' => [
                'nullable',
                'integer',
                Rule::unique('employees', 'user_id')->where('company_id', $companyId),
                Rule::exists('company_memberships', 'user_id')->where('company_id', $companyId),
            ],
            'department_id' => [
                'required',
                'integer',
                Rule::exists('departments', 'id')->where('company_id', $companyId)->whereNull('deleted_at'),
            ],
            'team_id' => [
                'nullable',
                'integer',
                Rule::exists('teams', 'id')->whereNull('deleted_at'),
            ],
            'designation_id' => [
                'required',
                'integer',
                Rule::exists('designations', 'id')->where('company_id', $companyId)->whereNull('deleted_at'),
            ],
            'office_location_id' => [
                'nullable',
                'integer',
                Rule::exists('office_locations', 'id')->where('company_id', $companyId)->whereNull('deleted_at'),
            ],
            'manager_id' => [
                'nullable',
                'integer',
                Rule::exists('employees', 'id')->where('company_id', $companyId)->whereNull('deleted_at'),
            ],
            'employee_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('employees', 'employee_code')->where('company_id', $companyId),
            ],
            'first_name' => ['required_without:user_id', 'nullable', 'string', 'max:255'],
            'last_name' => ['required_without:user_id', 'nullable', 'string', 'max:255'],
            'email' => [
                'required_without:user_id',
                'nullable',
                'email',
                'max:255',
                Rule::unique('employees', 'email')->where('company_id', $companyId),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date'],
            'joining_date' => ['required', 'date'],
            'employment_type' => ['required', 'string', 'in:full_time,part_time,contract,intern'],
            'employment_status' => ['required', 'string', 'in:active,inactive,terminated'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
        ]);

        $validated['company_id'] = (int) $companyId;

        $employee = $this->employeeService->createEmployee($validated);

        // Logging
        activity('platform')
            ->causedBy($request->user('platform'))
            ->performedOn($employee)
            ->log('company.employee_created');

        return ResponseHelper::success('Employee created successfully.', new EmployeeResource($employee), 201);
    }

    public function update(Request $request, $companyId, $employeeId): JsonResponse
    {
        $company = Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('update', $company);

         if (!$request->user('platform')->can('companies.update')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        // Switch Spatie context to tenant AFTER platform auth checks pass
        app(PermissionRegistrar::class)->setPermissionsTeamId($companyId);

        $employee = Employee::where('company_id', $companyId)->findOrFail($employeeId);

        $validated = $request->validate([
            'user_id' => [
                'nullable',
                'integer',
                Rule::unique('employees', 'user_id')->ignore($employeeId)->where('company_id', $companyId),
                Rule::exists('company_memberships', 'user_id')->where('company_id', $companyId),
            ],
            'department_id' => [
                'required',
                'integer',
                Rule::exists('departments', 'id')->where('company_id', $companyId)->whereNull('deleted_at'),
            ],
            'team_id' => [
                'nullable',
                'integer',
                Rule::exists('teams', 'id')->whereNull('deleted_at'),
            ],
            'designation_id' => [
                'required',
                'integer',
                Rule::exists('designations', 'id')->where('company_id', $companyId)->whereNull('deleted_at'),
            ],
            'office_location_id' => [
                'nullable',
                'integer',
                Rule::exists('office_locations', 'id')->where('company_id', $companyId)->whereNull('deleted_at'),
            ],
            'manager_id' => [
                'nullable',
                'integer',
                Rule::exists('employees', 'id')->where('company_id', $companyId)->whereNull('deleted_at'),
            ],
            'employee_code' => [
                'required',
                'string',
                'max:255',
                Rule::unique('employees', 'employee_code')->ignore($employeeId)->where('company_id', $companyId),
            ],
            'first_name' => ['required_without:user_id', 'nullable', 'string', 'max:255'],
            'last_name' => ['required_without:user_id', 'nullable', 'string', 'max:255'],
            'email' => [
                'required_without:user_id',
                'nullable',
                'email',
                'max:255',
                Rule::unique('employees', 'email')->ignore($employeeId)->where('company_id', $companyId),
            ],
            'phone' => ['nullable', 'string', 'max:50'],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'date_of_birth' => ['nullable', 'date'],
            'joining_date' => ['required', 'date'],
            'employment_type' => ['required', 'string', 'in:full_time,part_time,contract,intern'],
            'employment_status' => ['required', 'string', 'in:active,inactive,terminated'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', 'max:100'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:50'],
        ]);

        $updatedEmployee = $this->employeeService->updateEmployee($employee, $validated);

        // Logging
        activity('platform')
            ->causedBy($request->user('platform'))
            ->performedOn($updatedEmployee)
            ->log('company.employee_updated');

        return ResponseHelper::success('Employee updated successfully.', new EmployeeResource($updatedEmployee));
    }

    public function destroy(Request $request, $companyId, $employeeId): JsonResponse
    {
        $company = Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('update', $company);

        // Platform Managers cannot delete employees
         if (!$request->user('platform')->can('platform.users.delete')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        // Switch Spatie context to tenant AFTER platform auth checks pass
        app(PermissionRegistrar::class)->setPermissionsTeamId($companyId);

        $employee = Employee::where('company_id', $companyId)->findOrFail($employeeId);
        $this->employeeService->deleteEmployee($employee);

        // Logging
        activity('platform')
            ->causedBy($request->user('platform'))
            ->performedOn($employee)
            ->log('company.employee_deleted');

        return ResponseHelper::success('Employee deleted successfully.');
    }

    public function departments($companyId): JsonResponse
    {
        $company = Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('view', $company);
        $depts = \App\Models\Department::where('company_id', $companyId)->where('status', 'active')->get();
        return ResponseHelper::success('Departments retrieved.', $depts);
    }

    public function designations($companyId): JsonResponse
    {
        $company = Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('view', $company);
        $desgs = \App\Models\Designation::where('company_id', $companyId)->where('status', 'active')->get();
        return ResponseHelper::success('Designations retrieved.', $desgs);
    }

    public function offices($companyId): JsonResponse
    {
        $company = Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('view', $company);
        $offices = \App\Models\OfficeLocation::where('company_id', $companyId)->where('status', 'active')->get();
        return ResponseHelper::success('Offices retrieved.', $offices);
    }
}
