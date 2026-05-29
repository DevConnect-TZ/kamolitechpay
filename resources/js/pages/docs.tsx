import { Head, Link } from '@inertiajs/react';
import { Server } from 'lucide-react';

export default function Docs() {
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
                    Welcome to the Kamolitech Pay API documentation.
                </p>

                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#f9fafb', padding: '24px', marginBottom: '32px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Base URL</h2>
                    <code style={{ display: 'block', backgroundColor: '#111827', color: '#d1d5db', padding: '12px', borderRadius: '6px', fontSize: '14px' }}>
                        https://api.kamolitechpay.com/api/v1
                    </code>
                </div>

                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Authentication</h2>
                    <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                        All requests require an <code style={{ backgroundColor: '#f3f4f6', padding: '2px 6px', borderRadius: '4px', fontSize: '13px' }}>X-API-Key</code> header.
                    </p>
                    <code style={{ display: 'block', backgroundColor: '#111827', color: '#d1d5db', padding: '16px', borderRadius: '6px', fontSize: '14px', whiteSpace: 'pre-wrap' }}>
                        X-API-Key: kml_live_xxxxxxxxxxxxxxxxxxxxxxxx
                    </code>
                </div>

                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Initiate Payment</h2>
                    <div style={{ display: 'inline-block', backgroundColor: '#8DB600', color: '#ffffff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>POST</div>
                    <span style={{ marginLeft: '8px', fontFamily: 'monospace', fontSize: '14px', color: '#374151' }}>/api/v1/payments</span>

                    <pre style={{ marginTop: '16px', backgroundColor: '#111827', color: '#d1d5db', padding: '16px', borderRadius: '6px', fontSize: '14px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
{`{
  "msisdn": "255765123456",
  "amount": 15000,
  "merchant_order_id": "INV-001"
}`}
                    </pre>
                </div>

                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Query Payment</h2>
                    <div style={{ display: 'inline-block', backgroundColor: '#2563eb', color: '#ffffff', padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700 }}>GET</div>
                    <span style={{ marginLeft: '8px', fontFamily: 'monospace', fontSize: '14px', color: '#374151' }}>/api/v1/payments/{'{uuid}'}</span>
                </div>

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

                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '24px', marginBottom: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Supported Wallets</h2>
                    <table style={{ width: '100%', fontSize: '14px', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Operator</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600 }}>Prefixes</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style={{ borderTop: '1px solid #f3f4f6' }}><td style={{ padding: '12px 16px' }}>Vodacom Mpesa</td><td style={{ padding: '12px 16px', color: '#6b7280' }}>0741-0747, 0754-0757, 076, 077</td></tr>
                            <tr style={{ borderTop: '1px solid #f3f4f6' }}><td style={{ padding: '12px 16px' }}>AirtelMoney</td><td style={{ padding: '12px 16px', color: '#6b7280' }}>067, 068, 069, 078, 079</td></tr>
                            <tr style={{ borderTop: '1px solid #f3f4f6' }}><td style={{ padding: '12px 16px' }}>TigoPesa</td><td style={{ padding: '12px 16px', color: '#6b7280' }}>065, 071</td></tr>
                            <tr style={{ borderTop: '1px solid #f3f4f6' }}><td style={{ padding: '12px 16px' }}>Halopesa</td><td style={{ padding: '12px 16px', color: '#6b7280' }}>061, 062</td></tr>
                            <tr style={{ borderTop: '1px solid #f3f4f6' }}><td style={{ padding: '12px 16px' }}>Zantel</td><td style={{ padding: '12px 16px', color: '#6b7280' }}>063</td></tr>
                        </tbody>
                    </table>
                </div>

                <div style={{ borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#ffffff', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Webhook Events</h2>
                    <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '16px' }}>
                        When a payment completes, we POST to your callback URL:
                    </p>
                    <pre style={{ backgroundColor: '#111827', color: '#d1d5db', padding: '16px', borderRadius: '6px', fontSize: '14px', overflowX: 'auto', whiteSpace: 'pre-wrap' }}>
{`{
  "event": "payment.success",
  "payment_uuid": "kml-pay-abc123",
  "status": "success",
  "amount": 15000,
  "currency": "TZS",
  "msisdn": "255765123456",
  "wallet_type": "VMCASHIN"
}`}
                    </pre>
                </div>

                <div style={{ marginTop: '48px', borderTop: '1px solid #e5e7eb', paddingTop: '24px', textAlign: 'center', fontSize: '14px', color: '#6b7280' }}>
                    Need help? Contact us at{' '}
                    <a href="mailto:support@kamolitechpay.com" style={{ fontWeight: 600, color: '#8DB600', textDecoration: 'none' }}>
                        support@kamolitechpay.com
                    </a>
                </div>
            </main>
        </div>
    );
}
