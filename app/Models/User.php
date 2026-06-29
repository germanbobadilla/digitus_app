<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

#[Fillable(['name', 'username', 'email', 'password'])]
#[Hidden(['password', 'remember_token', 'email_verification_code'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected function casts(): array
    {
        return [
            'email_verified_at'              => 'datetime',
            'email_verification_expires_at'  => 'datetime',
            'password'                       => 'hashed',
        ];
    }

    public function generateEmailVerificationCode(): string
    {
        $code = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        $this->update([
            'email_verification_code'        => $code,
            'email_verification_expires_at'  => now()->addMinutes(15),
        ]);

        return $code;
    }

    public function hasValidVerificationCode(string $code): bool
    {
        return $this->email_verification_code === $code
            && $this->email_verification_expires_at?->isFuture();
    }

    public function markEmailAsVerified(): bool
    {
        return $this->forceFill([
            'email_verified_at'             => now(),
            'email_verification_code'       => null,
            'email_verification_expires_at' => null,
        ])->save();
    }
}
