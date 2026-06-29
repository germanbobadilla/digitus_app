<?php

use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\Auth\RegisterController;
use App\Http\Controllers\Api\Auth\UserController;
use App\Http\Controllers\Api\Auth\VerifyEmailController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Digitus API v1
|--------------------------------------------------------------------------
| All routes here mirror the web auth flow.
| Authentication uses Sanctum bearer tokens.
|
| Public:  POST /api/v1/register, POST /api/v1/login
| Token:   POST /api/v1/verify-email, POST /api/v1/verify-email/resend,
|           POST /api/v1/logout, GET  /api/v1/user
*/

Route::prefix('v1')->group(function () {

    // Public auth endpoints
    Route::post('/register', [RegisterController::class, 'register']);
    Route::post('/login', [LoginController::class, 'login']);

    // Endpoints that require a Sanctum token
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/verify-email', [VerifyEmailController::class, 'verify']);
        Route::post('/verify-email/resend', [VerifyEmailController::class, 'resend']);
        Route::post('/logout', [LogoutController::class, 'logout']);
        Route::get('/user', [UserController::class, 'me']);
    });
});
