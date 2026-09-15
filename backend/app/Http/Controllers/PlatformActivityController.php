<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Models\Activity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformActivityController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Check platform permission
        if (!$request->user('platform')->can('platform.activity.view')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $query = Activity::where('log_name', 'platform')
            ->with(['causer', 'subject']);

        // Filters
        if ($request->filled('causer_id')) {
            $query->where('causer_id', $request->input('causer_id'));
        }

        if ($request->filled('company_id')) {
            $query->where(function ($q) use ($request) {
                $q->where(function ($sq) use ($request) {
                    $sq->where('subject_type', \App\Models\Company::class)
                       ->where('subject_id', $request->input('company_id'));
                })->orWhere('properties->company_id', $request->input('company_id'));
            });
        }

        if ($request->filled('event')) {
            $query->where('description', 'like', '%' . $request->input('event') . '%');
        }

        if ($request->filled('date')) {
            $query->whereDate('created_at', $request->input('date'));
        }

        // Return paginated platform logs
        $logs = $query->latest()->paginate(50);

        return ResponseHelper::success('Platform activity logs retrieved.', $logs);
    }
}
