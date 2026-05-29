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
});

// Merchant routes
Route::middleware(['auth', 'verified', 'merchant'])->group(function () {
    Route::get('merchant', [MerchantDashboardController::class, 'index'])->name('merchant.dashboard');
});

require __DIR__.'/settings.php';
