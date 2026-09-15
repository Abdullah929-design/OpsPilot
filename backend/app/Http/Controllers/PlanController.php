<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Models\Plan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class PlanController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $this->authorize('view', Plan::class);

        $plans = Plan::latest()->get();

        return ResponseHelper::success('Plans retrieved successfully.', $plans);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Plan::class);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'user_limit' => ['nullable', 'integer', 'min:1'],
            'company_storage_limit_mb' => ['nullable', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'billing_interval' => ['required', 'string', 'in:monthly,yearly'],
            'trial_days' => ['required', 'integer', 'min:0'],
            'features' => ['nullable', 'array'],
            'is_archived' => ['boolean'],
        ]);

        $plan = Plan::create($validated);

        return ResponseHelper::success('Plan created successfully.', $plan);
    }

    public function show($id): JsonResponse
    {
        $plan = Plan::findOrFail($id);
        $this->authorize('view', $plan);

        return ResponseHelper::success('Plan retrieved successfully.', $plan);
    }

    public function update(Request $request, $id): JsonResponse
    {
        $plan = Plan::findOrFail($id);
        $this->authorize('update', $plan);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'user_limit' => ['nullable', 'integer', 'min:1'],
            'company_storage_limit_mb' => ['nullable', 'integer', 'min:1'],
            'price' => ['required', 'numeric', 'min:0'],
            'billing_interval' => ['required', 'string', 'in:monthly,yearly'],
            'trial_days' => ['required', 'integer', 'min:0'],
            'features' => ['nullable', 'array'],
            'is_archived' => ['boolean'],
        ]);

        $plan->update($validated);

        return ResponseHelper::success('Plan updated successfully.', $plan);
    }

    public function destroy($id): JsonResponse
    {
        $plan = Plan::findOrFail($id);
        $this->authorize('delete', $plan);

        $plan->delete();

        return ResponseHelper::success('Plan deleted successfully.');
    }
}
