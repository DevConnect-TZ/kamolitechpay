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

            $resultcode = $payload['resultcode'] ?? '';

            // Map Selcom result codes to internal status
            $status = match (true) {
                $resultcode === '000'                     => 'success',
                in_array($resultcode, ['111', '927'])     => 'inprogress',
                $resultcode === '999'                     => 'ambiguous',
                default                                   => 'failed',
            };

            $isTerminal = in_array($status, ['success', 'failed']);

            $payment->update([
                'status'               => $status,
                'selcom_reference'     => $payload['reference'] ?? $payment->selcom_reference,
                'selcom_resultcode'    => $resultcode,
                'selcom_result'        => $payload['result'] ?? null,
                'selcom_message'       => $payload['message'] ?? null,
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
