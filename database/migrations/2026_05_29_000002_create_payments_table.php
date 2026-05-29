<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('merchant_id')->constrained('merchants');
            $table->string('merchant_order_id')->nullable();
            $table->string('selcom_transid')->unique();
            $table->string('selcom_reference')->nullable();
            $table->string('msisdn');
            $table->decimal('amount', 12, 2);
            $table->string('currency')->default('TZS');
            $table->string('wallet_type');
            $table->string('status')->default('pending');
            $table->string('callback_url')->nullable();
            $table->string('selcom_resultcode')->nullable();
            $table->string('selcom_result')->nullable();
            $table->text('selcom_message')->nullable();
            $table->json('receipt_data')->nullable();
            $table->json('notification_payload')->nullable();
            $table->timestamp('callback_forwarded_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->index(['merchant_id', 'status']);
            $table->index('selcom_transid');
            $table->index('merchant_order_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
