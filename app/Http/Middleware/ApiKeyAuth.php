<?php

namespace App\Http\Middleware;

use App\Models\Merchant;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiKeyAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        $apiKey = $request->header('X-API-Key');

        if (! $apiKey) {
            return response()->json([
                'success' => false,
                'message' => 'API key missing. Include X-API-Key header.',
            ], 401);
        }

        $merchant = Merchant::where('api_key', $apiKey)
            ->where('is_active', true)
            ->first();

        if (! $merchant) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or inactive API key.',
            ], 401);
        }

        $request->setUserResolver(fn () => $merchant);

        return $next($request);
    }
}
