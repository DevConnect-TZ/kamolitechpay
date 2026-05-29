<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CreatePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'msisdn' => ['required', 'string', 'regex:/^(\+?255|0)?[0-9]{9}$/'],
            'amount' => ['required', 'numeric', 'min:100', 'max:10000000'],
            'merchant_order_id' => ['nullable', 'string', 'max:255'],
            'callback_url' => ['nullable', 'url', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'msisdn.regex' => 'The msisdn must be a valid Tanzanian mobile number.',
        ];
    }
}
