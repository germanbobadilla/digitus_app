@extends('layouts.app')

@section('title', __('messages.verify_email'))

@section('main-class', 'flex items-center justify-center min-h-[80vh]')

@section('content')
<div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

    <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <svg class="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-900">{{ __('messages.verify_email') }}</h1>
        <p class="text-sm text-gray-500 mt-2">
            {{ __('messages.verify_instruction', ['email' => Auth::user()->email]) }}
        </p>
    </div>

    <form method="POST" action="{{ route('verification.verify', ['locale' => $locale]) }}" class="space-y-5">
        @csrf

        <div>
            <label for="code" class="block text-sm font-medium text-gray-700 mb-1">
                {{ __('messages.verification_code') }}
            </label>
            <input id="code" name="code" type="text" inputmode="numeric" pattern="[0-9]{6}"
                   maxlength="6" required autofocus placeholder="000000"
                   class="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl tracking-widest font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 @error('code') border-red-400 @enderror">
            @error('code')
                <p class="mt-1 text-xs text-red-600 text-center">{{ $message }}</p>
            @enderror
        </div>

        <button type="submit"
                class="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 transition">
            {{ __('messages.verify') }}
        </button>
    </form>

    <form method="POST" action="{{ route('verification.resend', ['locale' => $locale]) }}" class="mt-4">
        @csrf
        <button type="submit" class="w-full text-sm text-blue-600 hover:underline">
            {{ __('messages.resend_code') }}
        </button>
    </form>
</div>
@endsection
