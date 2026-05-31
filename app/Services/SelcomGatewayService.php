<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SelcomGatewayService
{
    private string $baseUrl;
    private string $apiKey;
    private string $apiSecret;
    private string $vendorId;
    private string $vendorPin;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('kamolitech.selcom.base_url'), '/');
        $this->apiKey = config('kamolitech.selcom.api_key');
        $this->apiSecret = config('kamolitech.selcom.api_secret');
        $this->vendorId = config('kamolitech.selcom.vendor_id');
        $this->vendorPin = config('kamolitech.selcom.vendor_pin');
    }

    public function pushUssd(string $transid, string $utilityref, float $amount, string $msisdn): array
    {
        $payload = [
            'transid'    => $transid,
            'utilityref' => $utilityref,
            'amount'     => $amount,
            'vendor'     => $this->vendorId,
            'pin'        => $this->vendorPin,
            'msisdn'     => $msisdn,
        ];

        $signedFields = ['transid', 'utilityref', 'amount', 'vendor', 'pin', 'msisdn'];
        $headers = $this->buildHeaders($payload, $signedFields);

        $response = Http::withHeaders($headers)
            ->timeout(30)
            ->post("{$this->baseUrl}/wallet/pushussd", $payload);

        return $response->json() ?? [
            'resultcode' => '999',
            'result' => 'AMBIGUOUS',
            'message' => 'Empty response from Selcom',
        ];
    }

    public function queryStatus(string $transid, ?string $reference = null): array
    {
        $payload = ['transid' => $transid];
        if ($reference) {
            $payload['reference'] = $reference;
        }

        $signedFields = ['transid'];
        if ($reference) {
            $signedFields[] = 'reference';
        }

        $headers = $this->buildHeaders($payload, $signedFields);

        $response = Http::withHeaders($headers)
            ->timeout(30)
            ->get("{$this->baseUrl}/c2b/query-status", $payload);

        return $response->json() ?? [
            'resultcode' => '999',
            'result' => 'AMBIGUOUS',
            'message' => 'Empty response from Selcom',
        ];
    }

    private function buildHeaders(array $payload, array $signedFields): array
    {
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
            'Authorization' => $auth,
            'Digest-Method' => 'HS256',
            'Digest' => $digest,
            'Timestamp' => $timestamp,
            'Signed-Fields' => implode(',', $signedFields),
        ];
    }

    private function generateDigest(string $signingString): string
    {
        $hash = hash_hmac('sha256', $signingString, $this->apiSecret, true);

        return base64_encode($hash);
    }

    public function getVendorId(): string
    {
        return $this->vendorId;
    }

    public function getVendorPin(): string
    {
        return $this->vendorPin;
    }
}
