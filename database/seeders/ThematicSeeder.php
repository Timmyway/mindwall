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
    public function run(): void
    {
        Thematic::factory()->count(5)->create();
    }
}
