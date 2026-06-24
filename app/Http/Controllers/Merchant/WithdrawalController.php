<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\WithdrawalRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\ValidationException;

class WithdrawalController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $merchant = $user->merchant;

        if (! $merchant) {
            return redirect()->route('merchant.dashboard');
        }

        $withdrawals = WithdrawalRequest::where('merchant_id', $merchant->id)
            ->latest()
            ->paginate(15);

        // Calculate available balance
        $totalEarned = Payment::where('merchant_id', $merchant->id)
            ->where('status', 'success')
            ->sum('amount');
            
        $totalWithdrawn = WithdrawalRequest::where('merchant_id', $merchant->id)
            ->whereIn('status', ['pending', 'completed'])
            ->sum('amount');
            
        $availableBalance = max(0, $totalEarned - $totalWithdrawn);
        
        $feePercentage = \App\Models\Setting::get('withdrawal_fee_percentage', 0);

        return Inertia::render('merchant/withdrawals/index', [
            'withdrawals' => $withdrawals,
            'available_balance' => (float) $availableBalance,
            'fee_percentage' => (float) $feePercentage,
        ]);
    }

    public function store(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();
        $merchant = $user->merchant;

        $request->validate([
            'amount' => 'required|numeric|min:1000',
            'destination_type' => 'required|in:phone,bank',
            'destination_details' => 'required|array',
        ]);

        $amount = $request->amount;
        
        $totalEarned = Payment::where('merchant_id', $merchant->id)
            ->where('status', 'success')
            ->sum('amount');
            
        $totalWithdrawn = WithdrawalRequest::where('merchant_id', $merchant->id)
            ->whereIn('status', ['pending', 'completed'])
            ->sum('amount');
            
        $availableBalance = $totalEarned - $totalWithdrawn;
        
        if ($amount > $availableBalance) {
            throw ValidationException::withMessages([
                'amount' => 'Insufficient available balance.',
            ]);
        }

        $feePercentage = \App\Models\Setting::get('withdrawal_fee_percentage', 0);
        $feeAmount = $amount * ($feePercentage / 100);
        $netAmount = $amount - $feeAmount;

        WithdrawalRequest::create([
            'merchant_id' => $merchant->id,
            'amount' => $amount,
            'fee_percentage' => $feePercentage,
            'fee_amount' => $feeAmount,
            'net_amount' => $netAmount,
            'destination_type' => $request->destination_type,
            'destination_details' => $request->destination_details,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Withdrawal request submitted successfully.');
    }
}
