<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Models\Company;
use App\Models\User;
use App\Models\PlatformUser;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformDashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        // Platform permission check
        if (!$request->user('platform')->can('platform.settings.manage')) {
            // Or a generic platform view permission, platform.settings.manage is used as the base
             if (!$request->user('platform')->can('companies.view')) {
                return ResponseHelper::error('Unauthorized.', [], 403);
            }
        }

        $stats = [
            'total_companies' => Company::count(),
            'active_companies' => Company::where('platform_status', 'active')->count(),
            
            // Platform-level aggregate across all tenants (intentional cross-tenant query)
            // This is the one place in the system where we retrieve global user count
            'total_users' => User::count(), 
            
            'platform_managers' => PlatformUser::whereHas('roles', fn($q) => $q->where('name', 'Manager')->where('guard_name', 'platform'))->count(),
            'companies_added_this_month' => Company::whereMonth('created_at', now()->month)->count(),
            'companies_on_paid_plans' => Company::whereNotNull('plan_id')->count(), // Stand-in for Active Subscriptions
        ];

        return ResponseHelper::success('Platform dashboard stats retrieved.', $stats);
    }
}
