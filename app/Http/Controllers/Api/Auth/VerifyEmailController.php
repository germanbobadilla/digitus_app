<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Notifications\VerifyEmailCode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerifyEmailController extends Controller
{
    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ]);

        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => __('auth.already_verified')]);
        }

        if (! $user->hasValidVerificationCode($request->code)) {
            return response()->json([
                'message' => __('auth.verification_invalid'),
            ], 422);
        }

        $user->markEmailAsVerified();

        return response()->json([
            'message' => __('auth.verification_success'),
            'user'    => $user,
        ]);
    }

    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return response()->json(['message' => __('auth.already_verified')]);
        }

        $code = $user->generateEmailVerificationCode();
        $user->notify(new VerifyEmailCode($code));

        return response()->json(['message' => __('auth.verification_sent')]);
    }
}
