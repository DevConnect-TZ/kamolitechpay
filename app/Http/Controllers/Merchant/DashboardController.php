<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $merchant = $user->merchant;

        if (! $merchant) {
            return Inertia::render('merchant/dashboard', [
                'stats' => null,
                'api_key' => null,
                'recent_payments' => [],
                'message' => 'Your merchant account is not fully set up yet.',
            ]);
        }

        $paymentsQuery = Payment::where('merchant_id', $merchant->id);

        return Inertia::render('merchant/dashboard', [
            'stats' => [
                'total_payments' => $paymentsQuery->clone()->count(),
                'total_amount' => $paymentsQuery->clone()->where('status', 'success')->sum('amount'),
                'successful_payments' => $paymentsQuery->clone()->where('status', 'success')->count(),
                'pending_payments' => $paymentsQuery->clone()->whereIn('status', ['pending', 'push_sent', 'inprogress'])->count(),
                'failed_payments' => $paymentsQuery->clone()->where('status', 'failed')->count(),
            ],
            'api_key' => $merchant->api_key,
            'webhook_url' => $merchant->webhook_url,
            'recent_payments' => Payment::where('merchant_id', $merchant->id)
                ->with('merchant')
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn ($p) => [
                    'uuid' => $p->uuid,
                    'msisdn' => $p->msisdn,
                    'amount' => (float) $p->amount,
                    'status' => $p->status,
                    'wallet_type' => $p->wallet_type,
                    'created_at' => $p->created_at?->toIso8601String(),
                ]),
        ]);
    }
}
