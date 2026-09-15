<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Services\SettingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CompanySettingController extends Controller
{
    use AuthorizesRequests;

    protected SettingService $settingService;

    public function __construct(SettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->can('company.view')) {
            abort(403);
        }

        $companyId = $request->user()->company_id;
        $settings = $this->settingService->all($companyId);

        return ResponseHelper::success('Company settings retrieved.', $settings);
    }

    public function update(Request $request): JsonResponse
    {
        if (!$request->user()->can('company.update')) {
            abort(403);
        }

        $request->validate([
            'settings' => ['required', 'array'],
        ]);

        $companyId = $request->user()->company_id;
        $settings = $request->input('settings');

        foreach ($settings as $key => $value) {
            $this->settingService->set($companyId, $key, $value);
        }

        $updatedSettings = $this->settingService->all($companyId);

        return ResponseHelper::success('Company settings updated successfully.', $updatedSettings);
    }
}
