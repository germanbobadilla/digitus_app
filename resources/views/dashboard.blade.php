@extends('layouts.app')

@section('title', __('messages.dashboard'))

@section('content')
<div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">
        {{ __('messages.welcome_back', ['name' => Auth::user()->name]) }}
    </h1>
    <p class="text-gray-500">{{ __('messages.dashboard_intro') }}</p>

    <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p class="text-sm text-gray-500">{{ __('messages.username') }}</p>
            <p class="text-lg font-semibold text-gray-900 mt-1">{{ Auth::user()->username }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p class="text-sm text-gray-500">{{ __('messages.email') }}</p>
            <p class="text-lg font-semibold text-gray-900 mt-1">{{ Auth::user()->email }}</p>
        </div>
        <div class="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <p class="text-sm text-gray-500">Status</p>
            <p class="text-lg font-semibold text-green-600 mt-1">✓ Verified</p>
        </div>
    </div>
</div>
@endsection
