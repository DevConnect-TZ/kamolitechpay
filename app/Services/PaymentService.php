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
        $walletType = WalletDetector::detect($msisdn); // pass already-normalised value

        if (! $walletType) {
            throw new \InvalidArgumentException('Unsupported mobile network');
        }

        $payment = Payment::create([
            'uuid' => 'kml-pay-' . Str::random(12),
            'merchant_id' => $merchant->id,
            'merchant_order_id' => $data['merchant_order_id'] ?? null,
            'selcom_transid' => SelcomGatewayService::generateOrderId('KML'),
            'msisdn' => $msisdn,
            'amount' => $data['amount'],
            'currency' => 'TZS',
            'wallet_type' => $walletType,
            'status' => 'pending',
            'callback_url' => $data['callback_url'] ?? null,
        ]);

        $buyerName = (string) ($data['customer_name'] ?? $merchant->name);
        $buyerEmail = (string) ($data['customer_email'] ?? $merchant->email);

        $createOrderPayload = $this->selcom->createOrderPayload(
            $payment->selcom_transid,
            (float) $payment->amount,
            $buyerName,
            $buyerEmail,
            $payment->msisdn
        );

        $this->logEvent($payment, 'create_order_request', 'outgoing', $createOrderPayload);

        $createOrderResponse = $this->selcom->createOrderMinimal(
            $payment->selcom_transid,
            (float) $payment->amount,
            $buyerName,
            $buyerEmail,
            $payment->msisdn
        );

        $this->logEvent(
            $payment,
            'create_order_response',
            'incoming',
            $createOrderResponse,
            (string) ($createOrderResponse['http_status'] ?? $createOrderResponse['status'] ?? '')
        );

        if (! $this->selcom->isSuccessful($createOrderResponse)) {
            $payment->update([
                'status' => 'failed',
                'selcom_resultcode' => $this->selcomResultCode($createOrderResponse),
                'selcom_result' => $this->selcomResult($createOrderResponse),
                'selcom_message' => $this->selcomMessage($createOrderResponse, 'Failed to create Selcom checkout order'),
            ]);

            return $payment->fresh();
        }

        $walletPayload = $this->selcom->walletPaymentPayload($payment->selcom_transid, $payment->msisdn);

        $this->logEvent($payment, 'pushussd_request', 'outgoing', $walletPayload);

        $walletResponse = $this->selcom->walletPayment($payment->selcom_transid, $payment->msisdn);

        $this->logEvent(
            $payment,
            'pushussd_response',
            'incoming',
            $walletResponse,
            (string) ($walletResponse['http_status'] ?? $walletResponse['status'] ?? '')
        );

        if ($this->selcom->isSuccessful($walletResponse)) {
            $payment->update([
                'status' => 'push_sent',
                'selcom_reference' => $this->selcomReference($walletResponse) ?? $payment->selcom_transid,
                'selcom_resultcode' => $this->selcomResultCode($walletResponse, '000'),
                'selcom_result' => $this->selcomResult($walletResponse, 'SUCCESS'),
                'selcom_message' => $this->selcomMessage($walletResponse, 'USSD push initiated'),
            ]);
        } else {
            $payment->update([
                'status' => 'failed',
                'selcom_resultcode' => $this->selcomResultCode($walletResponse),
                'selcom_result' => $this->selcomResult($walletResponse),
                'selcom_message' => $this->selcomMessage($walletResponse, 'Failed to trigger Selcom USSD push'),
            ]);
        }

        return $payment->fresh();
    }

    public function handleWebhook(string $event, array $payload): array
    {
        $payment = $this->findPaymentFromSelcomPayload($payload);

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
            $expectedAmount = (int) round((float) $payment->amount);
            $receivedAmount = (int) round((float) ($payload['amount'] ?? 0));

            if ($expectedAmount !== $receivedAmount) {
                $code = $receivedAmount > $expectedAmount ? '014' : '015';

                return [
                    'reference'  => $payload['reference'] ?? '',
                    'resultcode' => $code,
                    'result'     => 'FAILED',
                    'message'    => 'Amount mismatch',
                ];
            }
        }

        if ($event === 'notification') {
            // Idempotency guard — ignore duplicate notifications for completed payments
            if ($payment->completed_at !== null) {
                return [
                    'reference'  => $payload['reference'] ?? '',
                    'resultcode' => '000',
                    'result'     => 'SUCCESS',
                    'message'    => 'Already processed',
                ];
            }

            $resultcode = $this->resultCodeFromPayload($payload);
            $status = $this->statusFromPayload($payload, $resultcode);

            $isTerminal = in_array($status, ['success', 'failed']);

            $payment->update([
                'status'               => $status,
                'selcom_reference'     => $this->referenceFromPayload($payload) ?? $payment->selcom_reference,
                'selcom_resultcode'    => $resultcode,
                'selcom_result'        => $payload['result'] ?? $payload['status'] ?? $payload['payment_status'] ?? null,
                'selcom_message'       => $payload['message'] ?? $payload['payment_status'] ?? $payload['status'] ?? null,
                'notification_payload' => $payload,
                'completed_at'         => $isTerminal ? now() : null,
            ]);

            // Only forward callback on terminal states (success / failed)
            if ($isTerminal && ($payment->callback_url || $payment->merchant->webhook_url)) {
                \App\Jobs\ForwardWebhookJob::dispatch($payment);
            }
        }

        return [
            'reference'  => $payload['reference'] ?? '',
            'resultcode' => '000',
            'result'     => 'SUCCESS',
            'message'    => 'Accepted',
        ];
    }

    public function refreshFromSelcom(Payment $payment): Payment
    {
        if (! in_array($payment->status, ['pending', 'push_sent', 'inprogress', 'ambiguous'], true)) {
            return $payment->fresh();
        }

        $this->logEvent($payment, 'status_query', 'outgoing', [
            'order_id' => $payment->selcom_transid,
        ]);

        $response = $this->selcom->getOrderStatus($payment->selcom_transid);

        $this->logEvent(
            $payment,
            'status_query_response',
            'incoming',
            $response,
            (string) ($response['http_status'] ?? $response['status'] ?? '')
        );

        $statusPayload = $this->statusPayloadFromResponse($response);

        if ($statusPayload === []) {
            return $payment->fresh();
        }

        $resultcode = $this->resultCodeFromPayload($statusPayload);
        $status = $this->statusFromPayload($statusPayload, $resultcode);

        if ($status === $payment->status && ! in_array($status, ['success', 'failed'], true)) {
            return $payment->fresh();
        }

        $isTerminal = in_array($status, ['success', 'failed'], true);

        $payment->update([
            'status' => $status,
            'selcom_reference' => $this->referenceFromPayload($statusPayload) ?? $payment->selcom_reference,
            'selcom_resultcode' => $resultcode,
            'selcom_result' => $statusPayload['result'] ?? $statusPayload['status'] ?? $statusPayload['payment_status'] ?? null,
            'selcom_message' => $statusPayload['message'] ?? $statusPayload['payment_status'] ?? $statusPayload['status'] ?? null,
            'receipt_data' => $statusPayload,
            'completed_at' => $isTerminal ? now() : null,
        ]);

        $payment = $payment->fresh();

        if ($isTerminal && ($payment->callback_url || $payment->merchant->webhook_url)) {
            \App\Jobs\ForwardWebhookJob::dispatch($payment);
        }

        return $payment;
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

    private function findPaymentFromSelcomPayload(array $payload): ?Payment
    {
        $values = array_values(array_filter([
            $payload['transid'] ?? null,
            $payload['tranid'] ?? null,
            $payload['tranID'] ?? null,
            $payload['order_id'] ?? null,
            $payload['utilityref'] ?? null,
            $payload['reference'] ?? null,
        ], fn ($value) => is_string($value) && $value !== ''));

        if ($values === []) {
            return null;
        }

        return Payment::query()
            ->where(function ($query) use ($values): void {
                foreach ($values as $value) {
                    $query->orWhere('selcom_transid', $value)
                        ->orWhere('selcom_reference', $value)
                        ->orWhere('uuid', $value)
                        ->orWhere('merchant_order_id', $value);
                }
            })
            ->first();
    }

    private function statusPayloadFromResponse(array $response): array
    {
        $body = $this->selcomBody($response);
        $data = $body['data'] ?? null;

        if (is_array($data) && isset($data[0]) && is_array($data[0])) {
            return $data[0];
        }

        if (is_array($data)) {
            return $data;
        }

        return array_key_exists('payment_status', $body) ? $body : [];
    }

    private function resultCodeFromPayload(array $payload): string
    {
        if (isset($payload['resultcode'])) {
            return (string) $payload['resultcode'];
        }

        $status = strtoupper((string) ($payload['payment_status'] ?? $payload['status'] ?? $payload['result'] ?? ''));

        return match ($status) {
            'COMPLETED', 'SUCCESS' => '000',
            'PENDING', 'PROCESSING', 'INPROGRESS', 'IN_PROGRESS' => '111',
            'UNKNOWN', 'AMBIGUOUS' => '999',
            default => $status === '' ? '999' : '100',
        };
    }

    private function statusFromPayload(array $payload, string $resultcode): string
    {
        $status = strtoupper((string) ($payload['payment_status'] ?? $payload['status'] ?? $payload['result'] ?? ''));

        if (in_array($status, ['COMPLETED', 'SUCCESS'], true) || $resultcode === '000') {
            return 'success';
        }

        if (in_array($status, ['FAILED', 'CANCELLED', 'CANCELED'], true)) {
            return 'failed';
        }

        return match (true) {
            in_array($resultcode, ['111', '927'], true) => 'inprogress',
            $resultcode === '999' => 'ambiguous',
            default => 'failed',
        };
    }

    private function referenceFromPayload(array $payload): ?string
    {
        return $payload['reference']
            ?? $payload['order_id']
            ?? $payload['tranID']
            ?? $payload['tranid']
            ?? $payload['transid']
            ?? null;
    }

    private function selcomBody(array $response): array
    {
        $body = $response['response'] ?? [];

        return is_array($body) ? $body : ['message' => (string) $body];
    }

    private function selcomResultCode(array $response, ?string $default = null): ?string
    {
        $body = $this->selcomBody($response);

        return isset($body['resultcode']) ? (string) $body['resultcode'] : $default;
    }

    private function selcomResult(array $response, ?string $default = null): ?string
    {
        $body = $this->selcomBody($response);

        return isset($body['result'])
            ? (string) $body['result']
            : (isset($body['status']) ? (string) $body['status'] : $default);
    }

    private function selcomMessage(array $response, string $default): string
    {
        $body = $this->selcomBody($response);

        return (string) ($body['message'] ?? $default);
    }

    private function selcomReference(array $response): ?string
    {
        $body = $this->selcomBody($response);

        return $body['reference'] ?? $body['data']['reference'] ?? $body['data']['order_id'] ?? null;
    }
}
