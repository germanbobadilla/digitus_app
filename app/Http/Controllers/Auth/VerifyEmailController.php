<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Notifications\VerifyEmailCode;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;

class VerifyEmailController extends Controller
{
    public function showForm(Request $request): View|RedirectResponse
    {
        if ($request->user()->hasVerifiedEmail()) {
            return redirect()->route('dashboard', ['locale' => $request->route('locale')]);
        }

        return view('auth.verify-email', ['locale' => $request->route('locale')]);
    }

    public function verify(Request $request): RedirectResponse
    {
        $locale = $request->route('locale');

        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();

        if (! $user->hasValidVerificationCode($request->code)) {
            return back()->withErrors([
                'code' => __('auth.verification_invalid'),
            ]);
        }

        $user->markEmailAsVerified();

        return redirect()->route('dashboard', ['locale' => $locale])
            ->with('status', __('auth.verification_success'));
    }

    public function resend(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->route('dashboard', ['locale' => $request->route('locale')]);
        }

        $code = $user->generateEmailVerificationCode();
        $user->notify(new VerifyEmailCode($code));

        return back()->with('status', __('auth.verification_sent'));
    }
}
