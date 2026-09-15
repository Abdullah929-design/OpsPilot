<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTeamRequest;
use App\Http\Requests\UpdateTeamRequest;
use App\Http\Resources\TeamResource;
use App\Models\Department;
use App\Models\Team;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class TeamController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Department $department): JsonResponse
    {
        // View policy check on the parent department
        $this->authorize('view', $department);

        $query = $department->teams();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $teams = $query->latest()->get();

        return ResponseHelper::success('Teams retrieved successfully.', TeamResource::collection($teams));
    }

    public function store(StoreTeamRequest $request, Department $department): JsonResponse
    {
        // StoreTeamRequest handle tenant checks
        $team = $department->teams()->create($request->validated());

        return ResponseHelper::success('Team created successfully.', new TeamResource($team), 201);
    }

    public function show(Team $team): JsonResponse
    {
        $this->authorize('view', $team);

        return ResponseHelper::success('Team retrieved successfully.', new TeamResource($team));
    }

    public function update(UpdateTeamRequest $request, Team $team): JsonResponse
    {
        // UpdateTeamRequest handle tenant checks
        $team->update($request->validated());

        return ResponseHelper::success('Team updated successfully.', new TeamResource($team));
    }

    public function destroy(Team $team): JsonResponse
    {
        $this->authorize('delete', $team);

        $team->delete();

        return ResponseHelper::success('Team deleted successfully.');
    }
}
