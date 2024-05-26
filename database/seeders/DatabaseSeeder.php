<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Artisan;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $user = User::factory()->create([
            'name' => 'Tim',
            'email' => 'timmyway1990@gmail.com',
        ]);

        // Call other seeders and pass the user ID to them
        $this->callWith(ThematicSeeder::class, ['userId' => $user->id]);
        $this->call([
            QuoteSeeder::class
        ]);
    }
}
