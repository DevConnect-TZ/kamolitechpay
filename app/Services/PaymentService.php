<?php

namespace App\Services;

use App\Helpers\WalletDetector;
use App\Models\Merchant;
use App\Models\Payment;
use App\Models\PaymentLog;
use Illuminate\Support\Str;

class PaymentService
{
    public function __construct(
        private SelcomGatewayService $selcom
    ) {}

    public function initiate(Merchant $merchant, array $data): Payment
    {
        $msisdn = WalletDetector::normalize($data['msisdn']);
        $walletType = WalletDetector::detect($data['msisdn']);

        if (! $walletType) {
            throw new \InvalidArgumentException('Unsupported mobile network');
        }

        $payment = Payment::create([
            'uuid' => 'kml-pay-' . Str::random(12),
            'merchant_id' => $merchant->id,
            'merchant_order_id' => $data['merchant_order_id'] ?? null,
            'selcom_transid' => (string) Str::uuid(),
            'msisdn' => $msisdn,
            'amount' => $data['amount'],
            'currency' => 'TZS',
            'wallet_type' => $walletType,
            'status' => 'pending',
            'callback_url' => $data['callback_url'] ?? null,
        ]);

        $this->logEvent($payment, 'pushussd_request', 'outgoing', [
            'transid' => $payment->selcom_transid,
            'utilityref' => $payment->merchant_order_id ?? $payment->uuid,
            'amount' => $payment->amount,
            'msisdn' => $payment->msisdn,
        ]);

        $response = $this->selcom->pushUssd(
            $payment->selcom_transid,
            $payment->merchant_order_id ?? $payment->uuid,
            (float) $payment->amount,
            $payment->msisdn
        );

        $this->logEvent($payment, 'pushussd_response', 'incoming', $response, $response['resultcode'] ?? null);

        if (($response['resultcode'] ?? '') === '000') {
            $payment->update([
                'status' => 'push_sent',
                'selcom_reference' => $response['reference'] ?? null,
                'selcom_resultcode' => $response['resultcode'],
                'selcom_result' => $response['result'] ?? null,
                'selcom_message' => $response['message'] ?? null,
            ]);
        } else {
            $payment->update([
                'status' => 'failed',
                'selcom_resultcode' => $response['resultcode'] ?? null,
                'selcom_result' => $response['result'] ?? null,
                'selcom_message' => $response['message'] ?? null,
            ]);
        }

        return $payment->fresh();
    }

    public function handleWebhook(string $event, array $payload): array
    {
        $transid = $payload['transid'] ?? null;
        $utilityref = $payload['utilityref'] ?? null;

        $payment = Payment::where('selcom_transid', $transid)
            ->orWhere('uuid', $utilityref)
            ->orWhere('merchant_order_id', $utilityref)
            ->first();

        if (! $payment) {
            return [
                'reference' => $payload['reference'] ?? '',
                'resultcode' => '010',
                'result' => 'FAILED',
                'message' => 'Invalid utilityref',
            ];
        }

        $this->logEvent($payment, "webhook_{$event}", 'incoming', $payload);

        if ($event === 'validation') {
            $expectedAmount = (float) $payment->amount;
            $receivedAmount = (float) ($payload['amount'] ?? 0);

            if ($expectedAmount !== $receivedAmount) {
                return [
                    'reference' => $payload['reference'] ?? '',
                    'resultcode' => '012',
                    'result' => 'FAILED',
                    'message' => 'Invalid amount',
                ];
            }
        }

        if ($event === 'notification') {
            $resultcode = $payload['resultcode'] ?? '';
            $status = $resultcode === '000' ? 'success' : 'failed';

            $payment->update([
                'status' => $status,
                'selcom_reference' => $payload['reference'] ?? $payment->selcom_reference,
                'selcom_resultcode' => $resultcode,
                'selcom_result' => $payload['result'] ?? null,
                'selcom_message' => $payload['message'] ?? null,
                'notification_payload' => $payload,
                'completed_at' => now(),
            ]);

            if ($payment->callback_url || $payment->merchant->webhook_url) {
                \App\Jobs\ForwardWebhookJob::dispatch($payment);
            }
        }

        return [
            'reference' => $payload['reference'] ?? '',
            'resultcode' => '000',
            'result' => 'SUCCESS',
            'message' => 'Accepted',
        ];
    }

    private function logEvent(Payment $payment, string $event, string $direction, array $payload, ?string $httpStatus = null): void
    {
        PaymentLog::create([
            'payment_id' => $payment->id,
            'direction' => $direction,
            'event' => $event,
            'payload' => $payload,
            'http_status' => $httpStatus,
        ]);
    }
}
