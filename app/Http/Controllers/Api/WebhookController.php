<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WebhookController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    public function lookup(Request $request): JsonResponse
    {
        if (! $this->verifyToken($request)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $response = $this->paymentService->handleWebhook('lookup', $request->all());

        return response()->json($response);
    }

    public function validation(Request $request): JsonResponse
    {
        if (! $this->verifyToken($request)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $response = $this->paymentService->handleWebhook('validation', $request->all());

        return response()->json($response);
    }

    public function notification(Request $request): JsonResponse
    {
        if (! $this->verifyToken($request)) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $response = $this->paymentService->handleWebhook('notification', $request->all());

        return response()->json($response);
    }

    private function verifyToken(Request $request): bool
    {
        $header = $request->header('Authorization', '');
        $token = config('kamolitech.selcom.c2b_token');

        if (! is_string($token) || $token === '') {
            return false;
        }

        return hash_equals('Bearer ' . $token, $header);
    }
}
