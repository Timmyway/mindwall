<?php

namespace Database\Seeders;

use App\Models\Thematic;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ThematicSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run($userId): void
    {
        // Create 10 thematics assigned to the specific user
        Thematic::factory()->count(2)->create([
            'user_id' => $userId,
        ]);
    }
}
