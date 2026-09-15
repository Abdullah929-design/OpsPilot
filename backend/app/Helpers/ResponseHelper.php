<?php

namespace App\Helpers;

class ResponseHelper
{
    public static function success(string $message, $data = [], int $status = 200)
    {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => $data,
        ], $status);
    }

    public static function error(string $message, $errors = [], int $status = 422)
    {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors' => $errors,
        ], $status);
    }
}