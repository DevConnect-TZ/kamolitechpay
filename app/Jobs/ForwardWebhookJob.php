<?php

namespace App\Jobs;

use App\Models\Payment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class ForwardWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(
        private Payment $payment
    ) {}

    public function handle(): void
    {
        $url = $this->payment->callback_url ?? $this->payment->merchant->webhook_url;

        if (! $url) {
            return;
        }

        $payload = [
            'event' => $this->payment->status === 'success' ? 'payment.success' : 'payment.failed',
            'payment_uuid' => $this->payment->uuid,
            'merchant_order_id' => $this->payment->merchant_order_id,
            'status' => $this->payment->status,
            'amount' => (float) $this->payment->amount,
            'currency' => $this->payment->currency,
            'msisdn' => $this->payment->msisdn,
            'wallet_type' => $this->payment->wallet_type,
            'selcom_reference' => $this->payment->selcom_reference,
            'receipt_data' => $this->payment->receipt_data,
            'completed_at' => $this->payment->completed_at?->toIso8601String(),
        ];

        $response = Http::timeout(30)
            ->withHeaders([
                'X-Kamolitech-Signature' => hash_hmac('sha256', json_encode($payload), $this->payment->merchant->api_secret ?? ''),
            ])
            ->post($url, $payload);

        if ($response->successful()) {
            $this->payment->update(['callback_forwarded_at' => now()]);
        } else {
            throw new \RuntimeException('Webhook forwarding failed: ' . $response->body());
        }
    }
}
