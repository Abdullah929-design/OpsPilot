<?php

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\CompanyController;
use App\Http\Controllers\Api\DepartmentController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\DesignationController;
use App\Http\Controllers\Api\OfficeLocationController;
use App\Http\Controllers\Api\CompanySettingController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FolderController;
use App\Http\Controllers\Api\DocumentController;
use App\Http\Controllers\Api\DocumentVersionController;
use App\Http\Controllers\Api\CategoryController;


Route::get('/ping', function () {
    return ResponseHelper::success('pong');
});

// Dynamic base domain resolution (e.g. opspilot.test or opspilot.com)
$baseDomain = parse_url(config('app.url'), PHP_URL_HOST) ?: 'opspilot.test';

// -------------------------------------------------------------
// 1. Tenant Subdomain Routes (e.g. acme.opspilot.test/api/v1)
// -------------------------------------------------------------
Route::domain("{subdomain}.{$baseDomain}")->middleware(['resolve.tenant'])->group(function () {
    Route::prefix('v1')->group(function () {
        // Guest Auth Routes
        Route::post('/login', [AuthController::class, 'login']);
        Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('/reset-password', [AuthController::class, 'resetPassword']);
        Route::get('/auth/switch-login', [AuthController::class, 'switchLogin']);

        // Authenticated Tenant Routes
        Route::middleware(['auth:sanctum', \App\Http\Middleware\ScopeCompany::class])->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::post('/change-password', [AuthController::class, 'changePassword']);
            Route::post('/auth/switch-token', [AuthController::class, 'generateSwitchToken']);
            Route::get('/permissions', [RoleController::class, 'permissions']);
            Route::apiResource('roles', RoleController::class);
            Route::patch('/roles/{role}/permissions', [RoleController::class, 'syncPermissions']);
            Route::get('/profile', [ProfileController::class, 'show']);
            Route::put('/profile', [ProfileController::class, 'update']);
            Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
            Route::post('/profile/change-password', [ProfileController::class, 'changePassword']);
            Route::get('/activity-logs', [ActivityLogController::class, 'index']);
            Route::get('/audit-logs', [ActivityLogController::class, 'auditLogs']);
            Route::get('/notifications', [NotificationController::class, 'index']);
            Route::post('/notifications/{id}/read', [NotificationController::class, 'read']);
            Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);
            Route::get('company', [CompanyController::class, 'show']);
            Route::put('company', [CompanyController::class, 'update']);
            Route::post('company/logo', [CompanyController::class, 'uploadLogo']);
            Route::apiResource('departments', DepartmentController::class);
            Route::apiResource('departments.teams', TeamController::class)->shallow();
            Route::apiResource('designations', DesignationController::class);
            Route::apiResource('offices', OfficeLocationController::class);
            Route::get('company/settings', [CompanySettingController::class, 'index']);
            Route::put('company/settings', [CompanySettingController::class, 'update']);
            Route::get('dashboard/stats', [DashboardController::class, 'stats']);
            Route::get('employees/{employee}/documents', [\App\Http\Controllers\Api\EmployeeDocumentController::class, 'index']);
            Route::post('employees/{employee}/documents', [\App\Http\Controllers\Api\EmployeeDocumentController::class, 'store']);
            Route::delete('employees/{employee}/documents/{document}', [\App\Http\Controllers\Api\EmployeeDocumentController::class, 'destroy']);


                        // Sprint 4 Document Management
            Route::get('folders/tree', [FolderController::class, 'tree']);
            Route::apiResource('folders', FolderController::class);
            Route::get('documents/search', [DocumentController::class, 'index']);
            Route::post('documents/{document}/restore', [DocumentController::class, 'restore']);
            Route::get('documents/{document}/preview', [DocumentController::class, 'preview']);
            Route::get('documents/{document}/download', [DocumentController::class, 'download']);
            Route::post('documents/{document}/move', [DocumentController::class, 'move']);
            Route::post('documents/{document}/copy', [DocumentController::class, 'copy']);
            Route::apiResource('documents', DocumentController::class);

            Route::get('documents/{document}/versions', [DocumentVersionController::class, 'index']);
            Route::post('documents/{document}/versions', [DocumentVersionController::class, 'store']);
            Route::get('documents/{document}/versions/{version}/download', [DocumentVersionController::class, 'download']);
            Route::post('documents/{document}/versions/{version}/restore', [DocumentVersionController::class, 'restore']);

            Route::apiResource('document-categories', CategoryController::class);
            Route::get('tags', [\App\Http\Controllers\Api\TagController::class, 'index']);

            // Workflow Engine Builder Routes
            Route::apiResource('workflows', \App\Http\Controllers\Api\WorkflowController::class);
            Route::post('workflows/{workflow}/activate', [\App\Http\Controllers\Api\WorkflowController::class, 'activate']);
            Route::post('workflows/{workflow}/deactivate', [\App\Http\Controllers\Api\WorkflowController::class, 'deactivate']);
            Route::get('workflows/{workflow}/logs', [\App\Http\Controllers\Api\WorkflowController::class, 'logs']);
            Route::get('workflow-meta', [\App\Http\Controllers\Api\WorkflowController::class, 'meta']);
             // AI Routes protected by AI-specific permissions and custom rate-limiter
            Route::middleware(['permission:ai.access', 'ai.throttle'])->group(function () {
                Route::post('ai/ask', [\App\Http\Controllers\Api\AIAssistantController::class, 'ask']);
            });

            Route::middleware(['permission:ai.documents', 'ai.throttle'])->group(function () {
                Route::post('documents/{document}/suggest-metadata', [\App\Http\Controllers\Api\DocumentController::class, 'suggestMetadata']);
           });
 


        });
    });
});

