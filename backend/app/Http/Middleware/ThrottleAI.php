<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class ThrottleAI
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @return \Symfony\Component\HttpFoundation\Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $companyId = $user->company_id;
        $date = date('Y-m-d');

        // Retrieve thresholds from central ai_limits config
        $minuteLimit = config('ai_limits.user_minute_limit', 3);
        $dailyLimit = config('ai_limits.user_daily_limit', 20);
        $companyDailyLimit = config('ai_limits.company_daily_limit', 300);

        // Define Cache Keys
        $minuteKey = "ai-user-minute:{$user->id}";
        $dailyKey = "ai-user-daily:{$user->id}";
        $companyKey = "ai-company-daily:{$companyId}:{$date}";

        // 1. Check user-level per-minute limit
        if (RateLimiter::tooManyAttempts($minuteKey, $minuteLimit)) {
            $seconds = RateLimiter::availableIn($minuteKey);
            return response()->json([
                'message' => "You've reached your AI usage limit — try again in {$seconds} seconds."
            ], 429);
        }

        // 2. Check user-level daily limit
        if (RateLimiter::tooManyAttempts($dailyKey, $dailyLimit)) {
            $seconds = RateLimiter::availableIn($dailyKey);
            $hours = ceil($seconds / 3600);
            return response()->json([
                'message' => "Daily limit reached. Resets in {$hours} hours."
            ], 429);
        }

        // 3. Check company-level daily limit (Safety net under Groq's org-wide cap)
        if (RateLimiter::tooManyAttempts($companyKey, $companyDailyLimit)) {
            return response()->json([
                'message' => "This company has hit its daily AI usage limit. Please contact support or try again tomorrow."
            ], 429);
        }

        // Proceed with the request
        $response = $next($request);

        // Increment limits only on successful API execution (2xx status codes)
        if ($response->isSuccessful()) {
            RateLimiter::hit($minuteKey, 60);
            RateLimiter::hit($dailyKey, 86400);
            RateLimiter::hit($companyKey, 86400);
        }

        // Embed remaining quota info in response headers for frontend visualization
        $remainingDaily = max(0, $dailyLimit - RateLimiter::attempts($dailyKey));
        $response->headers->set('X-AI-User-Daily-Limit', $dailyLimit);
        $response->headers->set('X-AI-User-Daily-Remaining', $remainingDaily);

        return $response;
    }
}
