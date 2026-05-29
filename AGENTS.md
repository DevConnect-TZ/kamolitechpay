# Kamolitech Pay — Agent Implementation Guide

> **Last Updated:** 2026-05-29
> **Project:** Laravel 13.7 API Gateway wrapping Selcom C2B / Wallet Push USSD
> **Feature Scope:** Wallet Cashin via USSD Push (C2B Collection)

---

## 1. Project Overview

**Kamolitech Pay** is a centralized API gateway that wraps Selcom's C2B (Customer-to-Business) collection services. External merchants integrate with Kamolitech Pay to collect payments from Tanzanian mobile money wallets (Vodacom Mpesa, AirtelMoney, TigoPesa, Halopesa, Zantel) via USSD Push.

- All funds flow into the **central Selcom float account** (SW00193329).
- Merchants authenticate with simple API keys (`kml_` prefixed).
- Kamolitech Pay auto-detects wallet type from MSISDN prefixes.
- Selcom sends webhooks (lookup, validation, notification) to our endpoints.
- We forward payment notifications to merchant callback URLs asynchronously.

---

## 2. Selcom Credentials & Config

All outbound requests to Selcom use the **same centralized float account**:

```env
SELCOM_BASE_URL=https://apigw.selcommobile.com/v1
SELCOM_API_KEY=SW00193329-d99bd27562a64451a580ad33b62cad55
SELCOM_API_SECRET=c0729c-d28d61-4f1998-0dba3e-2c4fe2-ce
SELCOM_VENDOR_ID=SW00193329
SELCOM_VENDOR_PIN=<to_be_set_via_env_or_config>
SELCOM_C2B_TOKEN=<to_be_configured_when_Selcom_sets_up_webhooks>
```

> **CRITICAL:** The `vendor` and `pin` fields in every USSD push request are always `SW00193329` and the configured vendor PIN. They are NOT per-merchant.

---

## 3. Selcom Authentication (Outbound)

Every request to Selcom requires these headers:

| Header | Value |
|--------|-------|
| `Authorization` | `SELCOM <base64(API_KEY)>` |
| `Digest-Method` | `HS256` |
| `Digest` | `base64(hmac_sha256(signing_string, API_SECRET))` |
| `Timestamp` | ISO 8601, e.g. `2026-05-29T10:30:46+03:00` |
| `Signed-Fields` | Comma-separated parameter keys in exact signing order |

**Signing String Format:**
```
timestamp=<Timestamp>&field1=<value1>&field2=<value2>&...
```

Rules:
- `timestamp` is ALWAYS first, even if not in `Signed-Fields`.
- Fields follow the exact order declared in `Signed-Fields`.
- No extra spaces.
- Values must match request payload exactly.

**Example:**
```
Authorization: SELCOM U1cwMDE5MzMyOS1kOTliZDI3NTYyYTY0NDUxYTU4MGFkMzNiNjJjYWQ1NQ==
Digest-Method: HS256
Digest: <base64_hmac_sha256_signature>
Timestamp: 2026-05-29T10:30:46+03:00
Signed-Fields: transid,utilityref,amount,vendor,msisdn
```

---

## 4. Selcom C2B Webhook Authentication (Inbound)

Selcom sends these headers to our webhook endpoints:

```
Authorization: Bearer <SELCOM_C2B_TOKEN>
Content-Type: application/json
```

Our webhook routes must verify the `Authorization: Bearer ...` header against `SELCOM_C2B_TOKEN` in `.env`.

---

## 5. Selcom Endpoints We Use

### 5.1 Wallet Push USSD (Primary)
```
POST /v1/wallet/pushussd
```

**Payload:**
```json
{
  "transid": "<our_generated_uuid>",
  "utilityref": "<merchant_order_id_or_uuid>",
  "amount": 15000,
  "vendor": "SW00193329",
  "msisdn": "255765123456"
}
```

> **Note:** Selcom docs say `utilityref` is "payment reference or account number." We pass either the `merchant_order_id` or our internal `payment.uuid` so merchants can reconcile.

**Response:**
```json
{
  "reference": "0289999288",
  "transid": "<our_transid>",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Push sent",
  "data": []
}
```

A `SUCCESS` response here only means the push was **sent**, NOT that money was collected.

