<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class DetectLocale
{
    // Countries whose primary language is Spanish and should default to /es
    private const SPANISH_COUNTRIES = ['DO', 'ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL', 'EC', 'GT', 'CU', 'BO', 'HN', 'PY', 'SV', 'NI', 'CR', 'PA', 'UY', 'PR', 'GQ'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $this->resolveLocale($request);

        return redirect("/{$locale}");
    }

    private function resolveLocale(Request $request): string
    {
        // 1. Respect an explicit session preference
        if ($sessionLocale = session('locale')) {
            return in_array($sessionLocale, SetLocale::SUPPORTED) ? $sessionLocale : 'en';
        }

        // 2. Geo-IP via CF-IPCountry header (set by Cloudflare) or X-Country-Code (custom proxy header)
        $country = $request->header('CF-IPCountry') ?? $request->header('X-Country-Code');
        if ($country && in_array(strtoupper($country), self::SPANISH_COUNTRIES)) {
            return 'es';
        }

        // 3. Accept-Language header fallback
        $acceptLanguage = $request->header('Accept-Language', '');
        if (str_starts_with(strtolower($acceptLanguage), 'es')) {
            return 'es';
        }

        return 'en';
    }
}
