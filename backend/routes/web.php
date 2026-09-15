<?php

use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\EmployeeController;


// Dynamic base domain resolution (e.g. opspilot.test or opspilot.com)
$baseDomain = parse_url(config('app.url'), PHP_URL_HOST) ?: 'opspilot.test';

// Wrap tenant routes in subdomain resolution and resolve.tenant middleware
Route::domain("{subdomain}.{$baseDomain}")->middleware(['web', 'resolve.tenant'])->group(function () {
    Route::prefix('api/v1')->group(function () {
        // Guest Auth Routes
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
         Route::get('/auth/switch-login', [AuthController::class, 'switchLogin']);

        // Authenticated Routes
        Route::middleware(['auth:sanctum,web', \App\Http\Middleware\ScopeCompany::class])->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/change-password', [AuthController::class, 'changePassword']);

            // User Management API
            Route::apiResource('users', UserController::class);
            Route::patch('users/{user}/activate', [UserController::class, 'activate']);
            Route::patch('users/{user}/deactivate', [UserController::class, 'deactivate']);

            // User Custom (Direct) Permissions Endpoints
            Route::get('users/{user}/permissions', [UserController::class, 'permissionsBreakdown']);
            Route::patch('users/{user}/permissions/grants', [UserController::class, 'syncCustomPermissions']);
            Route::patch('users/{user}/permissions/denials', [UserController::class, 'syncPermissionDenials']);

            // Employee Management API
            Route::apiResource('employees', EmployeeController::class);
            Route::post('employees/{id}/restore', [EmployeeController::class, 'restore']);
            Route::patch('employees/{employee}/status', [EmployeeController::class, 'updateStatus']);
            Route::post('employees/{employee}/photo', [EmployeeController::class, 'uploadPhoto']);


        });
    });
});