### 5.2 Query C2B Transaction Status
```
GET /v1/c2b/query-status?transid=<transid>&reference=<reference>
```

**Response:**
```json
{
  "reference": "0289999288",
  "transid": "10001",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "| COMPLETE | CONFIRMED | Payment successful\n...",
  "data": []
}
```

### 5.3 Inbound Webhooks from Selcom

Selcom sends these to our registered C2B URLs:

| Our Endpoint | Event | Purpose |
|--------------|-------|---------|
| `POST /webhooks/selcom/lookup` | Lookup | Validate `utilityref` exists, optionally return name/fixed amount |
| `POST /webhooks/selcom/validation` | Validation | Final authorization before debit. Failure = auto-reversal |
| `POST /webhooks/selcom/notification` | Notification | Payment confirmed. No response = ambiguous/hold for recon |

**Lookup / Validation / Notification Payload (same shape):**
```json
{
  "operator": "AIRTELMONEY",
  "transid": "XYZ123444",
  "reference": "033XX12211",
  "utilityref": "AB12345",
  "amount": 1000,
  "msisdn": "06534567891"
}
```

**Our Response Format (for all three):**
```json
{
  "reference": "033XX12211",
  "resultcode": "000",
  "result": "SUCCESS",
  "message": "Accepted",
  "name": "Customer Name",
  "amount": 1000
}
```

Error codes we can return:
| Code | Meaning |
|------|---------|
| `000` | Success |
| `010` | Invalid utilityref |
| `012` | Invalid amount |
| `014` | Amount too high |
| `015` | Amount too low |
| `4XX` | Other failure |

---

## 6. Wallet Auto-Detection (Tanzania)

Based on MSISDN prefix, map to Selcom `utilitycode`:

| Prefix Range | Operator | `utilitycode` |
|--------------|----------|---------------|
| `0741-0747`, `0754-0757`, `076`, `077` | Vodacom | `VMCASHIN` |
| `067`, `068`, `069`, `078`, `079` | Airtel | `AMCASHIN` |
| `065`, `071` | Tigo | `TPCASHIN` |
| `061`, `062` | Halopesa | `HPCASHIN` |
| `063` | Zantel | `ZPCASHIN` |

If prefix doesn't match → `422 Unprocessable` with `Unsupported mobile network`.

> MSISDN may come with or without `255` prefix. Normalize internally by stripping non-digits and handling both `07...` and `2557...` formats.

---

## 7. Database Schema

### 7.1 `merchants` Table
```php
Schema::create('merchants', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('email')->unique();
    $table->string('api_key')->unique();           // e.g. kml_live_abc123
    $table->string('api_secret')->nullable();        // Hashed, for future HMAC
    $table->string('webhook_url')->nullable();
    $table->boolean('is_active')->default(true);
    $table->boolean('is_test_mode')->default(false);
    $table->timestamps();
});
```

### 7.2 `payments` Table
```php
Schema::create('payments', function (Blueprint $table) {
    $table->id();
    $table->uuid('uuid')->unique();                  // Public ID: kml-pay-abc123
    $table->foreignId('merchant_id')->constrained('merchants');
    $table->string('merchant_order_id')->nullable(); // Merchant's own ID
    $table->string('selcom_transid')->unique();        // UUID sent to Selcom
    $table->string('selcom_reference')->nullable();  // Returned by Selcom
    $table->string('msisdn');
    $table->decimal('amount', 12, 2);
    $table->string('currency')->default('TZS');
    $table->string('wallet_type');                   // VMCASHIN, AMCASHIN, etc.
    $table->string('status')->default('pending');     // pending | push_sent | inprogress | success | failed | ambiguous | timeout
    $table->string('selcom_resultcode')->nullable();
    $table->string('selcom_result')->nullable();
    $table->text('selcom_message')->nullable();
    $table->json('receipt_data')->nullable();
    $table->json('notification_payload')->nullable();  // Full Selcom webhook payload
    $table->timestamp('callback_forwarded_at')->nullable();
    $table->timestamp('completed_at')->nullable();
    $table->timestamps();

    $table->index(['merchant_id', 'status']);
    $table->index('selcom_transid');
    $table->index('merchant_order_id');
});
```

