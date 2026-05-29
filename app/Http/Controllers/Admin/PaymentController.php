<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Inertia\Inertia;

class PaymentController extends Controller
{
    public function index()
    {
        $payments = Payment::with('merchant')
            ->latest()
            ->paginate(20)
            ->through(fn ($p) => [
                'id' => $p->id,
                'uuid' => $p->uuid,
                'merchant_name' => $p->merchant?->name,
                'msisdn' => $p->msisdn,
                'amount' => (float) $p->amount,
                'currency' => $p->currency,
                'status' => $p->status,
                'wallet_type' => $p->wallet_type,
                'selcom_reference' => $p->selcom_reference,
                'merchant_order_id' => $p->merchant_order_id,
                'created_at' => $p->created_at?->toIso8601String(),
                'completed_at' => $p->completed_at?->toIso8601String(),
            ]);

        return Inertia::render('payments/index', [
            'payments' => $payments,
            'statuses' => ['pending', 'push_sent', 'inprogress', 'success', 'failed', 'ambiguous', 'timeout'],
        ]);
    }

    public function show(string $uuid)
    {
        $payment = Payment::with(['merchant', 'logs'])
            ->where('uuid', $uuid)
            ->firstOrFail();

        return Inertia::render('payments/show', [
            'payment' => [
                'id' => $payment->id,
                'uuid' => $payment->uuid,
                'merchant' => $payment->merchant,
                'merchant_order_id' => $payment->merchant_order_id,
                'selcom_transid' => $payment->selcom_transid,
                'selcom_reference' => $payment->selcom_reference,
                'msisdn' => $payment->msisdn,
                'amount' => (float) $payment->amount,
                'currency' => $payment->currency,
                'wallet_type' => $payment->wallet_type,
                'status' => $payment->status,
                'selcom_resultcode' => $payment->selcom_resultcode,
                'selcom_result' => $payment->selcom_result,
                'selcom_message' => $payment->selcom_message,
                'receipt_data' => $payment->receipt_data,
                'notification_payload' => $payment->notification_payload,
                'callback_url' => $payment->callback_url,
                'callback_forwarded_at' => $payment->callback_forwarded_at?->toIso8601String(),
                'created_at' => $payment->created_at?->toIso8601String(),
                'completed_at' => $payment->completed_at?->toIso8601String(),
                'logs' => $payment->logs->map(fn ($log) => [
                    'id' => $log->id,
                    'direction' => $log->direction,
                    'event' => $log->event,
                    'payload' => $log->payload,
                    'created_at' => $log->created_at?->toIso8601String(),
                ]),
            ],
        ]);
    }
}
