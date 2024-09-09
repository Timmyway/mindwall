<!DOCTYPE html>
<html>
	<head>
		<!-- Metas -->
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
        <meta property="og:title" content="@yield('title', 'Mindwall - Organize Your Thoughts with AI-Powered Assistance')" />
        <meta name="description" content="@yield('description', 'Mindwall - Mindwall - Organize Your Thoughts with AI-Powered Assistance')">
		<meta property="og:url" content="{{ config('app.app_url') }}" />
		<meta property="og:image" content="{{ asset('images/social-media-image.WebP') }}" />
		<meta property="og:description" content="@yield('description', 'Mindwall is your go-to tool for organizing thoughts in one place. Multiple AI characters guide you to refine and sharpen ideas quickly and efficiently.')" />

		<title>@yield('title', 'Mindwall - Organize Your Thoughts with AI-Powered Assistance')</title>

		<link rel="icon" type="icon" sizes="512x512" href="{{ asset('images/favicon.png') }}">
        <link href="{{ asset('fontawesome/css/all.min.css') }}" rel="stylesheet">
		<!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&family=Paytone+One&display=swap" rel="stylesheet">
		@section('css_page')
		@vite(['resources/sass/app.scss'])
		@show
	</head>

	<body>
        <div class="px-4 py-2">
            <a href="{{ route('home') }}" class="btn bg-yellow-400 w-12 h-12 flex justify-center items-center">
                <i class="fas fa-home fa-2x"></i>
            </a>
        </div>
		@yield('content')

        @section('footer')
        @show

		@section('script')
        @show
	</body>
</html>
