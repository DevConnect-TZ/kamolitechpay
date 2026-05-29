<?php

namespace Tests\Feature\Api;

use App\Models\Merchant;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_returns_401_without_api_key(): void
    {
        $this->postJson('/api/v1/payments', [
            'msisdn' => '255765123456',
            'amount' => 15000,
        ])
            ->assertStatus(401)
            ->assertJson(['success' => false, 'message' => 'API key missing. Include X-API-Key header.']);
    }

    public function test_returns_401_with_invalid_api_key(): void
    {
        $this->withHeader('X-API-Key', 'invalid')
            ->postJson('/api/v1/payments', [
                'msisdn' => '255765123456',
                'amount' => 15000,
            ])
            ->assertStatus(401)
            ->assertJson(['success' => false, 'message' => 'Invalid or inactive API key.']);
    }

    public function test_creates_payment_with_valid_api_key(): void
    {
        $merchant = Merchant::factory()->create(['is_active' => true]);

        $response = $this->withHeader('X-API-Key', $merchant->api_key)
            ->postJson('/api/v1/payments', [
                'msisdn' => '255765123456',
                'amount' => 15000,
                'merchant_order_id' => 'INV-001',
            ]);

        $response->assertStatus(202)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => [
                    'payment_uuid',
                    'status',
                    'msisdn',
                    'amount',
                    'currency',
                    'wallet_type',
                    'merchant_order_id',
                    'created_at',
                ],
            ]);

        $this->assertDatabaseHas('payments', [
            'merchant_id' => $merchant->id,
            'merchant_order_id' => 'INV-001',
            'msisdn' => '255765123456',
            'amount' => 15000,
        ]);
    }

    public function test_returns_422_for_unsupported_msisdn(): void
    {
        $merchant = Merchant::factory()->create(['is_active' => true]);

        $this->withHeader('X-API-Key', $merchant->api_key)
            ->postJson('/api/v1/payments', [
                'msisdn' => '255999123456',
                'amount' => 15000,
            ])
            ->assertStatus(422)
            ->assertJson([
                'success' => false,
                'message' => 'Unsupported mobile network',
            ]);
    }

    public function test_returns_payment_status_by_uuid(): void
    {
        $merchant = Merchant::factory()->create(['is_active' => true]);

        $response = $this->withHeader('X-API-Key', $merchant->api_key)
            ->postJson('/api/v1/payments', [
                'msisdn' => '255765123456',
                'amount' => 15000,
            ]);

        $uuid = $response->json('data.payment_uuid');

        $this->withHeader('X-API-Key', $merchant->api_key)
            ->getJson("/api/v1/payments/{$uuid}")
            ->assertStatus(200)
            ->assertJsonPath('data.payment_uuid', $uuid);
    }

    public function test_webhook_rejects_invalid_bearer_token(): void
    {
        $this->postJson('/webhooks/selcom/lookup', [])
            ->assertStatus(401)
            ->assertJson(['message' => 'Unauthorized']);
    }
}
