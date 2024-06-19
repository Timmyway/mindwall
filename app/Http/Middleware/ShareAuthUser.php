<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class ShareAuthUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        Inertia::share([
            'auth.user' => function () use ($request) {
                return $request->user()
                    ? $request->user()->only('id', 'name', 'email') // Adjust fields as needed
                    : null;
            },
        ]);

        return $next($request);
    }
}
