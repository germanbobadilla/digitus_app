<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class LoginController extends Controller
{
    public function showForm(Request $request): View
    {
        return view('auth.login', ['locale' => $request->route('locale')]);
    }

    public function login(Request $request): RedirectResponse
    {
        $locale = $request->route('locale');

        $request->validate([
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        if (! Auth::attempt(['username' => $request->username, 'password' => $request->password], $request->boolean('remember'))) {
            return back()->withErrors([
                'username' => __('auth.failed'),
            ])->onlyInput('username');
        }

        $request->session()->regenerate();

        if (! Auth::user()->hasVerifiedEmail()) {
            return redirect()->route('verification.notice', ['locale' => $locale]);
        }

        return redirect()->intended(route('dashboard', ['locale' => $locale]));
    }
}
