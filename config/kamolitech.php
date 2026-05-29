<?php

return [
    'env' => env('KAMOLI_ENV', 'sandbox'),

    'selcom' => [
        'base_url' => env('SELCOM_BASE_URL', 'https://apigw.selcommobile.com/v1'),
        'api_key' => env('SELCOM_API_KEY'),
        'api_secret' => env('SELCOM_API_SECRET'),
        'vendor_id' => env('SELCOM_VENDOR_ID'),
        'vendor_pin' => env('SELCOM_VENDOR_PIN'),
        'c2b_token' => env('SELCOM_C2B_TOKEN'),
    ],

    'statuses' => [
        'pending',
        'push_sent',
        'inprogress',
        'success',
        'failed',
        'ambiguous',
        'timeout',
    ],
];
