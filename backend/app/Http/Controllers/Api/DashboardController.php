<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\Employee;
use App\Models\Document;
use App\Models\DocumentCategory;
use App\Http\Resources\EmployeeResource;
use App\Http\Resources\DocumentResource;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $startOfMonth = now()->startOfMonth();

        $stats = [
            'total_employees' => Employee::where('company_id', $companyId)->count(),
            'active_employees' => Employee::where('company_id', $companyId)->where('employment_status', \App\Enums\EmploymentStatus::ACTIVE)->count(),
            'departments' => Department::where('company_id', $companyId)->count(),
            'new_joinees_this_month' => Employee::where('company_id', $companyId)->where('joining_date', '>=', $startOfMonth)->count(),
            'recent_hires' => EmployeeResource::collection(
                Employee::where('company_id', $companyId)
                    ->with('designation')
                    ->latest('joining_date')
                    ->take(5)
                    ->get()
            ),
            'teams' => Team::whereHas('department', fn($q) => $q->where('company_id', $companyId))->count(),
            'documents' => Document::where('company_id', $companyId)->count(),
            'active_users' => User::whereHas('companyMemberships', fn($q) => $q->where('companies.id', $companyId)->where('company_memberships.is_active', true))->count(),
            'document_stats' => [
                'total_documents'    => Document::where('company_id', $companyId)->count(),
                'storage_used_bytes' => (int) Document::where('company_id', $companyId)->sum('size'),
                'recent_uploads'     => DocumentResource::collection(
                    Document::where('company_id', $companyId)->latest()->limit(5)->get()
                ),
                'documents_by_category' => DocumentCategory::withCount(['documents' => fn($q) =>
                    $q->where('company_id', $companyId)
                ])->where('company_id', $companyId)->get(),
                'top_uploaders' => Document::where('company_id', $companyId)
                    ->whereNotNull('uploaded_by')
                    ->selectRaw('uploaded_by, count(*) as count')
                    ->groupBy('uploaded_by')
                    ->with('uploader')
                    ->orderByDesc('count')
                    ->limit(5)
                    ->get()
                    ->map(function ($item) {
                        return [
                            'count'    => $item->count,
                            'uploader' => $item->uploader ? [
                                'id'    => $item->uploader->id,
                                'name'  => $item->uploader->name,
                                'email' => $item->uploader->email,
                            ] : null
                        ];
                    })->filter(fn($x) => !is_null($x['uploader']))->values(),
            ],
        ];

        return ResponseHelper::success('Dashboard stats retrieved.', $stats);
    }
}