// -------------------------------------------------------------
// 2. Platform Routes (e.g. platform.opspilot.test/api/platform)
// -------------------------------------------------------------
Route::domain("platform.{$baseDomain}")->group(function () {
    Route::prefix('platform')->group(function () {
        Route::post('/login', [\App\Http\Controllers\PlatformAuthController::class, 'login']);
        
        Route::middleware(['auth:platform', 'company.context'])->group(function () {
            Route::post('/logout', [\App\Http\Controllers\PlatformAuthController::class, 'logout']);
            Route::get('/me', [\App\Http\Controllers\PlatformAuthController::class, 'me']);
            Route::apiResource('plans', \App\Http\Controllers\PlanController::class);
            Route::get('companies/subdomain-check', [\App\Http\Controllers\PlatformCompanyController::class, 'checkSubdomain']);
            Route::get('companies', [\App\Http\Controllers\PlatformCompanyController::class, 'index']);
            Route::post('companies', [\App\Http\Controllers\PlatformCompanyController::class, 'store']);
            Route::get('companies/{id}', [\App\Http\Controllers\PlatformCompanyController::class, 'show']);
            Route::put('companies/{id}', [\App\Http\Controllers\PlatformCompanyController::class, 'update']);
            Route::delete('companies/{id}', [\App\Http\Controllers\PlatformCompanyController::class, 'destroy']);
            Route::post('companies/{id}/suspend', [\App\Http\Controllers\PlatformCompanyController::class, 'suspend']);
            Route::post('companies/{id}/activate', [\App\Http\Controllers\PlatformCompanyController::class, 'activate']);
            Route::put('companies/{id}/change-plan', [\App\Http\Controllers\PlatformCompanyController::class, 'changePlan']);
            Route::put('companies/{id}/assign-manager', [\App\Http\Controllers\PlatformCompanyController::class, 'assignManager']);
            Route::patch('companies/{company}/subdomain', [\App\Http\Controllers\PlatformCompanyController::class, 'updateSubdomain']);
            Route::get('users', [\App\Http\Controllers\PlatformUserController::class, 'index']);
            Route::post('users', [\App\Http\Controllers\PlatformUserController::class, 'store']);
            Route::put('users/{id}', [\App\Http\Controllers\PlatformUserController::class, 'update']);
            Route::delete('users/{id}', [\App\Http\Controllers\PlatformUserController::class, 'destroy']);
            Route::get('roles', [\App\Http\Controllers\PlatformRoleController::class, 'index']);
            Route::post('roles/{roleId}/permissions', [\App\Http\Controllers\PlatformRoleController::class, 'syncPermissions']);
            Route::get('activity-logs', [\App\Http\Controllers\PlatformActivityController::class, 'index']);
            Route::get('dashboard-stats', [\App\Http\Controllers\PlatformDashboardController::class, 'stats']);
            Route::get('settings', [\App\Http\Controllers\PlatformSettingController::class, 'index']);
            Route::post('settings', [\App\Http\Controllers\PlatformSettingController::class, 'update']);

            Route::prefix('companies/{id}')->group(function () {
            Route::get('users', [\App\Http\Controllers\PlatformCompanyUserController::class, 'index']);
            Route::post('users', [\App\Http\Controllers\PlatformCompanyUserController::class, 'store']);
            Route::put('users/{userId}', [\App\Http\Controllers\PlatformCompanyUserController::class, 'update']);
            Route::delete('users/{userId}', [\App\Http\Controllers\PlatformCompanyUserController::class, 'destroy']);    
            Route::get('employees', [\App\Http\Controllers\PlatformCompanyEmployeeController::class, 'index']);
            Route::post('employees', [\App\Http\Controllers\PlatformCompanyEmployeeController::class, 'store']);
            Route::put('employees/{employeeId}', [\App\Http\Controllers\PlatformCompanyEmployeeController::class, 'update']);
            Route::delete('employees/{employeeId}', [\App\Http\Controllers\PlatformCompanyEmployeeController::class, 'destroy']);
            Route::get('departments', [\App\Http\Controllers\PlatformCompanyEmployeeController::class, 'departments']);
            Route::get('designations', [\App\Http\Controllers\PlatformCompanyEmployeeController::class, 'designations']);
            Route::get('offices', [\App\Http\Controllers\PlatformCompanyEmployeeController::class, 'offices']);
            Route::get('roles', [\App\Http\Controllers\PlatformCompanyRoleController::class, 'index']);
            Route::post('roles/{roleId}/permissions', [\App\Http\Controllers\PlatformCompanyRoleController::class, 'syncPermissions']);
            Route::get('settings', [\App\Http\Controllers\PlatformCompanySettingController::class, 'index']);
            Route::post('settings', [\App\Http\Controllers\PlatformCompanySettingController::class, 'update']);
            Route::get('activity-logs', [\App\Http\Controllers\PlatformCompanyActivityController::class, 'index']);

            });
        });
    });
});
