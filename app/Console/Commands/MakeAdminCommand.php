<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

class MakeAdminCommand extends Command
{
    protected $signature = 'kamolitech:admin:make {email}';

    protected $description = 'Promote a user to admin role';

    public function handle(): int
    {
        $email = $this->argument('email');

        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("User with email {$email} not found.");

            return self::FAILURE;
        }

        $user->update(['role' => 'admin']);

        $this->info("User {$email} has been promoted to admin.");

        return self::SUCCESS;
    }
}
