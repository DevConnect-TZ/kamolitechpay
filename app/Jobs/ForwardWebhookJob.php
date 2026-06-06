<?php

namespace App\Jobs;

use App\Helpers\WalletDetector;
use App\Models\Payment;
use App\Models\PaymentLog;
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

    /**
     * Exponential backoff: 30s → 60s → 120s between retries.
     */
    public function backoff(): array
    {
        return [30, 60, 120];
    }

    public function handle(): void
    {
        $url = $this->payment->callback_url ?? $this->payment->merchant->webhook_url;

        if (! $url) {
            return;
        }

        $payload = [
            'event'            => $this->payment->status === 'success' ? 'payment.success' : 'payment.failed',
            'payment_uuid'     => $this->payment->uuid,
            'merchant_order_id'=> $this->payment->merchant_order_id,
            'status'           => $this->payment->status,
            'amount'           => (float) $this->payment->amount,
            'currency'         => $this->payment->currency,
            'msisdn'           => $this->payment->msisdn,
            'wallet_type'      => WalletDetector::publicName($this->payment->wallet_type),
            'completed_at'     => $this->payment->completed_at?->toIso8601String(),
        ];

        $response = Http::timeout(30)
            ->withHeaders([
                'Content-Type'            => 'application/json',
                'X-Kamolitech-Signature'  => hash_hmac(
                    'sha256',
                    json_encode($payload),
                    $this->payment->merchant->api_secret ?? ''
                ),
            ])
            ->post($url, $payload);

        if ($response->successful()) {
            $this->payment->update(['callback_forwarded_at' => now()]);

            PaymentLog::create([
                'payment_id'  => $this->payment->id,
                'direction'   => 'outgoing',
                'event'       => 'callback_forwarded',
                'payload'     => $payload,
                'http_status' => (string) $response->status(),
            ]);
        } else {
            // Will trigger backoff retry; failed() handles final failure logging
            throw new \RuntimeException(
                'Webhook forwarding failed (' . $response->status() . '): ' . $response->body()
            );
        }
    }

    /**
     * Called after all retry attempts are exhausted.
     * Logs the failure — does NOT reverse or alter payment status.
     */
    public function failed(\Throwable $exception): void
    {
        PaymentLog::create([
            'payment_id'  => $this->payment->id,
            'direction'   => 'outgoing',
            'event'       => 'callback_failed',
            'payload'     => [
                'url'     => $this->payment->callback_url ?? $this->payment->merchant->webhook_url,
                'error'   => $exception->getMessage(),
                'attempts'=> $this->attempts(),
            ],
            'http_status' => null,
        ]);
    }
}
