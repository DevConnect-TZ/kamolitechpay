<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use App\Models\Payment;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('dashboard', [
            'stats' => [
                'total_payments' => Payment::count(),
                'total_amount' => Payment::whereIn('status', ['push_sent', 'inprogress', 'success'])->sum('amount'),
                'successful_payments' => Payment::where('status', 'success')->count(),
                'pending_payments' => Payment::whereIn('status', ['pending', 'push_sent', 'inprogress'])->count(),
                'failed_payments' => Payment::where('status', 'failed')->count(),
                'total_merchants' => Merchant::count(),
                'active_merchants' => Merchant::where('is_active', true)->count(),
            ],
            'recent_payments' => Payment::with('merchant')
                ->latest()
                ->limit(10)
                ->get()
                ->map(fn ($p) => [
                    'uuid' => $p->uuid,
                    'merchant_name' => $p->merchant?->name,
                    'msisdn' => $p->msisdn,
                    'amount' => (float) $p->amount,
                    'status' => $p->status,
                    'wallet_type' => $p->wallet_type,
                    'created_at' => $p->created_at?->toIso8601String(),
                ]),
        ]);
    }
}
