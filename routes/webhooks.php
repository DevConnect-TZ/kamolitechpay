<?php

use App\Http\Controllers\Api\WebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('selcom')->group(function () {
    Route::post('lookup', [WebhookController::class, 'lookup']);
    Route::post('validation', [WebhookController::class, 'validation']);
    Route::post('notification', [WebhookController::class, 'notification']);
});
