<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\CreatePaymentRequest;
use App\Http\Resources\Api\PaymentResource;
use App\Models\Payment;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private PaymentService $paymentService
    ) {}

    public function store(CreatePaymentRequest $request): JsonResponse
    {
        /** @var \App\Models\Merchant $merchant */
        $merchant = $request->user();

        try {
            $payment = $this->paymentService->initiate($merchant, $request->validated());

            return response()->json([
                'success' => true,
                'message' => 'USSD push initiated',
                'data' => new PaymentResource($payment),
            ], 202);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
                'errors' => [
                    'msisdn' => ['The provided mobile number does not match a supported Tanzanian wallet provider.'],
                ],
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to initiate payment: ' . $e->getMessage(),
            ], 500);
        }
    }

    public function show(string $uuid): JsonResponse
    {
        /** @var \App\Models\Merchant $merchant */
        $merchant = request()->user();

        $payment = Payment::where('uuid', $uuid)
            ->where('merchant_id', $merchant->id)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => new PaymentResource($payment),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        /** @var \App\Models\Merchant $merchant */
        $merchant = $request->user();

        $query = Payment::where('merchant_id', $merchant->id)
            ->when($request->input('status'), fn ($q, $status) => $q->where('status', $status))
            ->when($request->input('from'), fn ($q, $from) => $q->whereDate('created_at', '>=', $from))
            ->when($request->input('to'), fn ($q, $to) => $q->whereDate('created_at', '<=', $to))
            ->orderByDesc('created_at');

        $perPage = min((int) $request->input('per_page', 15), 100);

        return response()->json([
            'success' => true,
            'data' => PaymentResource::collection($query->paginate($perPage)),
        ]);
    }
}
