<!DOCTYPE html>
<html lang="{{ app()->getLocale() }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name') }} — @yield('title')</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
</head>
<body class="min-h-screen bg-gray-50 text-gray-900 antialiased">

    <nav class="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <a href="{{ url('/') }}" class="flex items-center gap-3">
            <span class="text-xl font-bold text-blue-700 tracking-tight">Digitus</span>
            <span class="hidden sm:inline text-sm text-gray-500">Business &amp; Software Solutions</span>
        </a>

        <div class="flex items-center gap-4 text-sm">
            @auth
                <span class="text-gray-600">{{ Auth::user()->name }}</span>
                <form method="POST" action="{{ route('logout', ['locale' => app()->getLocale()]) }}">
                    @csrf
                    <button type="submit" class="text-red-600 hover:underline">
                        {{ __('messages.logout') }}
                    </button>
                </form>
            @else
                <a href="{{ route('login', ['locale' => app()->getLocale()]) }}" class="text-blue-600 hover:underline">
                    {{ __('messages.login') }}
                </a>
                <a href="{{ route('register', ['locale' => app()->getLocale()]) }}" class="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition">
                    {{ __('messages.register') }}
                </a>
            @endauth

            {{-- Language switcher --}}
            <div class="flex gap-1 border border-gray-200 rounded-lg overflow-hidden text-xs">
                <a href="{{ url('/en') }}" class="px-2 py-1 {{ app()->getLocale() === 'en' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100' }}">EN</a>
                <a href="{{ url('/es') }}" class="px-2 py-1 {{ app()->getLocale() === 'es' ? 'bg-blue-600 text-white' : 'hover:bg-gray-100' }}">ES</a>
            </div>
        </div>
    </nav>

    <main class="@yield('main-class', 'max-w-7xl mx-auto px-6 py-10')">
        @if (session('status'))
            <div class="mb-4 p-4 bg-green-100 text-green-700 rounded-lg text-sm">
                {{ session('status') }}
            </div>
        @endif

        @yield('content')
    </main>

    <footer class="border-t border-gray-200 mt-16 py-6 text-center text-xs text-gray-400">
        &copy; {{ date('Y') }} Digitus Business &amp; Software Solutions. All rights reserved.
    </footer>

</body>
</html>
