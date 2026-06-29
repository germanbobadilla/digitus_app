@extends('layouts.app')

@section('title', __('messages.tagline'))

@section('main-class', 'flex flex-col items-center justify-center min-h-[75vh] text-center px-6')

@section('content')
<div class="max-w-2xl mx-auto">
    <h1 class="text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
        {{ __('messages.welcome') }}
    </h1>
    <p class="text-xl text-gray-500 mb-10">{{ __('messages.tagline') }}</p>

    <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="{{ route('login', ['locale' => app()->getLocale()]) }}"
           class="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 transition">
            {{ __('messages.login') }}
        </a>
        <a href="{{ route('register', ['locale' => app()->getLocale()]) }}"
           class="px-8 py-3 border border-blue-600 text-blue-600 rounded-xl font-semibold text-base hover:bg-blue-50 transition">
            {{ __('messages.register') }}
        </a>
    </div>
</div>
@endsection
