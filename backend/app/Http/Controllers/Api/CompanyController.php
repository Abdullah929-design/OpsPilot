<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateCompanyRequest;
use App\Http\Resources\CompanyResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CompanyController extends Controller
{
    use AuthorizesRequests;

    public function show(Request $request): JsonResponse
    {
        $company = app('current_tenant_company');
        $this->authorize('view', $company);

        return ResponseHelper::success('Company retrieved successfully.', new CompanyResource($company));
    }

    public function update(UpdateCompanyRequest $request): JsonResponse
    {
        $company = app('current_tenant_company');
        $this->authorize('update', $company);

        $company->update($request->validated());

        return ResponseHelper::success('Company updated successfully.', new CompanyResource($company));
    }

    public function uploadLogo(Request $request): JsonResponse
    {
        $company = app('current_tenant_company');
        $this->authorize('update', $company);

        $request->validate([
            'logo' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:2048'],
        ]);

        if ($request->hasFile('logo')) {
            // Delete old logo file if it exists
            if ($company->logo) {
                Storage::disk('public')->delete(str_replace('/storage/', '', parse_url($company->logo, PHP_URL_PATH)));
            }

            $path = $request->file('logo')->store('logos', 'public');
            $company->update(['logo' => '/storage/' . $path]);
        }

        return ResponseHelper::success('Logo uploaded successfully.', new CompanyResource($company));
    }
}
