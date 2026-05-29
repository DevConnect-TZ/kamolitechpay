<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Merchant;
use Inertia\Inertia;

class MerchantController extends Controller
{
    public function index()
    {
        $merchants = Merchant::withCount('payments')
            ->withSum('payments', 'amount')
            ->latest()
            ->paginate(20)
            ->through(fn ($m) => [
                'id' => $m->id,
                'name' => $m->name,
                'email' => $m->email,
                'api_key' => $m->api_key,
                'webhook_url' => $m->webhook_url,
                'is_active' => $m->is_active,
                'is_test_mode' => $m->is_test_mode,
                'payments_count' => $m->payments_count,
                'payments_sum_amount' => (float) ($m->payments_sum_amount ?? 0),
                'created_at' => $m->created_at?->toIso8601String(),
            ]);

        return Inertia::render('merchants/index', [
            'merchants' => $merchants,
        ]);
    }

    public function show(int $id)
    {
        $merchant = Merchant::with(['payments' => fn ($q) => $q->latest()->limit(50)])
            ->findOrFail($id);

        return Inertia::render('merchants/show', [
            'merchant' => [
                'id' => $merchant->id,
                'name' => $merchant->name,
                'email' => $merchant->email,
                'api_key' => $merchant->api_key,
                'webhook_url' => $merchant->webhook_url,
                'is_active' => $merchant->is_active,
                'is_test_mode' => $merchant->is_test_mode,
                'created_at' => $merchant->created_at?->toIso8601String(),
                'payments' => $merchant->payments->map(fn ($p) => [
                    'uuid' => $p->uuid,
                    'msisdn' => $p->msisdn,
                    'amount' => (float) $p->amount,
                    'status' => $p->status,
                    'wallet_type' => $p->wallet_type,
                    'created_at' => $p->created_at?->toIso8601String(),
                ]),
            ],
        ]);
    }
}