**Status Lifecycle:**
```
pending → push_sent → inprogress → success
                                    ↘ failed
                                    ↘ ambiguous
                                    ↘ timeout
```

### 7.3 `payment_logs` Table
```php
Schema::create('payment_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('payment_id')->constrained('payments')->cascadeOnDelete();
    $table->enum('direction', ['outgoing', 'incoming']);
    $table->string('event');                         // pushussd_request, pushussd_response, webhook_lookup, webhook_validation, webhook_notification, status_query, callback_forwarded, callback_failed
    $table->json('payload');
    $table->string('http_status')->nullable();
    $table->timestamps();
});
```

---

## 8. Kamolitech Pay Public API Spec

All endpoints prefixed with `/api/v1/`. Authentication via `X-API-Key` header.

### 8.1 Authentication Middleware
- Read `X-API-Key` header
- Look up `merchants` table where `api_key = <value>` AND `is_active = true`
- Reject with `401` if missing/invalid

### 8.2 `POST /api/v1/payments` — Initiate Collection

**Headers:**
```
Content-Type: application/json
X-API-Key: kml_live_abc123
```

**Request Body:**
```json
{
  "msisdn": "255765123456",
  "amount": 15000,
  "merchant_order_id": "INV-2026-001",
  "callback_url": "https://merchant.com/webhooks/kamolitech"
}
```

**Validation Rules:**
- `msisdn`: required, string, valid Tanzanian mobile format
- `amount`: required, numeric, min 100, max 10,000,000
- `merchant_order_id`: optional, string, max 255
- `callback_url`: optional, url, max 500

**Logic:**
1. Authenticate merchant from `X-API-Key`
2. Normalize MSISDN (strip spaces, ensure `255` prefix)
3. Auto-detect `wallet_type` from prefix. If unsupported → `422`
4. Generate `payment.uuid` (prefixed: `kml-pay-<uuid>`)
5. Generate `selcom_transid` (unique UUID)
6. Create `payments` row with status `pending`
7. Call Selcom `POST /v1/wallet/pushussd` via `SelcomGatewayService`
8. Log outgoing request + response in `payment_logs`
9. If Selcom responds `000` → update status to `push_sent`, store `selcom_reference`
10. If Selcom responds non-000 → status `failed`, log error
11. Return `202 Accepted` with payment object

**Response (202):**
```json
{
  "success": true,
  "message": "USSD push initiated",
  "data": {
    "payment_uuid": "kml-pay-abc123",
    "status": "push_sent",
    "msisdn": "255765123456",
    "amount": 15000,
    "currency": "TZS",
    "wallet_type": "VMCASHIN",
    "merchant_order_id": "INV-2026-001",
    "created_at": "2026-05-29T10:00:00Z"
  }
}
```

**Response (422 - Unsupported Network):**
```json
{
  "success": false,
  "message": "Unsupported mobile network",
  "errors": {
    "msisdn": ["The provided mobile number does not match a supported Tanzanian wallet provider."]
  }
}
```

### 8.3 `GET /api/v1/payments/{uuid}` — Query Payment Status

**Response:**
```json
{
  "success": true,
  "data": {
    "payment_uuid": "kml-pay-abc123",
    "status": "success",
    "msisdn": "255765123456",
    "amount": 15000,
    "currency": "TZS",
    "wallet_type": "VMCASHIN",
    "selcom_reference": "0289999288",
    "selcom_resultcode": "000",
    "selcom_message": "Payment successful",
    "receipt_data": {"receipt": "12344"},
    "merchant_order_id": "INV-2026-001",
    "created_at": "2026-05-29T10:00:00Z",
    "completed_at": "2026-05-29T10:02:15Z"
  }
}
```

> **Important:** If status is `inprogress` or `ambiguous`, merchant can continue polling. We do NOT auto-query Selcom on their behalf for this MVP.

### 8.4 `GET /api/v1/payments` — List Payments

**Query Params:**
- `status` — filter by status
- `per_page` — pagination (default 15, max 100)
- `from`, `to` — date range

**Response:** Paginated list scoped to authenticated merchant.

---

## 9. Inbound Webhook Handlers

### 9.1 `POST /webhooks/selcom/lookup`

