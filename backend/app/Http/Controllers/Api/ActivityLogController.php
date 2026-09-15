<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityLogResource;
use App\Http\Resources\AuditLogResource;
use App\Models\Activity;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ActivityLogController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $query = Activity::with('causer')
            ->where('company_id', $user->company_id)
            ->where('log_name', 'activity');

        
        if (!$user->can('logs.activity.view')) {
            $query->where('causer_id', $user->id);
        }

        $logs = $query->latest()
            ->paginate((int) $request->query('per_page', 20));

        return ResponseHelper::success('Activity logs retrieved.', [
            'items' => ActivityLogResource::collection($logs->items()),
            'pagination' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $this->authorize('viewAudit', Activity::class);

        $logs = Activity::with('causer')
            ->where('company_id', $request->user()->company_id)
            ->where('log_name', 'audit')
            ->latest()
            ->paginate((int) $request->query('per_page', 20));

        return ResponseHelper::success('Audit logs retrieved.', [
            'items' => AuditLogResource::collection($logs->items()),
            'pagination' => [
                'total' => $logs->total(),
                'per_page' => $logs->perPage(),
                'current_page' => $logs->currentPage(),
                'last_page' => $logs->lastPage(),
            ],
        ]);
    }
}
