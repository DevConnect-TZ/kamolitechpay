<?php

namespace App\Http\Controllers\Merchant;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class BrandController extends Controller
{
    public function index()
    {
        $merchant = auth()->user()->merchant;
        if (!$merchant) {
            return redirect()->route('merchant.dashboard');
        }

        return Inertia::render('merchant/brand/index', [
            'merchant' => [
                'theme_color' => $merchant->theme_color ?? '#4f46e5',
                'logo_url' => $merchant->logo_url ? Storage::url($merchant->logo_url) : null,
            ]
        ]);
    }

    public function update(Request $request)
    {
        $merchant = auth()->user()->merchant;

        $request->validate([
            'theme_color' => 'required|string|size:7|starts_with:#',
            'logo' => 'nullable|image|max:2048', // max 2MB
        ]);

        $data = ['theme_color' => $request->theme_color];

        if ($request->hasFile('logo')) {
            if ($merchant->logo_url) {
                Storage::disk('public')->delete($merchant->logo_url);
            }
            $path = $request->file('logo')->store('logos', 'public');
            $data['logo_url'] = $path;
        }

        $merchant->update($data);

        return back()->with('success', 'Brand settings updated successfully.');
    }
}
