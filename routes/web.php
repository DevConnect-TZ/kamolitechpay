<?php

use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\MerchantController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Merchant\DashboardController as MerchantDashboardController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');
Route::view('/docs', 'docs')->name('docs');

// Admin routes
Route::middleware(['auth', 'verified', 'admin'])->group(function () {
    Route::get('dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
    Route::get('payments', [PaymentController::class, 'index'])->name('payments.index');
    Route::get('payments/{uuid}', [PaymentController::class, 'show'])->name('payments.show');
    Route::get('merchants', [MerchantController::class, 'index'])->name('merchants.index');
    Route::get('merchants/{id}', [MerchantController::class, 'show'])->name('merchants.show');
    Route::get('withdrawals', [\App\Http\Controllers\Admin\WithdrawalController::class, 'index'])->name('withdrawals.index');
    Route::put('withdrawals/{id}', [\App\Http\Controllers\Admin\WithdrawalController::class, 'update'])->name('withdrawals.update');
    Route::get('global-settings', [\App\Http\Controllers\Admin\SettingController::class, 'index'])->name('admin.settings.index');
    Route::post('global-settings', [\App\Http\Controllers\Admin\SettingController::class, 'store'])->name('admin.settings.store');
});

// Merchant routes
Route::middleware(['auth', 'verified', 'merchant'])->group(function () {
    Route::get('merchant', [MerchantDashboardController::class, 'index'])->name('merchant.dashboard');
    Route::get('merchant/transactions', [\App\Http\Controllers\Merchant\TransactionController::class, 'index'])->name('merchant.transactions');
    Route::get('merchant/withdrawals', [\App\Http\Controllers\Merchant\WithdrawalController::class, 'index'])->name('merchant.withdrawals.index');
    Route::post('merchant/withdrawals', [\App\Http\Controllers\Merchant\WithdrawalController::class, 'store'])->name('merchant.withdrawals.store');
    Route::get('merchant/payment-links', [\App\Http\Controllers\Merchant\PaymentLinkController::class, 'index'])->name('merchant.payment-links.index');
    Route::post('merchant/payment-links', [\App\Http\Controllers\Merchant\PaymentLinkController::class, 'store'])->name('merchant.payment-links.store');
    Route::delete('merchant/payment-links/{id}', [\App\Http\Controllers\Merchant\PaymentLinkController::class, 'destroy'])->name('merchant.payment-links.destroy');
    Route::get('merchant/brand', [\App\Http\Controllers\Merchant\BrandController::class, 'index'])->name('merchant.brand.index');
    Route::post('merchant/brand', [\App\Http\Controllers\Merchant\BrandController::class, 'update'])->name('merchant.brand.update');
});

// Public payment link route
Route::get('pay/{uuid}', [\App\Http\Controllers\PaymentLinkViewerController::class, 'show'])->name('pay.show');
Route::post('pay/{uuid}', [\App\Http\Controllers\PaymentLinkViewerController::class, 'process'])->name('pay.process');
Route::get('pay/status/{payment_uuid}', [\App\Http\Controllers\PaymentLinkViewerController::class, 'status'])->name('pay.status');

require __DIR__.'/settings.php';
