<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        return Inertia::render('admin/settings/index', [
            'withdrawal_fee_percentage' => (float) Setting::get('withdrawal_fee_percentage', 0),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'withdrawal_fee_percentage' => 'required|numeric|min:0|max:100',
        ]);

        Setting::set('withdrawal_fee_percentage', $request->withdrawal_fee_percentage);

        return back()->with('success', 'Settings updated successfully.');
    }
}
