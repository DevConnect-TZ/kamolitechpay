<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class SelcomGatewayService
{
    private string $baseUrl;
    private ?string $apiKey;
    private ?string $apiSecret;
    private ?string $vendorId;
    private ?string $vendorPin;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('kamolitech.selcom.base_url'), '/');
        $this->apiKey = config('kamolitech.selcom.api_key');
        $this->apiSecret = config('kamolitech.selcom.api_secret');
        $this->vendorId = config('kamolitech.selcom.vendor_id');
        $this->vendorPin = config('kamolitech.selcom.vendor_pin');
    }

    public static function generateOrderId(string $prefix = 'KML'): string
    {
        return strtoupper($prefix) . '-' . now()->format('Ymd-His') . '-' . random_int(100, 999);
    }

    public function createOrderMinimal(
        string $orderId,
        float|int $amount,
        string $buyerName,
        string $buyerEmail,
        string $phone,
        int $noOfItems = 1
    ): array {
        $payload = [
            'vendor' => $this->vendorId,
            'order_id' => $orderId,
            'buyer_email' => $buyerEmail,
            'buyer_name' => $buyerName,
            'buyer_phone' => $phone,
            'amount' => (int) round((float) $amount),
            'currency' => 'TZS',
            'no_of_items' => $noOfItems,
        ];

        return $this->request('POST', 'checkout/create-order-minimal', $payload);
    }

    public function walletPayment(string $orderId, string $msisdn): array
    {
        $payload = [
            'transid' => $orderId,
            'order_id' => $orderId,
            'msisdn' => $msisdn,
        ];

        return $this->request('POST', 'checkout/wallet-payment', $payload);
    }

    public function pushUssd(string $transid, string $utilityref, float $amount, string $msisdn): array
    {
        $buyerName = Str::limit($utilityref, 40, '');
        $buyerEmail = 'customer@kamolitech.local';

        $orderResponse = $this->createOrderMinimal($transid, $amount, $buyerName, $buyerEmail, $msisdn);

        if (! $this->isSuccessful($orderResponse)) {
            return $this->normalizeCheckoutResponse($orderResponse, 'Failed to create order on Selcom gateway');
        }

        return $this->normalizeCheckoutResponse(
            $this->walletPayment($transid, $msisdn),
            'Failed to trigger USSD push on Selcom gateway'
        );
    }

    public function queryStatus(string $transid, ?string $reference = null): array
    {
        return $this->normalizeCheckoutResponse(
            $this->getOrderStatus($reference ?: $transid),
            'Failed to query Selcom order status'
        );
    }

    public function getOrderStatus(string $orderId): array
    {
        return $this->request('GET', 'checkout/order-status', ['order_id' => $orderId]);
    }

    public function createOrderPayload(
        string $orderId,
        float|int $amount,
        string $buyerName,
        string $buyerEmail,
        string $phone,
        int $noOfItems = 1
    ): array {
        return [
            'vendor' => $this->vendorId,
            'order_id' => $orderId,
            'buyer_email' => $buyerEmail,
            'buyer_name' => $buyerName,
            'buyer_phone' => $phone,
            'amount' => (int) round((float) $amount),
            'currency' => 'TZS',
            'no_of_items' => $noOfItems,
        ];
    }

    public function walletPaymentPayload(string $orderId, string $msisdn): array
    {
        return [
            'transid' => $orderId,
            'order_id' => $orderId,
            'msisdn' => $msisdn,
        ];
    }

    public function isSuccessful(array $response): bool
    {
        $httpStatus = (int) ($response['status'] ?? $response['http_status'] ?? 0);
        $body = $response['response'] ?? $response;
        $result = strtoupper((string) ($body['result'] ?? $body['status'] ?? ''));
        $resultCode = (string) ($body['resultcode'] ?? '');

        return in_array($httpStatus, [200, 201], true)
            && ($result === 'SUCCESS' || $resultCode === '000');
    }

    private function buildHeaders(array $payload, array $signedFields): array
    {
        $this->ensureConfigured();

        $timestamp = now()->format('Y-m-d\TH:i:sP');

        $signingString = "timestamp={$timestamp}";
        foreach ($signedFields as $field) {
            $value = $payload[$field] ?? '';
            $signingString .= "&{$field}={$value}";
        }

        $digest = $this->generateDigest($signingString);
        $auth = 'SELCOM ' . base64_encode($this->apiKey);

        return [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'Authorization' => $auth,
            'Digest-Method' => 'HS256',
            'Digest' => $digest,
            'Timestamp' => $timestamp,
            'Signed-Fields' => implode(',', $signedFields),
        ];
    }

    private function request(string $method, string $path, array $payload = []): array
    {
        $url = "{$this->baseUrl}/" . ltrim($path, '/');

        if ($method === 'GET') {
            ksort($payload);
        }

        $headers = $this->buildHeaders($payload, array_keys($payload));

        try {
            $pendingRequest = Http::acceptJson()
                ->withHeaders($headers)
                ->timeout(30)
                ->retry(3, 200);

            $response = $method === 'GET'
                ? $pendingRequest->get($url, $payload)
                : $pendingRequest->post($url, $payload);

            return [
                'status' => $response->status(),
                'http_status' => $response->status(),
                'response' => $response->json() ?? $response->body(),
            ];
        } catch (Throwable $e) {
            return [
                'status' => 0,
                'http_status' => 0,
                'response' => [
                    'resultcode' => '999',
                    'result' => 'AMBIGUOUS',
                    'message' => $e->getMessage(),
                ],
            ];
        }
    }

    private function normalizeCheckoutResponse(array $response, string $defaultErrorMessage): array
    {
        $body = $response['response'] ?? [];
        $body = is_array($body) ? $body : ['message' => (string) $body];
        $success = $this->isSuccessful($response);

        return [
            'resultcode' => (string) ($body['resultcode'] ?? ($success ? '000' : '999')),
            'result' => (string) ($body['result'] ?? $body['status'] ?? ($success ? 'SUCCESS' : 'FAILED')),
            'message' => (string) ($body['message'] ?? ($success ? 'USSD push initiated' : $defaultErrorMessage)),
            'reference' => $body['reference'] ?? $body['data']['reference'] ?? $body['data']['order_id'] ?? null,
            'data' => $body['data'] ?? [],
            'http_status' => $response['http_status'] ?? $response['status'] ?? null,
            'selcom_response' => $body,
        ];
    }

    private function ensureConfigured(): void
    {
        if (! $this->apiKey || ! $this->apiSecret || ! $this->vendorId) {
            throw new RuntimeException('Selcom checkout credentials are not configured.');
        }
    }

    private function generateDigest(string $signingString): string
    {
        $hash = hash_hmac('sha256', $signingString, $this->apiSecret, true);

        return base64_encode($hash);
    }

    public function getVendorId(): string
    {
        return (string) $this->vendorId;
    }

    public function getVendorPin(): string
    {
        return (string) $this->vendorPin;
    }
}
