<?php

namespace App\Http\Controllers;

use App\Models\PaymentLink;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentLinkViewerController extends Controller
{
    public function show(string $uuid)
    {
        $link = PaymentLink::where('uuid', $uuid)->with('merchant')->firstOrFail();

        if (!$link->is_active || !$link->merchant->is_active) {
            abort(404, 'This payment link is inactive.');
        }

        return Inertia::render('pay/show', [
            'link' => [
                'uuid' => $link->uuid,
                'title' => $link->title,
                'description' => $link->description,
                'amount' => $link->amount ? (float) $link->amount : null,
                'msisdn' => $link->msisdn,
                'merchant_name' => $link->merchant->name,
                'theme_color' => $link->merchant->theme_color ?? '#4f46e5',
                'logo_url' => $link->merchant->logo_url ? \Illuminate\Support\Facades\Storage::url($link->merchant->logo_url) : null,
            ],
        ]);
    }

    public function process(Request $request, string $uuid, PaymentService $paymentService)
    {
        $link = PaymentLink::where('uuid', $uuid)->with('merchant')->firstOrFail();

        if (!$link->is_active || !$link->merchant->is_active) {
            abort(404, 'This payment link is inactive.');
        }

        $rules = [];
        if (!$link->amount) {
            $rules['amount'] = 'required|numeric|min:100|max:10000000';
        }
        if (!$link->msisdn) {
            $rules['msisdn'] = 'required|string|max:15';
        }

        if (count($rules) > 0) {
            $request->validate($rules);
        }

        $data = [
            'amount' => $link->amount ?? $request->amount,
            'msisdn' => $link->msisdn ?? $request->msisdn,
            'merchant_order_id' => 'LINK-' . $link->id . '-' . time(),
        ];

        try {
            $payment = $paymentService->initiate($link->merchant, $data);
            
            return back()->with([
                'success' => 'Payment initiated successfully!',
                'payment_uuid' => $payment->uuid,
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function status(string $payment_uuid)
    {
        $payment = \App\Models\Payment::where('uuid', $payment_uuid)->firstOrFail();
        return response()->json([
            'status' => $payment->status,
            'message' => $payment->selcom_message,
        ]);
    }
}
