<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\PaymentLink;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PaymentLinkController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $merchant = $user->merchant;

        if (! $merchant) {
            return redirect()->route('merchant.dashboard');
        }

        $links = PaymentLink::where('merchant_id', $merchant->id)
            ->latest()
            ->paginate(15);

        return Inertia::render('merchant/payment-links/index', [
            'links' => $links,
        ]);
    }

    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $merchant = $user->merchant;

        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'amount' => 'nullable|numeric|min:100',
            'msisdn' => 'nullable|string|max:15',
        ]);

        PaymentLink::create([
            'merchant_id' => $merchant->id,
            'title' => $request->title,
            'description' => $request->description,
            'amount' => $request->amount,
            'msisdn' => $request->msisdn,
            'is_active' => true,
        ]);

        return back()->with('success', 'Payment link created successfully.');
    }

    public function destroy(int $id)
    {
        $user = auth()->user();
        $merchant = $user->merchant;

        $link = PaymentLink::where('merchant_id', $merchant->id)->findOrFail($id);
        $link->delete();

        return back()->with('success', 'Payment link deleted.');
    }
}
