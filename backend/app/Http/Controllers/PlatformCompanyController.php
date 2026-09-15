<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Models\Company;
use App\Models\PlatformUser;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Rules\ValidSubdomain;
use Illuminate\Validation\Rule;
use App\Http\Requests\UpdateSubdomainRequest;
use App\Models\User;


class PlatformCompanyController extends Controller
{
    use AuthorizesRequests;

        public function checkSubdomain(Request $request): JsonResponse
    {
        $value = strtolower($request->query('value', ''));

        if (empty($value)) {
            return ResponseHelper::success('Empty value.', ['available' => false]);
        }
        $reserved = config('app.reserved_subdomains') ?? [];
        if (in_array($value, $reserved)) {
            return ResponseHelper::success('Reserved.', ['available' => false]);
        }

        // Check if alphanumeric / format matches
        if (!preg_match('/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/', $value)) {
            return ResponseHelper::success('Invalid format.', ['available' => false]);
        }

        // Check if exists in DB
        $exists = Company::where('subdomain', $value)->exists();

        return ResponseHelper::success('Checked.', ['available' => !$exists]);
    }


    public function index(Request $request): JsonResponse
    {
        $user = $request->user('platform');
        
        $query = Company::with(['plan', 'assignedManager']);

                if (!$user->can('companies.view-all')) {
            $query->where(function ($q) use ($user) {
                $q->where('assigned_manager_id', $user->id)
                  ->orWhereHas('accessiblePlatformUsers', function ($sq) use ($user) {
                      $sq->where('platform_user_id', $user->id);
                  });
            });
        }


        $companies = $query->latest()->get();

        return ResponseHelper::success('Companies retrieved successfully.', $companies);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user('platform');
        if (!$user->can('companies.create')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'subdomain' => ['required', 'string', new ValidSubdomain, 'unique:companies,subdomain'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'plan_id' => ['nullable', 'exists:plans,id'],
            'assigned_manager_id' => ['nullable', 'exists:platform_users,id'],
            // Validate default administrator details
            'admin_name' => ['required', 'string', 'max:255'],
            'admin_email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'admin_password' => ['required', 'string', new \App\Rules\PasswordPolicyRule],
        ]);


        // Use the CompanyService to clone template roles and permissions
        $companyService = new \App\Services\CompanyService();
        $company = $companyService->createCompanyWithDefaults($validated);

        if (!empty($validated['assigned_manager_id'])) {
            $company->accessiblePlatformUsers()->syncWithoutDetaching([
                $validated['assigned_manager_id'] => ['assigned_by' => $user->id]
            ]);
        }

        activity('platform')
            ->causedBy($user)
            ->performedOn($company)
            ->log('company.created');

        return ResponseHelper::success('Company created successfully.', $company);
    }


    public function show($id, Request $request): JsonResponse
    {
        $company = Company::with(['plan', 'assignedManager'])->findOrFail($id);
        $this->authorize('view', $company);

        return ResponseHelper::success('Company retrieved successfully.', $company);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $company = Company::findOrFail($id);
        $this->authorize('update', $company);

                $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'subdomain' => ['sometimes', 'required', 'string', new ValidSubdomain, Rule::unique('companies', 'subdomain')->ignore($id)],
            'legal_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'website' => ['nullable', 'string', 'max:255'],
            'timezone' => ['nullable', 'string', 'max:100'],
            'currency' => ['nullable', 'string', 'max:10'],
        ]);

        $company->update($validated);

        return ResponseHelper::success('Company updated successfully.', $company);
    }

        public function updateSubdomain(UpdateSubdomainRequest $request, Company $company): JsonResponse
    {
        $this->authorize('update', $company);

        $old = $company->subdomain;
        $company->update(['subdomain' => $request->validated('subdomain')]);

        activity('audit')
            ->performedOn($company)
            ->causedBy(Auth::guard('platform')->user())
            ->withProperty('old_subdomain', $old)
            ->withProperty('new_subdomain', $company->subdomain)
            ->log('company.subdomain_changed');

        return ResponseHelper::success('Subdomain updated.', ['subdomain' => $company->subdomain]);
    }


    public function suspend($id): JsonResponse
    {
        $company = Company::findOrFail($id);
        $this->authorize('suspend', $company);

        $company->update(['platform_status' => 'suspended']);

        activity('platform')
            ->causedBy(Auth::guard('platform')->user())
            ->performedOn($company)
            ->log('company.suspended');


        return ResponseHelper::success('Company suspended successfully.', $company);
    }

    public function activate($id): JsonResponse
    {
        $company = Company::findOrFail($id);
        $this->authorize('activate', $company);

        $company->update(['platform_status' => 'active']);

                activity('platform')
            ->causedBy(Auth::guard('platform')->user())
            ->performedOn($company)
            ->log('company.activated');


        return ResponseHelper::success('Company activated successfully.', $company);
    }

    public function changePlan(Request $request, $id): JsonResponse
    {
        $company = Company::findOrFail($id);
        $this->authorize('changePlan', $company);

        $validated = $request->validate([
            'plan_id' => ['nullable', 'exists:plans,id'],
        ]);

        $company->update(['plan_id' => $validated['plan_id']]);
        

                activity('platform')
            ->causedBy(Auth::guard('platform')->user())
            ->performedOn($company)
            ->withProperty('plan_id', $validated['plan_id'])
            ->log('company.plan_changed');


        return ResponseHelper::success('Company plan updated successfully.', $company->load('plan'));
    }

        public function assignManager(Request $request, $id): JsonResponse
    {
        $company = Company::findOrFail($id);
        $this->authorize('assignManager', $company);

        $validated = $request->validate([
            'assigned_manager_id' => ['nullable', 'exists:platform_users,id'],
        ]);

        $oldManagerId = $company->assigned_manager_id;
        $newManagerId = $validated['assigned_manager_id'];

        $company->update(['assigned_manager_id' => $newManagerId]);

        // Clean up pivot: detach old manager if it changed
        if ($oldManagerId && $oldManagerId !== $newManagerId) {
            $company->accessiblePlatformUsers()->detach($oldManagerId);
        }

        // Attach new manager to pivot
        if ($newManagerId) {
            $company->accessiblePlatformUsers()->syncWithoutDetaching([
                $newManagerId => ['assigned_by' => $request->user('platform')->id]
            ]);
        }
                activity('platform')
            ->causedBy(Auth::guard('platform')->user())
            ->performedOn($company)
            ->withProperty('assigned_manager_id', $validated['assigned_manager_id'])
            ->log('company.manager_assigned');


        return ResponseHelper::success('Company manager assigned successfully.', $company->load('assignedManager'));
    }

        public function destroy($id, Request $request): JsonResponse
    {
        $company = Company::findOrFail($id);
        $this->authorize('delete', $company);

        // Fetch user IDs belonging to this company before deletion
        $userIds = $company->memberships()->pluck('users.id')->toArray();

        // Delete company (database ON DELETE CASCADE handles all employee/location/dept data)
        $company->delete();

        // Clean up users who no longer belong to any active company
        foreach ($userIds as $userId) {
            $user = User::find($userId);
            if ($user && $user->companyMemberships()->count() === 0) {
                $user->delete();
            }
        }

        activity('platform')
            ->causedBy(Auth::guard('platform')->user())
            ->performedOn($company)
            ->log('company.deleted');

        return ResponseHelper::success('Company and all associated data deleted successfully.');
    }

}
