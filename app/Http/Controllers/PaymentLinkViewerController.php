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
                'success' => 'Payment initiated successfully! Please check your phone to confirm the USSD push.',
                'payment_uuid' => $payment->uuid,
            ]);
        } catch (\Exception $e) {
            return back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}