**Action:**
- Verify `Authorization: Bearer <SELCOM_C2B_TOKEN>`
- Find `payment` where `selcom_transid = payload.transid` OR `uuid = payload.utilityref`
- If found and active → return `000` with reference
- If not found → return `010` (invalid utilityref)

### 9.2 `POST /webhooks/selcom/validation`

**Action:**
- Same lookup as above
- Verify amount matches `payment.amount`
- If match → return `000` (allow debit)
- If mismatch → return `012` or `014`/`015`

> **Critical:** A failure response here causes Selcom to auto-reverse the funds. Do NOT fail lightly.

### 9.3 `POST /webhooks/selcom/notification`

**Action:**
- Verify auth token
- Find payment by `transid` / `utilityref`
- Update payment:
  - `status = 'success'` (if resultcode `000`)
  - `selcom_reference = payload.reference`
  - `selcom_resultcode = payload.resultcode`
  - `selcom_message = payload.message`
  - `notification_payload = full JSON payload`
  - `completed_at = now()`
- If resultcode non-000 → `status = 'failed'`
- Log event in `payment_logs`
- **Forward to merchant callback URL** (async via Laravel Queue `ForwardWebhookJob`):
  - If merchant has `callback_url` on the payment OR default `webhook_url` on merchant record
  - POST normalized payload
  - If non-2xx, retry up to 3 times with exponential backoff
  - If still failing, mark `callback_forwarded_at = null` and log failure

**Merchant Callback Payload Format:**
```json
{
  "event": "payment.success",
  "payment_uuid": "kml-pay-abc123",
  "merchant_order_id": "INV-2026-001",
  "status": "success",
  "amount": 15000,
  "currency": "TZS",
  "msisdn": "255765123456",
  "wallet_type": "VMCASHIN",
  "selcom_reference": "0289999288",
  "receipt_data": {"receipt": "12344"},
  "completed_at": "2026-05-29T10:02:15Z"
}
```

---

## 10. Service Classes

### 10.1 `App\Services\SelcomGatewayService`

Responsibilities:
- Build HMAC-SHA256 signed headers for every Selcom request
- Execute HTTP calls (using Laravel HTTP client)
- Handle timeouts, retries (3 attempts with exponential backoff)
- Normalize Selcom responses into standard arrays

**Key Methods:**
```php
public function pushUssd(array $payload): array;
public function queryStatus(string $transid, ?string $reference = null): array;
private function buildHeaders(array $payload, array $signedFields): array;
private function generateDigest(string $signingString): string;
```

### 10.2 `App\Services\PaymentService`

Responsibilities:
- Orchestrate the full payment lifecycle
- Normalize MSISDNs
- Auto-detect wallet type
- Update payment statuses
- Log events

### 10.3 `App\Helpers\WalletDetector`

```php
class WalletDetector
{
    public static function detect(string $msisdn): ?string; // returns VMCASHIN, AMCASHIN, etc.
    public static function normalize(string $msisdn): string; // ensures 255 prefix
}
```

---

## 11. File Structure

```
app/
├── Http/
│   ├── Controllers/
│   │   └── Api/
│   │       ├── PaymentController.php
│   │       └── WebhookController.php
│   ├── Middleware/
│   │   └── ApiKeyAuth.php
│   ├── Requests/
│   │   └── Api/
│   │       ├── CreatePaymentRequest.php
│   │       └── QueryPaymentRequest.php
│   └── Resources/
│       └── Api/
│           └── PaymentResource.php
├── Models/
│   ├── Merchant.php
│   ├── Payment.php
│   └── PaymentLog.php
├── Services/
│   ├── SelcomGatewayService.php
│   └── PaymentService.php
├── Helpers/
│   └── WalletDetector.php
└── Jobs/
    └── ForwardWebhookJob.php

config/
└── kamolitech.php

database/
└── migrations/
    ├── 2026_05_29_000001_create_merchants_table.php
    ├── 2026_05_29_000002_create_payments_table.php
    └── 2026_05_29_000003_create_payment_logs_table.php

routes/
├── api.php          # /api/v1/*
└── webhooks.php     # /webhooks/selcom/*
```

---

## 12. Routes Registration

