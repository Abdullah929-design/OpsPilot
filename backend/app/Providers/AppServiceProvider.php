<?php

namespace App\Providers;

use App\Models\User;
use App\Models\Role; // <-- Use App\Models\Role instead of Spatie\Permission\Models\Role
use App\Policies\RolePolicy;
use App\Policies\ActivityPolicy; // <-- Add
use Spatie\Activitylog\Models\Activity; // <-- Add
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use App\Models\OfficeLocation;
use App\Policies\OfficePolicy;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Event;
use App\Events\EmployeeCreated;
use App\Events\EmployeeUpdated;
use App\Events\DocumentUploaded;
use App\Listeners\RunWorkflowsForEvent;



class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // 1. Register Policies
        Gate::policy(Role::class, RolePolicy::class);
        Gate::policy(Activity::class, ActivityPolicy::class);
        Gate::policy(OfficeLocation::class, OfficePolicy::class);
        Gate::policy(\App\Models\Company::class, \App\Policies\CompanyPolicy::class);
        Gate::policy(\App\Models\Plan::class, \App\Policies\PlanPolicy::class);
        Gate::policy(\App\Models\Employee::class, \App\Policies\EmployeePolicy::class);
        Gate::policy(\App\Models\Folder::class, \App\Policies\FolderPolicy::class);
        Gate::policy(\App\Models\Document::class, \App\Policies\DocumentPolicy::class);
        Gate::policy(\App\Models\Workflow::class, \App\Policies\WorkflowPolicy::class);


        // 2. Configure custom Spatie Activity model
        config(['activitylog.activity_model' => \App\Models\Activity::class]);

        // 3. Register Gate::before callback for permission denials
        Gate::before(function ($user, string $ability) {
            if ($user instanceof \App\Models\User) {
                $isDenied = $user->permissionDenials()
                    ->where('company_id', $user->company_id)
                    ->whereHas('permission', fn ($q) => $q->where('name', $ability))
                    ->exists();
                if ($isDenied) {
                    return false; // Explicit deny short-circuits everything
                }
            }
            return null; // Fall through to standard Spatie resolution
        });

        // 4. Configure custom URL for Next.js frontend password reset links
        ResetPassword::createUrlUsing(function (\App\Models\User $user, string $token) {
            return env('FRONTEND_URL', 'http://localhost:3000') . '/reset-password?token=' . $token . '&email=' . urlencode($user->email);
        });

                // 5. Register User Observer
        \App\Models\User::observe(\App\Observers\UserObserver::class);


          // 6. Register Workflow Engine Listeners
        Event::listen(EmployeeCreated::class, RunWorkflowsForEvent::class);
        Event::listen(EmployeeUpdated::class, RunWorkflowsForEvent::class);
        Event::listen(DocumentUploaded::class, RunWorkflowsForEvent::class);



    }
}
