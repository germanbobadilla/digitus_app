@extends('layouts.app')

@section('title', __('messages.login'))

@section('main-class', 'flex items-center justify-center min-h-[80vh]')

@section('content')
<div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

    <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-gray-900">{{ __('messages.login') }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ __('messages.tagline') }}</p>
    </div>

    <form method="POST" action="{{ route('login', ['locale' => $locale]) }}" class="space-y-5">
        @csrf

        <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                {{ __('messages.username') }}
            </label>
            <input id="username" name="username" type="text" autocomplete="username" required autofocus
                   value="{{ old('username') }}"
                   class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 @error('username') border-red-400 @enderror">
            @error('username')
                <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
            @enderror
        </div>

        <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                {{ __('messages.password') }}
            </label>
            <input id="password" name="password" type="password" autocomplete="current-password" required
                   class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 @error('password') border-red-400 @enderror">
            @error('password')
                <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
            @enderror
        </div>

        <div class="flex items-center justify-between text-sm">
            <label class="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" name="remember" class="rounded border-gray-300">
                {{ __('messages.remember_me') }}
            </label>
        </div>

        <button type="submit"
                class="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 transition">
            {{ __('messages.login') }}
        </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500">
        {{ __('messages.no_account') }}
        <a href="{{ route('register', ['locale' => $locale]) }}" class="text-blue-600 font-medium hover:underline">
            {{ __('messages.register') }}
        </a>
    </p>
</div>
@endsection
