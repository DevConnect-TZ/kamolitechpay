<?php

namespace App\Http\Resources\Api;

use App\Helpers\WalletDetector;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'payment_uuid' => $this->uuid,
            'status' => $this->status,
            'msisdn' => $this->msisdn,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'wallet_type' => WalletDetector::publicName($this->wallet_type),
            'merchant_order_id' => $this->merchant_order_id,
            'created_at' => $this->created_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
        ];
    }
}
