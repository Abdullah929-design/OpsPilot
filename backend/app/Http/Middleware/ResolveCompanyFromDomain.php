<?php

namespace App\Http\Middleware;

use App\Models\Company;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveCompanyFromDomain
{
    public function handle(Request $request, Closure $next): Response
    {
        $subdomain = $request->route('subdomain');

        $company = Company::where('subdomain', $subdomain)->first();
        if (!$company) {
            abort(404, 'No company found for this domain.');
        }

        // Share the resolved company globally for this request
        app()->instance('current_tenant_company', $company);

        // <-- ADD THIS: Remove subdomain so it does not inject into controller methods
        if ($request->route()) {
            $request->route()->forgetParameter('subdomain');
        }

        return $next($request);
    }
}
