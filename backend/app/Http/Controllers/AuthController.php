<?php

namespace App\Http\Controllers;

use App\Helpers\ResponseHelper;
use App\Http\Requests\LoginRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\Rules\Password as PasswordRule;
use App\Http\Resources\UserResource;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');
        $credentials['is_active'] = true;

        if (! Auth::attempt($credentials, $request->boolean('remember'))) {
            return ResponseHelper::error('Invalid credentials or inactive account.', [], 401);
        }

                $request->session()->regenerate();
        $user = Auth::user();

                    if (app()->bound('current_tenant_company')) {
            $currentCompany = app('current_tenant_company');

            // Guardrail: Block login if company is suspended
            if ($currentCompany->platform_status === 'suspended') {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return ResponseHelper::error('Your company account has been suspended. Please contact support.', [], 403);
            }

            $membership = $user->companyMemberships()
                ->where('companies.id', $currentCompany->id)
                ->first();

            if (!$membership) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'email' => ['Invalid credentials for this portal.'],
                ]);
            }

            if (!$membership->pivot->is_active) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'email' => ['Your account has been deactivated for this company.'],
                ]);
            }

            // Set dynamic context
            $user->company_id = $currentCompany->id;
        }


                    if ($user->company_id) {
            $user->load(['roles', 'permissions', 'companyMemberships' => function($query) {
                $query->wherePivot('is_active', true)->where('platform_status', 'active');
            }]);
            app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId($user->company_id);
            $user->unsetRelation('roles');
            $user->unsetRelation('permissions');
        }



                activity('activity')
            ->causedBy($user)
            ->withProperty('ip_address', $request->ip())
            ->withProperty('user_agent', $request->userAgent())
            ->log('login');


        return ResponseHelper::success('Login successful.', new UserResource($user));
    }

    public function logout(Request $request): JsonResponse
    {
        $userId = Auth::id();

        if ($userId) {
            activity('activity')
                ->causedBy(Auth::user())
                ->withProperty('ip_address', $request->ip())
                ->withProperty('user_agent', $request->userAgent())
                ->log('logout');

        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return ResponseHelper::success('Logged out successfully.');
    }

        public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['roles', 'permissions', 'companyMemberships' => function($query) {
            $query->wherePivot('is_active', true)->where('platform_status', 'active');
        }]);

        return ResponseHelper::success('Current user retrieved.', new UserResource($user));
    }


    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate(['email' => ['required', 'email']]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            return ResponseHelper::success(__($status));
        }

        return ResponseHelper::error(__($status), [], 400);
    }

    public function resetPassword(Request $request): JsonResponse
{
    $request->validate([
        'token' => ['required'],
        'email' => ['required', 'email'],
        'password' => ['required', 'confirmed', new \App\Rules\PasswordPolicyRule],
    ]);

    $status = Password::reset($request->only('email', 'password', 'password_confirmation', 'token'), function ($user, $password) {
        $user->forceFill(['password' => Hash::make($password)])->save();

        // Trigger notification
        $user->notify(new \App\Notifications\PasswordChangedNotification());

        // Log activity
        activity('activity')
            ->causedBy($user)
            ->withProperty('ip_address', request()->ip())
            ->withProperty('user_agent', request()->userAgent())
            ->log('password reset');
    });

    if ($status === Password::PASSWORD_RESET) {
        return ResponseHelper::success(__($status));
    }

    return ResponseHelper::error(__($status), [], 400);
}

    public function changePassword(Request $request): JsonResponse
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'new_password' => ['required', 'confirmed', PasswordRule::defaults()],
        ]);

        $user = $request->user();
        $user->update(['password' => Hash::make($request->new_password)]);

        $user->notify(new \App\Notifications\PasswordChangedNotification());

        activity('activity')
            ->causedBy($user)
            ->withProperty('ip_address', $request->ip())
            ->withProperty('user_agent', $request->userAgent())
            ->log('password changed');

        return ResponseHelper::success('Password changed successfully.');
    }

        public function generateSwitchToken(Request $request): JsonResponse
    {
        $request->validate([
            'company_id' => ['required', 'integer']
        ]);

        $user = $request->user();
        $targetCompany = $user->companyMemberships()
            ->where('companies.id', $request->company_id)
            ->wherePivot('is_active', true)
            ->firstOrFail();

        // Generate short-lived token (valid for 60 seconds)
        $token = \Illuminate\Support\Str::random(40);
        // Store SHA-256 hash of token as the cache key — raw token never persisted
        \Illuminate\Support\Facades\Cache::put('switch_token:' . hash('sha256', $token), [
            'user_id' => $user->id,
            'company_id' => $targetCompany->id
        ], 60);

        // Build redirect URL to the target subdomain's frontend SSO receiver
        $baseDomain = parse_url(config('app.url'), PHP_URL_HOST) ?: 'opspilot.test';
        $port = parse_url(config('app.url'), PHP_URL_PORT);
        $portSuffix = $port ? ":{$port}" : '';
        
        $redirectUrl = "http://{$targetCompany->subdomain}.{$baseDomain}:3000/sso/switch-callback";

        return ResponseHelper::success('Switch token generated.', [
            'redirect_url' => $redirectUrl,
            'token' => $token
        ]);
    }

    public function switchLogin(Request $request): JsonResponse
    {
        // Read token from incoming cookie
        $token = $request->cookie('sso_switch_token');
        if (!$token) {
            return ResponseHelper::error('Token is required.', [], 400);
        }
        // Hash the incoming cookie value before cache lookup — must match how it was stored
        $data = \Illuminate\Support\Facades\Cache::pull('switch_token:' . hash('sha256', $token));
        if (!$data) {
            return ResponseHelper::error('Invalid or expired switch token.', [], 400);
        }
        Auth::loginUsingId($data['user_id']);
        $request->session()->regenerate();
        $user = Auth::user();

        // Verify company membership on the target subdomain (same as login)
        if (app()->bound('current_tenant_company')) {
            $currentCompany = app('current_tenant_company');

            $membership = $user->companyMemberships()
                ->where('companies.id', $currentCompany->id)
                ->first();

            if (!$membership) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return ResponseHelper::error('You are not a member of this company.', [], 403);
            }

            if (!$membership->pivot->is_active) {
                Auth::logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();
                return ResponseHelper::error('Your account is deactivated for this company.', [], 403);
            }

            $user->company_id = $currentCompany->id;
        }

        // Load roles and permissions in company context (same as login)
        if ($user->company_id) {
            $user->load(['roles', 'permissions', 'companyMemberships' => function ($query) {
                $query->wherePivot('is_active', true)->where('platform_status', 'active');
            }]);
            app(\Spatie\Permission\PermissionRegistrar::class)->setPermissionsTeamId($user->company_id);
            $user->unsetRelation('roles');
            $user->unsetRelation('permissions');
        }

        // Return success and queue a cookie deletion to clear the temp token immediately
        return ResponseHelper::success('Login successful.', new UserResource($user))
            ->withoutCookie('sso_switch_token');
    }
}
