<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class MerchantFactory extends Factory
{
    protected $model = \App\Models\Merchant::class;

    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'email' => $this->faker->unique()->safeEmail(),
            'api_key' => 'kml_live_' . Str::random(24),
            'api_secret' => Str::random(32),
            'webhook_url' => null,
            'is_active' => true,
            'is_test_mode' => false,
        ];
    }
}
