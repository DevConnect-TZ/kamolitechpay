import { Head, Link } from '@inertiajs/react';
import { Server, Copy, Check } from 'lucide-react';
import { useState } from 'react';

function CodeBlock({ code, label }: { code: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div style={{ position: 'relative', marginTop: '16px' }}>
            {label && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
                    <button
                        onClick={handleCopy}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            background: 'transparent',
                            border: 'none',
                            color: '#9ca3af',
                            fontSize: '12px',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            )}
            <pre
                style={{
                    backgroundColor: '#111827',
                    color: '#d1d5db',
                    padding: '16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.6,
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                }}
            >
                {code}
            </pre>
        </div>
    );
}

export default function Docs() {
    const BASE = 'https://pay.kamolitech.store/api/v1';
    const API_KEY = 'kml_live_xxxxxxxxxxxxxxxxxxxxxxxx';

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', color: '#111827', fontFamily: 'sans-serif' }}>
            <Head title="API Documentation" />

            <header style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '16px 24px' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                    <div style={{ borderRadius: '8px', backgroundColor: '#8DB600', padding: '8px', display: 'inline-flex' }}>
                        <Server style={{ height: 20, width: 20, color: '#ffffff' }} />
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>Kamolitech Pay</span>
                </Link>
            </header>

            <main style={{ maxWidth: '1024px', margin: '0 auto', padding: '48px 24px' }}>
                <h1 style={{ fontSize: '36px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
                    API Documentation
                </h1>
                <p style={{ fontSize: '18px', color: '#4b5563', marginBottom: '32px' }}>
                    Welcome to the Kamolitech Pay API documentation. Integrate wallet collections into your application in minutes.
                </p>

                {/* Base URL */}
                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', padding: '24px', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Base URL</h2>
                    <code style={{ display: 'block', backgroundColor: '#111827', color: '#d1d5db', padding: '12px', borderRadius: '6px', fontSize: '14px' }}>
                        {BASE}
                    </code>
                </div>

                {/* Authentication */}
                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Authentication</h2>
                    <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                        All requests require an <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>X-API-Key</code> header.
                    </p>
                    <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                        Responses use Kamolitech Pay fields only. Processor references, gateway result codes, and raw gateway receipts are not returned in public API responses.
                    </p>
                    <CodeBlock
                        label="Header"
                        code={`X-API-Key: ${API_KEY}`}
                    />
                </div>

                {/* Initiate Payment */}
                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Initiate Payment</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ display: 'inline-block', backgroundColor: '#8DB600', color: '#ffffff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>POST</div>
                        <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#374151' }}>/api/v1/payments</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                        Initiates a USSD push to the customer's mobile wallet. The customer receives a prompt on their phone to confirm the payment.
                    </p>

                    <CodeBlock
                        label="Request Body"
                        code={`{
  "msisdn": "255765123456",
  "amount": 15000,
  "merchant_order_id": "INV-2026-001",
  "callback_url": "https://your-site.com/webhooks/kamolitech"
}`}
                    />

                    <CodeBlock
                        label="cURL"
                        code={`curl -X POST ${BASE}/payments \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${API_KEY}" \\
  -d '{
    "msisdn": "255765123456",
    "amount": 15000,
    "merchant_order_id": "INV-2026-001",
    "callback_url": "https://your-site.com/webhooks/kamolitech"
  }'`}
                    />

                    <CodeBlock
                        label="Response (202 Accepted)"
                        code={`{
  "success": true,
  "message": "USSD push initiated",
  "data": {
    "payment_uuid": "kml-pay-abc123def456",
    "status": "push_sent",
    "msisdn": "255765123456",
    "amount": 15000,
    "currency": "TZS",
    "wallet_type": "vodacom",
    "merchant_order_id": "INV-2026-001",
    "created_at": "2026-05-29T10:00:00Z"
  }
}`}
                    />
                </div>

                {/* Query Payment */}
                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Query Payment</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ display: 'inline-block', backgroundColor: '#2563eb', color: '#ffffff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>GET</div>
                        <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#374151' }}>/api/v1/payments/{'{uuid}'}</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                        Retrieve the current status of a payment using the <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>payment_uuid</code> returned from the initiate endpoint.
                    </p>

                    <CodeBlock
                        label="cURL"
                        code={`curl -X GET ${BASE}/payments/kml-pay-abc123def456 \\
  -H "X-API-Key: ${API_KEY}"`}
                    />

                    <CodeBlock
                        label="Response (200 OK)"
                        code={`{
  "success": true,
  "data": {
    "payment_uuid": "kml-pay-abc123def456",
    "status": "success",
    "msisdn": "255765123456",
    "amount": 15000,
    "currency": "TZS",
    "wallet_type": "vodacom",
    "merchant_order_id": "INV-2026-001",
    "created_at": "2026-05-29T10:00:00Z",
    "completed_at": "2026-05-29T10:02:15Z"
  }
}`}
                    />
                </div>

                {/* List Payments */}
                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>List Payments</h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div style={{ display: 'inline-block', backgroundColor: '#2563eb', color: '#ffffff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>GET</div>
                        <span style={{ fontFamily: 'monospace', fontSize: '14px', color: '#374151' }}>/api/v1/payments</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                        List all payments for your merchant account. Supports filtering by status and date range.
                    </p>

                    <CodeBlock
                        label="Query Parameters"
                        code={`status      optional  Filter by status (pending, push_sent, success, failed, etc.)
per_page    optional  Items per page (default: 15, max: 100)
from        optional  Start date (Y-m-d)
to          optional  End date (Y-m-d)`}
                    />

                    <CodeBlock
                        label="cURL"
                        code={`curl -X GET "${BASE}/payments?status=success&per_page=20&from=2026-05-01&to=2026-05-31" \\
  -H "X-API-Key: ${API_KEY}"`}
                    />
                </div>

                {/* Error Responses */}
                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Error Responses</h2>
                    <CodeBlock
                        label="401 Unauthorized"
                        code={`{
  "success": false,
  "message": "Invalid or missing API key"
}`}
                    />
                    <CodeBlock
                        label="422 Unprocessable — Unsupported Network"
                        code={`{
  "success": false,
  "message": "Unsupported mobile network",
  "errors": {
    "msisdn": ["The provided mobile number does not match a supported Tanzanian wallet provider."]
  }
}`}
                    />
                    <CodeBlock
                        label="422 Unprocessable — Validation Error"
                        code={`{
  "success": false,
  "message": "The amount field must be at least 100.",
  "errors": {
    "amount": ["The amount field must be at least 100."]
  }
}`}
                    />
                </div>

                {/* Payment Statuses */}
                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Payment Statuses</h2>
                    <ul style={{ fontSize: '14px', color: '#4b5563', lineHeight: 2 }}>
                        <li><strong style={{ color: '#111827' }}>pending</strong> — Request created</li>
                        <li><strong style={{ color: '#111827' }}>push_sent</strong> — USSD push sent to phone</li>
                        <li><strong style={{ color: '#111827' }}>inprogress</strong> — Customer interacting</li>
                        <li><strong style={{ color: '#111827' }}>success</strong> — Payment completed</li>
                        <li><strong style={{ color: '#111827' }}>failed</strong> — Payment failed</li>
                        <li><strong style={{ color: '#111827' }}>ambiguous</strong> — Status unknown</li>
                        <li><strong style={{ color: '#111827' }}>timeout</strong> — No customer response</li>
                    </ul>
                </div>

                {/* Supported Wallets */}
                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Supported Wallets</h2>
                    <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Operator</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Prefixes</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Wallet Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderTop: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '12px 16px' }}>Vodacom Mpesa</td>
                                <td style={{ padding: '12px 16px', color: '#6b7280' }}>0741-0747, 0754-0757, 076, 077</td>
                                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>vodacom</td>
                            </tr>
                            <tr style={{ borderTop: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '12px 16px' }}>AirtelMoney</td>
                                <td style={{ padding: '12px 16px', color: '#6b7280' }}>067, 068, 069, 078, 079</td>
                                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>airtel</td>
                            </tr>
                            <tr style={{ borderTop: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '12px 16px' }}>TigoPesa</td>
                                <td style={{ padding: '12px 16px', color: '#6b7280' }}>065, 071</td>
                                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>tigo</td>
                            </tr>
                            <tr style={{ borderTop: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '12px 16px' }}>Halopesa</td>
                                <td style={{ padding: '12px 16px', color: '#6b7280' }}>061, 062</td>
                                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>halopesa</td>
                            </tr>
                            <tr style={{ borderTop: '1px solid #f3f4f6' }}>
                                <td style={{ padding: '12px 16px' }}>Zantel</td>
                                <td style={{ padding: '12px 16px', color: '#6b7280' }}>063</td>
                                <td style={{ padding: '12px 16px', fontFamily: 'monospace', fontSize: '12px', color: '#6b7280' }}>zantel</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Webhook Events */}
                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Webhook Events</h2>
                    <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                        When a payment completes, we POST to your callback URL with the following payload:
                    </p>
                    <CodeBlock
                        label="Payload"
                        code={`{
  "event": "payment.success",
  "payment_uuid": "kml-pay-abc123def456",
  "merchant_order_id": "INV-2026-001",
  "status": "success",
  "amount": 15000,
  "currency": "TZS",
  "msisdn": "255765123456",
  "wallet_type": "vodacom",
  "completed_at": "2026-05-29T10:02:15Z"
}`}
                    />
                </div>

                {/* Testing with curl */}
                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Quick Test</h2>
                    <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                        Here is a complete example that initiates a payment and then immediately queries its status:
                    </p>
                    <CodeBlock
                        label="Shell Script"
                        code={`#!/bin/bash

API_KEY="${API_KEY}"
BASE="${BASE}"

# 1. Initiate payment
RESPONSE=$(curl -s -X POST "${BASE}/payments" \\
  -H "Content-Type: application/json" \\
  -H "X-API-Key: ${API_KEY}" \\
  -d '{
    "msisdn": "255765123456",
    "amount": 15000,
    "merchant_order_id": "TEST-001"
  }')

PAYMENT_UUID=$(echo $RESPONSE | grep -o '"payment_uuid":"[^"]*"' | cut -d'"' -f4)

echo "Payment UUID: $PAYMENT_UUID"
echo "Initiate Response:"
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"

# 2. Query status after a few seconds
sleep 5

QUERY=$(curl -s -X GET "${BASE}/payments/${PAYMENT_UUID}" \\
  -H "X-API-Key: ${API_KEY}")

echo ""
echo "Query Response:"
echo "$QUERY" | python3 -m json.tool 2>/dev/null || echo "$QUERY"`}
                    />
                </div>

                <div style={{ marginTop: '48px', borderTop: '1px solid #e5e7eb', paddingTop: '24px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                    Need help? Contact us at{' '}
                    <a href="mailto:support@kamolitech.store" style={{ fontWeight: 600, color: '#8DB600', textDecoration: 'none' }}>
                        support@kamolitech.store
                    </a>
                </div>
            </main>
        </div>
    );
}
