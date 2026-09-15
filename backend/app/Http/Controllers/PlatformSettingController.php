<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PlatformSettingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (!$request->user('platform')->can('platform.settings.manage')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        // Return settings as a key-value dictionary
        $settings = Setting::pluck('value', 'key');
        
        return ResponseHelper::success('Platform settings retrieved.', $settings);
    }

    public function update(Request $request): JsonResponse
    {
        if (!$request->user('platform')->can('platform.settings.manage')) {
            return ResponseHelper::error('Unauthorized.', [], 403);
        }

        $validated = $request->validate([
            'settings' => ['required', 'array'],
            'settings.*' => ['nullable', 'string'],
        ]);

        foreach ($validated['settings'] as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value]
            );
        }

        // Log the change
        activity('platform')
            ->causedBy($request->user('platform'))
            ->log('platform.settings_updated');

        return ResponseHelper::success('Platform settings updated.', Setting::pluck('value', 'key'));
    }
}
