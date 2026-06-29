@extends('layouts.app')

@section('title', __('messages.register'))

@section('main-class', 'flex items-center justify-center min-h-[80vh] py-10')

@section('content')
<div class="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

    <div class="mb-8 text-center">
        <h1 class="text-2xl font-bold text-gray-900">{{ __('messages.register') }}</h1>
        <p class="text-sm text-gray-500 mt-1">{{ __('messages.tagline') }}</p>
    </div>

    <form method="POST" action="{{ route('register', ['locale' => $locale]) }}" class="space-y-5">
        @csrf

        <div>
            <label for="name" class="block text-sm font-medium text-gray-700 mb-1">
                {{ __('messages.name') }}
            </label>
            <input id="name" name="name" type="text" autocomplete="name" required autofocus
                   value="{{ old('name') }}"
                   class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 @error('name') border-red-400 @enderror">
            @error('name')
                <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
            @enderror
        </div>

        <div>
            <label for="username" class="block text-sm font-medium text-gray-700 mb-1">
                {{ __('messages.username') }}
            </label>
            <input id="username" name="username" type="text" autocomplete="username" required
                   value="{{ old('username') }}"
                   class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 @error('username') border-red-400 @enderror">
            @error('username')
                <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
            @enderror
        </div>

        <div>
            <label for="email" class="block text-sm font-medium text-gray-700 mb-1">
                {{ __('messages.email') }}
            </label>
            <input id="email" name="email" type="email" autocomplete="email" required
                   value="{{ old('email') }}"
                   class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 @error('email') border-red-400 @enderror">
            @error('email')
                <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
            @enderror
        </div>

        <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                {{ __('messages.password') }}
            </label>
            <input id="password" name="password" type="password" autocomplete="new-password" required
                   class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 @error('password') border-red-400 @enderror">
            @error('password')
                <p class="mt-1 text-xs text-red-600">{{ $message }}</p>
            @enderror
        </div>

        <div>
            <label for="password_confirmation" class="block text-sm font-medium text-gray-700 mb-1">
                {{ __('messages.confirm_password') }}
            </label>
            <input id="password_confirmation" name="password_confirmation" type="password" autocomplete="new-password" required
                   class="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        </div>

        <button type="submit"
                class="w-full bg-blue-600 text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-700 transition">
            {{ __('messages.register') }}
        </button>
    </form>

    <p class="mt-6 text-center text-sm text-gray-500">
        {{ __('messages.have_account') }}
        <a href="{{ route('login', ['locale' => $locale]) }}" class="text-blue-600 font-medium hover:underline">
            {{ __('messages.login') }}
        </a>
    </p>
</div>
@endsection
