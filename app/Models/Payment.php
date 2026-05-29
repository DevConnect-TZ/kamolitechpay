<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'uuid',
        'merchant_id',
        'merchant_order_id',
        'selcom_transid',
        'selcom_reference',
        'msisdn',
        'amount',
        'currency',
        'wallet_type',
        'status',
        'callback_url',
        'selcom_resultcode',
        'selcom_result',
        'selcom_message',
        'receipt_data',
        'notification_payload',
        'callback_forwarded_at',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'receipt_data' => 'array',
            'notification_payload' => 'array',
            'callback_forwarded_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(PaymentLog::class);
    }
}
