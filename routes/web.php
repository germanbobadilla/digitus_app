<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Middleware\DetectLocale;
use App\Http\Middleware\SetLocale;
use Illuminate\Support\Facades\Route;

// Root: detect locale and redirect
Route::get('/', DetectLocale::class . '@handle')->name('home');

// Locale-prefixed web routes
Route::prefix('{locale}')
    ->where(['locale' => 'en|es'])
    ->middleware(SetLocale::class)
    ->group(function () {

        Route::get('/', fn () => view('welcome'))->name('welcome');

        // Guest-only routes
        Route::middleware('guest')->group(function () {
            Route::get('/login', [LoginController::class, 'showForm'])->name('login');
            Route::post('/login', [LoginController::class, 'login']);

            Route::get('/register', [RegisterController::class, 'showForm'])->name('register');
            Route::post('/register', [RegisterController::class, 'register']);
        });

        // Authenticated routes
        Route::middleware('auth')->group(function () {
            // Email verification (accessible before verified)
            Route::get('/verify-email', [VerifyEmailController::class, 'showForm'])->name('verification.notice');
            Route::post('/verify-email', [VerifyEmailController::class, 'verify'])->name('verification.verify');
            Route::post('/verify-email/resend', [VerifyEmailController::class, 'resend'])->name('verification.resend');

            Route::post('/logout', [LogoutController::class, 'logout'])->name('logout');

            // Verified routes
            Route::middleware('verified')->group(function () {
                Route::get('/dashboard', fn () => view('dashboard'))->name('dashboard');
            });
        });
    });
