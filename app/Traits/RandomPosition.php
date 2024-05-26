<?php
namespace App\Traits;

trait RandomPosition
{
    /**
     * Get a random position.
     *
     * @return array
     */
    public function getRandomPosition(): array
    {
        return [
            'x' => rand(0, 1920 - 100), // Adjust the range as needed
            'y' => rand(0, 1080 - 100), // Adjust the range as needed
        ];
    }
}
