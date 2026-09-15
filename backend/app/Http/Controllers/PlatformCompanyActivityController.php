<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformCompanyActivityController extends Controller
{
    public function index(Request $request, $companyId): JsonResponse
    {
         $company = \App\Models\Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('view', $company);
        
         if (!$request->user('platform')->can('platform.activity.view')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        // Fetch activity logs where company_id matches this company, including system/tenant logs
        $logs = Activity::where('company_id', $companyId)
            ->with(['causer', 'subject'])
            ->latest()
            ->paginate(50);

        return ResponseHelper::success('Company activity logs retrieved.', $logs);
    }
}
