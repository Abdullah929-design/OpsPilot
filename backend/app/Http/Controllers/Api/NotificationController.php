<?php

namespace App\Http\Controllers\Api;

use App\Helpers\ResponseHelper;
use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $notifications = $request->user()->notifications()
            ->where(function ($query) use ($companyId) {
                $query->where('data->company_id', $companyId)
                      ->orWhereNull('data->company_id');
            })
            ->take(30)
            ->get();

        return ResponseHelper::success('Notifications retrieved.', NotificationResource::collection($notifications));
    }

    public function read(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        return ResponseHelper::success('Notification marked as read.');
    }

    public function readAll(Request $request): JsonResponse
    {
        $companyId = $request->user()->company_id;

        $request->user()->unreadNotifications()
            ->where(function ($query) use ($companyId) {
                $query->where('data->company_id', $companyId)
                      ->orWhereNull('data->company_id');
            })
            ->get()
            ->markAsRead();

        return ResponseHelper::success('All notifications marked as read.');
    }
}
