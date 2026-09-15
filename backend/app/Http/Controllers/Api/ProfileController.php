<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Requests\ChangePasswordRequest;
use App\Http\Requests\UpdateAvatarRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles', 'permissions');

        return ResponseHelper::success('Profile details retrieved.', new UserResource($user));
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        
        $user->update($request->validated());

        return ResponseHelper::success('Profile updated successfully.', new UserResource($user->fresh(['roles', 'permissions'])));
    }

    public function updateAvatar(UpdateAvatarRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($user->avatar && Storage::disk('public')->exists(str_replace('/storage/', '', $user->avatar))) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $user->avatar));
            }

            $path = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = '/storage/' . $path;
            $user->save();
        }

        return ResponseHelper::success('Avatar updated successfully.', new UserResource($user->fresh(['roles', 'permissions'])));
    }

        public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->update([
            'password' => Hash::make($request->validated('password')),
        ]);

        // Log password change
        activity('activity')
            ->causedBy($user)
            ->withProperty('ip_address', $request->ip())
            ->withProperty('user_agent', $request->userAgent())
            ->log('password changed');

        $user->notify(new \App\Notifications\PasswordChangedNotification());

        return ResponseHelper::success('Password changed successfully.');
    }

}
