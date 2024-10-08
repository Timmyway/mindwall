<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta property="og:title" content="@yield('title', 'Mindwall - Organize Your Thoughts with AI-Powered Assistance')" />
        <meta name="description" content="@yield('description', 'Mindwall - Mindwall - Organize Your Thoughts with AI-Powered Assistance')">
		<meta property="og:url" content="{{ config('app.app_url') }}" />
		<meta property="og:image" content="{{ asset('images/social-media-image.WebP') }}" />
		<meta property="og:description" content="@yield('description', 'Mindwall is your go-to tool for organizing thoughts in one place. Multiple AI characters guide you to refine and sharpen ideas quickly and efficiently.')" />
        <link rel="icon" type="icon" sizes="512x512" href="{{ asset('images/favicon.png') }}">

        <title inertia>{{ config('app.name', 'Mindwall') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Paytone+One&display=swap" rel="stylesheet">

        <link href="{{ asset('fontawesome/css/all.min.css') }}" rel="stylesheet">

        <!-- Scripts -->
        @routes
        @vite(['resources/js/app.ts', "resources/js/Pages/{$page['component']}.vue"])
        @inertiaHead
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>

    <script>
        var baseApiUrl = '{{ $base_api_url }}';
    </script>
</html>
