<?php

use App\Http\Controllers\Api\PaymentController;
use Illuminate\Support\Facades\Route;

Route::middleware(['api', 'api_key_auth', 'throttle:60,1'])->prefix('v1')->group(function () {
    Route::post('payments', [PaymentController::class, 'store']);
    Route::get('payments/{uuid}', [PaymentController::class, 'show']);
    Route::get('payments', [PaymentController::class, 'index']);
});
