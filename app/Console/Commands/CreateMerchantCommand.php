<?php

namespace App\Console\Commands;

use App\Models\Merchant;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

class CreateMerchantCommand extends Command
{
    protected $signature = 'kamolitech:merchant:create {name} {email}';

    protected $description = 'Create a new Kamolitech Pay merchant with API key';

    public function handle(): int
    {
        $name = $this->argument('name');
        $email = $this->argument('email');

        $apiKey = 'kml_live_' . Str::random(24);
        $apiSecret = Str::random(32);

        $merchant = Merchant::create([
            'name' => $name,
            'email' => $email,
            'api_key' => $apiKey,
            'api_secret' => $apiSecret,
            'is_active' => true,
        ]);

        $this->info('Merchant created successfully!');
        $this->newLine();
        $this->table(
            ['Field', 'Value'],
            [
                ['ID', $merchant->id],
                ['Name', $merchant->name],
                ['Email', $merchant->email],
                ['API Key', $apiKey],
                ['API Secret', $apiSecret],
            ]
        );

        return self::SUCCESS;
    }
}
