<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Spatie\Permission\PermissionRegistrar;

class ScopeCompany
{
            public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        if ($user) {
            if ($user instanceof \App\Models\PlatformUser) {
                app(PermissionRegistrar::class)->setPermissionsTeamId(0);
            } else {
                // If a domain subdomain was resolved into tenant context
                if (app()->bound('current_tenant_company')) {
                    $tenantCompany = app('current_tenant_company');
                    
                    // Verify membership in company_memberships pivot
                    $membership = $user->companyMemberships()
                        ->where('companies.id', $tenantCompany->id)
                        ->first();
                        
                    if (!$membership) {
                        abort(403, 'You do not have access to this company.');
                    }
                    
                                        if (!$membership->pivot->is_active) {
                        return response()->json([
                            'message' => 'Your account has been deactivated for this company.'
                        ], 403);
                    }

                    
                    // Dynamically set the company_id and is_active properties in-memory
                    $user->company_id = $tenantCompany->id;
                    $user->is_active = (bool) $membership->pivot->is_active;
                }
                
                app(PermissionRegistrar::class)->setPermissionsTeamId($user->company_id);
                
                // Force reload roles/permissions under the correct company scope
                $user->unsetRelation('roles');
                $user->unsetRelation('permissions');
            }
        }

        return $next($request);
    }


}
