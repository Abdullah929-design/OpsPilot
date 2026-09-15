<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    /**
     * Display a listing of the tags names for autocomplete.
     */
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;
        $type = $request->query('type'); // e.g., 'document'

        $query = Tag::where('company_id', $companyId);

        // Optionally filter tags that are assigned to documents
        if ($type === 'document') {
            $query->whereHas('documents');
        }

        // Retrieve only tag names for clean autocomplete array integration
        $tagNames = $query->pluck('name');

        return ResponseHelper::success('Tags retrieved successfully.', $tagNames);
    }
}
