<?php

namespace Database\Factories;

use App\Models\Quote;
use App\Models\Thematic;
use App\Traits\RandomPosition;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Quote>
 */
class QuoteFactory extends Factory
{
    use RandomPosition;

    protected $model = Quote::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->sentence,
            'position' => json_encode($this->getRandomPosition()),
            'thematic_id' => rand(1, 2),
        ];
    }

    /**
     * Get a random position.
     *
     * @return array
     */
    private function getRandomPosition(): array
    {
        return [
            'x' => rand(0, 1920 - 100), // Adjust the range as needed
            'y' => rand(0, 1080 - 100), // Adjust the range as needed
        ];
    }
}
