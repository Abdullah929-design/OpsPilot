<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\CreateUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\UserService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Http\Requests\SyncUserPermissionsRequest;
use App\Http\Requests\SyncUserPermissionDenialsRequest;
use App\Models\UserPermissionDenial;
use Spatie\Permission\Models\Permission;
use Illuminate\Support\Facades\DB;


class UserController extends Controller
{
    use AuthorizesRequests;

    protected UserService $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $status = $request->has('is_active') ? $request->boolean('is_active') : null;
        $users = $this->userService->getPaginatedUsers(
            $request->query('search'),
            $request->query('role'),
            $status,
            (int) $request->query('per_page', 15)
        );

        return ResponseHelper::success('Users retrieved successfully.', [
            'items' => UserResource::collection($users->items()),
            'pagination' => [
                'total' => $users->total(),
                'per_page' => $users->perPage(),
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
            ],
        ]);
    }

    public function store(CreateUserRequest $request): JsonResponse
    {
        $user = $this->userService->createUser($request->validated());

        return ResponseHelper::success('User created successfully.', new UserResource($user), 201);
    }

        public function show(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return ResponseHelper::success('User details retrieved.', new UserResource($user->load('roles', 'permissions', 'companyMemberships')));
    }


        public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $updatedUser = $this->userService->updateUser($user, $request->validated());

        return ResponseHelper::success('User updated successfully.', new UserResource($updatedUser));
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        $this->userService->deleteUser($request->user(), $user);

        return ResponseHelper::success('User deleted successfully.');
    }

    public function activate(User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $updatedUser = $this->userService->toggleActiveStatus($user, true);
        $updatedUser->load('companyMemberships');

        return ResponseHelper::success('User activated successfully.', new UserResource($updatedUser));
    }

    public function deactivate(User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $updatedUser = $this->userService->toggleActiveStatus($user, false);
        $updatedUser->load('companyMemberships');

        return ResponseHelper::success('User deactivated successfully.', new UserResource($updatedUser));
    }


        public function permissionsBreakdown(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        $deniedPermissions = $user->permissionDenials()
            ->where('company_id', auth()->user()->company_id)
            ->with('permission')
            ->get()
            ->pluck('permission.name')
            ->unique()
            ->values();

        return ResponseHelper::success('Permissions retrieved.', [
            'role_permissions'      => $user->getPermissionsViaRoles()->pluck('name')->unique()->values(),
            'direct_permissions'    => $user->getDirectPermissions()->pluck('name')->unique()->values(),
            'denied_permissions'    => $deniedPermissions,
            'effective_permissions' => $user->getAllPermissions()
                ->pluck('name')
                ->diff($deniedPermissions)
                ->unique()
                ->values(),
        ]);
    }

    public function syncCustomPermissions(SyncUserPermissionsRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $requestedPermissions = $request->validated('permissions', []);
        $currentUser = auth()->user();

         if (!$currentUser->can('permissions.manage')) {
            $userPermissions = $currentUser->getAllPermissions()->pluck('name')->toArray();
            $unownedPermissions = array_diff($requestedPermissions, $userPermissions);
            
            if (!empty($unownedPermissions)) {
                return ResponseHelper::error(
                    'You cannot grant custom permissions that you do not possess: ' . implode(', ', $unownedPermissions),
                    [],
                    403
                );
            }
        }

        $user->syncPermissions($requestedPermissions);

        activity('audit')
            ->performedOn($user)
            ->causedBy($currentUser)
            ->withProperty('permissions', $requestedPermissions)
            ->withProperty('ip_address', $request->ip())
            ->withProperty('user_agent', $request->userAgent())
            ->log('user.custom_permissions_granted');

        return ResponseHelper::success('Custom permissions updated.', [
            'direct_permissions' => $user->getDirectPermissions()->pluck('name'),
        ]);
    }

    public function syncPermissionDenials(SyncUserPermissionDenialsRequest $request, User $user): JsonResponse
    {
        $this->authorize('update', $user);

        $companyId = auth()->user()->company_id;
        $permissionIds = Permission::whereIn('name', $request->validated('permissions'))->pluck('id', 'name');

        DB::transaction(function () use ($user, $permissionIds, $companyId) {
            // Scope deletion and creation to the current company
            $user->permissionDenials()->where('company_id', $companyId)->delete();
            
            foreach ($permissionIds as $name => $id) {
                UserPermissionDenial::create([
                    'user_id'       => $user->id,
                    'permission_id' => $id,
                    'company_id'    => $companyId,
                ]);
            }
        });

                activity('audit')
            ->performedOn($user)
            ->causedBy(auth()->user())
            ->withProperty('denied_permissions', $request->validated('permissions'))
            ->withProperty('ip_address', $request->ip())
            ->withProperty('user_agent', $request->userAgent())
            ->log('user.custom_permissions_denied');

        return ResponseHelper::success('Permission denials updated.', [
            'denied_permissions' => $request->validated('permissions'),
        ]);
    }

}
