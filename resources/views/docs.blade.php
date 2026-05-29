<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>API Documentation - Kamolitech Pay</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #111827; line-height: 1.6; }
        .container { max-width: 1024px; margin: 0 auto; padding: 0 24px; }
        header { border-bottom: 1px solid #e5e7eb; background: #ffffff; padding: 16px 24px; }
        header a { display: flex; align-items: center; gap: 8px; text-decoration: none; }
        header .logo { background: #8DB600; border-radius: 8px; padding: 8px; display: inline-flex; }
        header .logo svg { width: 20px; height: 20px; color: #ffffff; }
        header .brand { font-size: 18px; font-weight: 700; color: #111827; }
        main { padding: 48px 0; }
        h1 { font-size: 36px; font-weight: 800; color: #111827; margin-bottom: 16px; }
        .subtitle { font-size: 18px; color: #4b5563; margin-bottom: 32px; }
        .card { border-radius: 8px; border: 1px solid #e5e7eb; background: #ffffff; padding: 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .card-muted { background: #f9fafb; }
        h2 { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 8px; }
        p { font-size: 14px; color: #4b5563; margin-bottom: 8px; }
        code { font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
        pre { background: #111827; color: #d1d5db; padding: 16px; border-radius: 6px; font-size: 14px; overflow-x: auto; white-space: pre-wrap; margin-top: 12px; }
        .method { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; color: #ffffff; margin-right: 8px; }
        .method-post { background: #8DB600; }
        .method-get { background: #2563eb; }
        .endpoint { font-family: monospace; font-size: 14px; color: #374151; }
        table { width: 100%; font-size: 14px; border-collapse: collapse; }
        th { background: #f9fafb; padding: 12px 16px; text-align: left; font-weight: 600; }
        td { padding: 12px 16px; border-top: 1px solid #f3f4f6; }
        td.prefix { color: #6b7280; }
        ul.docs-list { font-size: 14px; color: #4b5563; line-height: 2; padding-left: 20px; }
        ul.docs-list li { margin-bottom: 4px; }
        ul.docs-list strong { color: #111827; }
        footer { margin-top: 48px; border-top: 1px solid #e5e7eb; padding-top: 24px; text-align: center; font-size: 14px; color: #6b7280; }
        footer a { font-weight: 600; color: #8DB600; text-decoration: none; }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <a href="/">
                <span class="logo">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="8" x="2" y="2" rx="2" ry="2"/><rect width="20" height="8" x="2" y="14" rx="2" ry="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>
                </span>
                <span class="brand">Kamolitech Pay</span>
            </a>
        </div>
    </header>

    <main class="container">
        <h1>API Documentation</h1>
        <p class="subtitle">Welcome to the Kamolitech Pay API documentation.</p>

        <div class="card card-muted">
            <h2>Base URL</h2>
            <pre>https://api.kamolitechpay.com/api/v1</pre>
        </div>

        <div class="card">
            <h2>Authentication</h2>
            <p>All requests require an <code>X-API-Key</code> header.</p>
            <pre>X-API-Key: kml_live_xxxxxxxxxxxxxxxxxxxxxxxx</pre>
        </div>

        <div class="card">
            <h2>Initiate Payment</h2>
            <div class="method method-post">POST</div>
            <span class="endpoint">/api/v1/payments</span>
            <pre>{
  "msisdn": "255765123456",
  "amount": 15000,
  "merchant_order_id": "INV-001"
}</pre>
        </div>

        <div class="card">
            <h2>Query Payment</h2>
            <div class="method method-get">GET</div>
            <span class="endpoint">/api/v1/payments/{uuid}</span>
        </div>

        <div class="card">
            <h2>Payment Statuses</h2>
            <ul class="docs-list">
                <li><strong>pending</strong> — Request created</li>
                <li><strong>push_sent</strong> — USSD push sent to phone</li>
                <li><strong>inprogress</strong> — Customer interacting</li>
                <li><strong>success</strong> — Payment completed</li>
                <li><strong>failed</strong> — Payment failed</li>
                <li><strong>ambiguous</strong> — Status unknown</li>
                <li><strong>timeout</strong> — No customer response</li>
            </ul>
        </div>

        <div class="card">
            <h2>Supported Wallets</h2>
            <table>
                <thead>
                    <tr><th>Operator</th><th>Prefixes</th></tr>
                </thead>
                <tbody>
                    <tr><td>Vodacom Mpesa</td><td class="prefix">0741-0747, 0754-0757, 076, 077</td></tr>
                    <tr><td>AirtelMoney</td><td class="prefix">067, 068, 069, 078, 079</td></tr>
                    <tr><td>TigoPesa</td><td class="prefix">065, 071</td></tr>
                    <tr><td>Halopesa</td><td class="prefix">061, 062</td></tr>
                    <tr><td>Zantel</td><td class="prefix">063</td></tr>
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>Webhook Events</h2>
            <p>When a payment completes, we POST to your callback URL:</p>
            <pre>{
  "event": "payment.success",
  "payment_uuid": "kml-pay-abc123",
  "status": "success",
  "amount": 15000,
  "currency": "TZS",
  "msisdn": "255765123456",
  "wallet_type": "VMCASHIN"
}</pre>
        </div>

        <footer>
            Need help? Contact us at <a href="mailto:support@kamolitechpay.com">support@kamolitechpay.com</a>
        </footer>
    </main>
</body>
</html>
