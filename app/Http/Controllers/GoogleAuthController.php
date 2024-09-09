<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Str;

class GoogleAuthController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->redirect();
    }

    public function callbackGoogle()
    {
        try {
            // Get Google user info
            $googleUser = Socialite::driver('google')->user();

            // Check if the user already exists by email
            $user = User::where('email', $googleUser->email)->first();

            // If the user exists but doesn't have google_id, update it
            if ($user) {
                if (is_null($user->google_id)) {
                    $user->google_id = $googleUser->id;
                    $user->save();
                }
            } else {
                // If the user does not exist, create a new user
                $user = User::create([
                    'name' => $googleUser->name,
                    'email' => $googleUser->email,
                    'google_id' => $googleUser->id,
                    // You can generate a random password since they won't use it
                    'password' => bcrypt(Str::random(24))
                ]);
            }

            // Log the user in
            Auth::login($user);

            // Redirect to the intended page after login
            return redirect()->route('home');
        } catch (\Throwable $th) {
            // Handle any errors
            dd('Something went wrong! ' . $th->getMessage());
        }
    }

}
