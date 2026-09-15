<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Resources\PlatformUserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PlatformAuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);
        
        $credentials['is_active'] = true;

        if (! Auth::guard('platform')->attempt($credentials, $request->boolean('remember'))) {
            return ResponseHelper::error('Invalid platform credentials or inactive account.', [], 401);
        }

        $request->session()->regenerate();
        $user = Auth::guard('platform')->user();

        // Audit/Activity log
        activity('activity')
            ->causedBy($user)
            ->withProperty('ip_address', $request->ip())
            ->withProperty('user_agent', $request->userAgent())
            ->log('platform_login');

        return ResponseHelper::success('Platform login successful.', new PlatformUserResource($user));
    }

    public function logout(Request $request): JsonResponse
    {
        $user = Auth::guard('platform')->user();

        if ($user) {
            activity('activity')
                ->causedBy($user)
                ->withProperty('ip_address', $request->ip())
                ->withProperty('user_agent', $request->userAgent())
                ->log('platform_logout');
        }

        Auth::guard('platform')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return ResponseHelper::success('Platform logged out successfully.');
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user('platform')->load('roles', 'permissions');

        return ResponseHelper::success('Current platform user retrieved.', new PlatformUserResource($user));
    }
}