In `bootstrap/app.php` or `RouteServiceProvider`, register:
- `routes/api.php` with `Route::middleware('api')->prefix('api/v1')`
- `routes/webhooks.php` with `Route::middleware('api')->prefix('webhooks')` (no auth middleware for Selcom — they use Bearer token)

---

## 13. Environment Variables

Add to `.env` and `.env.example`:

```env
# Kamolitech Pay
KAMOLI_ENV=sandbox

# Selcom Gateway
SELCOM_BASE_URL=https://apigw.selcommobile.com/v1
SELCOM_API_KEY=SW00193329-d99bd27562a64451a580ad33b62cad55
SELCOM_API_SECRET=c0729c-d28d61-4f1998-0dba3e-2c4fe2-ce
SELCOM_VENDOR_ID=SW00193329
SELCOM_VENDOR_PIN=
SELCOM_C2B_TOKEN=
```

---

## 14. Implementation Phases

| Phase | Work | Estimated Effort |
|-------|------|------------------|
| **Phase 1** | Config, migrations, models, `WalletDetector` helper | 1-2 hrs |
| **Phase 2** | `SelcomGatewayService` with HMAC signing + HTTP client | 2-3 hrs |
| **Phase 3** | Public API: middleware, controllers, requests, resources | 2-3 hrs |
| **Phase 4** | Webhook controllers: lookup, validation, notification | 2-3 hrs |
| **Phase 5** | `ForwardWebhookJob`, queue worker setup, testing | 2-3 hrs |
| **Phase 6** | Artisan commands (create merchant), seeds, docs | 1-2 hrs |

---

## 15. Testing Checklist

- [ ] Create merchant via artisan command
- [ ] `POST /api/v1/payments` with valid API key → returns 202
- [ ] Invalid API key → 401
- [ ] Unsupported MSISDN prefix → 422
- [ ] Selcom push USSD success → status `push_sent`, reference stored
- [ ] Selcom push USSD failure → status `failed`, error logged
- [ ] Webhook lookup/validation with valid transid → 000
- [ ] Webhook lookup with invalid transid → 010
- [ ] Webhook notification → payment status updated to `success`
- [ ] Webhook notification with callback URL → `ForwardWebhookJob` dispatched
- [ ] `GET /api/v1/payments/{uuid}` → returns correct payment state
- [ ] Status query after success → `selcom_resultcode` is `000`

---

## 16. Security Notes

1. **API Keys:** Store hashed in DB (use `Hash::make()`). Compare with `Hash::check()`.
2. **Vendor PIN:** NEVER commit to git. Only in `.env`.
3. **Selcom C2B Token:** Rotate periodically. Verify on every webhook.
4. **Callback URLs:** Validate URLs are HTTPS in production.
5. **Amount Validation:** Double-check amount on validation webhook against our DB record.
6. **Rate Limiting:** Apply `throttle:60,1` on public API routes.
7. **Idempotency:** `selcom_transid` must be unique. `merchant_order_id` should be unique per merchant.

---

## 17. Useful Artisan Commands (to be built)

```bash
# Create a merchant
php artisan kamolitech:merchant:create "Acme Corp" admin@acme.com

# Rotate API key
php artisan kamolitech:merchant:rotate-key <merchant_id>

# Query a payment status manually
php artisan kamolitech:payment:query <payment_uuid>
```

---

## 18. Gotchas & Edge Cases

1. **Selcom `transid` uniqueness:** If we reuse a `transid`, Selcom rejects. Always generate fresh UUIDs per payment attempt.
2. **MSISDN formats:** Accept `0765123456`, `255765123456`, `+255765123456`, `765123456`. Normalize to `255765123456`.
3. **Ambiguous status:** If Selcom returns `999`, merchant must poll or contact support. We do NOT auto-retry for MVP.
4. **Webhook duplicates:** Selcom may send multiple notifications. Use `selcom_reference` + `transid` composite uniqueness or check `completed_at` before updating.
5. **Callback failures:** If merchant callback fails repeatedly, we store the event but do NOT reverse funds. Merchant must query status.
6. **Timezone:** Selcom uses `+03:00` (EAT). Laravel default is UTC. Always format timestamps with `->format('Y-m-d\TH:i:sP')`.

---

*End of Agent Guide. Good luck building!*
