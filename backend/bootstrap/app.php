<?php

use App\Helpers\ResponseHelper;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use App\Http\Middleware\ScopeCompany;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->statefulApi();
        
        $middleware->encryptCookies(except: [
            'sso_switch_token',
        ]);
        

        $middleware->alias([
            'role' => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission' => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
            'company.context' => \App\Http\Middleware\ScopeCompany::class, // <-- Add this alias
            'resolve.tenant' => \App\Http\Middleware\ResolveCompanyFromDomain::class,
            'ai.throttle' => \App\Http\Middleware\ThrottleAI::class, 
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

                $exceptions->render(function (Throwable $e, Request $request) {
            if ($request->is('api/*')) {
                $status = 500;
                $message = app()->environment('local') ? $e->getMessage() : 'Something went wrong.';

                if ($e instanceof AuthenticationException) {
                    $status = 401;
                } elseif ($e instanceof ValidationException) {
                    $status = 422;
                } elseif ($e instanceof AuthorizationException) {
                    $status = 403;
                    $message = 'not authorized to perform the task';
                } elseif (method_exists($e, 'getStatusCode')) {
                    $status = $e->getStatusCode();
                }

                return ResponseHelper::error(
                    $message,
                    $e instanceof ValidationException ? $e->errors() : [],
                    $status
                );
            }
        });
    })->create();
