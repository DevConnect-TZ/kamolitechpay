<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use Inertia\Inertia;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $merchant = $user->merchant;

        if (! $merchant) {
            return redirect()->route('merchant.dashboard');
        }

        $query = Payment::where('merchant_id', $merchant->id)->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $payments = $query->paginate(20)->withQueryString()->through(fn ($p) => [
            'uuid' => $p->uuid,
            'msisdn' => $p->msisdn,
            'amount' => (float) $p->amount,
            'status' => $p->status,
            'wallet_type' => $p->wallet_type,
            'merchant_order_id' => $p->merchant_order_id,
            'created_at' => $p->created_at?->toIso8601String(),
        ]);

        return Inertia::render('merchant/transactions', [
            'transactions' => $payments,
            'filters' => $request->only('status'),
        ]);
    }
}
