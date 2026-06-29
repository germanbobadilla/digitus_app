<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\VerifyEmailCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\View\View;

class RegisterController extends Controller
{
    public function showForm(Request $request): View
    {
        return view('auth.register', ['locale' => $request->route('locale')]);
    }

    public function register(Request $request): RedirectResponse
    {
        $locale = $request->route('locale');

        $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'username'              => ['required', 'string', 'max:255', 'alpha_dash', 'unique:users'],
            'email'                 => ['required', 'email', 'max:255', 'unique:users'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name'     => $request->name,
            'username' => $request->username,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $code = $user->generateEmailVerificationCode();
        $user->notify(new VerifyEmailCode($code));

        Auth::login($user);

        return redirect()->route('verification.notice', ['locale' => $locale]);
    }
}
