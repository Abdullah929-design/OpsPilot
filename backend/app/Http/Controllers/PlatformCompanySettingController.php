<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformCompanySettingController extends Controller
{
    protected SettingService $settingService;

    public function __construct(SettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    public function index(Request $request, $companyId): JsonResponse
    {
        $company = \App\Models\Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('view', $company);
       if (!$request->user('platform')->can('companies.view')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $settings = $this->settingService->all($companyId);

        return ResponseHelper::success('Company settings retrieved.', $settings);
    }

    public function update(Request $request, $companyId): JsonResponse
    {
        $company = \App\Models\Company::findOrFail($companyId);
        \Illuminate\Support\Facades\Gate::authorize('update', $company);
         if (!$request->user('platform')->can('companies.update')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $validated = $request->validate([
            'settings' => ['required', 'array'],
        ]);

        foreach ($validated['settings'] as $key => $value) {
            $this->settingService->set($companyId, $key, $value);
        }

        // Dual-side Audit Logging
        activity('platform')
            ->causedBy($request->user('platform'))
            ->log('company.settings_changed');

        // Note: The tenant audit log is already recorded inside SettingService::set() automatically

        return ResponseHelper::success('Company settings updated.', $this->settingService->all($companyId));
    }
}
