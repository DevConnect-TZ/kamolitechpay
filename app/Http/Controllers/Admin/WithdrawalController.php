<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WithdrawalController extends Controller
{
    public function index(Request $request)
    {
        $query = WithdrawalRequest::with('merchant')->latest();

        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $withdrawals = $query->paginate(20)->withQueryString()->through(fn ($w) => [
            'id' => $w->id,
            'merchant_name' => $w->merchant?->name,
            'merchant_id' => $w->merchant_id,
            'amount' => (float) $w->amount,
            'fee_percentage' => (float) $w->fee_percentage,
            'fee_amount' => (float) $w->fee_amount,
            'net_amount' => (float) $w->net_amount,
            'destination_type' => $w->destination_type,
            'destination_details' => $w->destination_details,
            'status' => $w->status,
            'admin_notes' => $w->admin_notes,
            'created_at' => $w->created_at?->toIso8601String(),
            'processed_at' => $w->processed_at?->toIso8601String(),
        ]);

        return Inertia::render('withdrawals/index', [
            'withdrawals' => $withdrawals,
            'filters' => $request->only('status'),
        ]);
    }

    public function update(Request $request, int $id)
    {
        $request->validate([
            'status' => 'required|in:completed,rejected',
            'admin_notes' => 'nullable|string|max:1000',
        ]);

        $withdrawal = WithdrawalRequest::findOrFail($id);
        
        if ($withdrawal->status !== 'pending') {
            return back()->with('error', 'Only pending requests can be processed.');
        }

        $withdrawal->update([
            'status' => $request->status,
            'admin_notes' => $request->admin_notes,
            'processed_at' => now(),
        ]);

        return back()->with('success', 'Withdrawal request processed successfully.');
    }
}
