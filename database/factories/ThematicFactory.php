<?php

namespace Database\Factories;

use App\Models\Thematic;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Thematic>
 */
class ThematicFactory extends Factory
{
    protected $model = Thematic::class;
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->unique()->word;
        return [
            'name' => $name,
            'slug' => Str::slug($name),
            'wall' => json_encode($this->generateWallConfiguration()),
            'user_id' => User::factory(),
        ];
    }

    /**
     * Generate a JSON object for the wall configuration.
     *
     * @return array
     */
    private function generateWallConfiguration(): array
    {
        $groupConfigurations = [];
        $numGroups = 5; // Number of groups you want to create
        $itemsPerGroup = [1, 1, 1, 1, 3]; // Number of items per group for each group

        for ($i = 0; $i < $numGroups; $i++) {
            $groupName = 'group-'.Str::uuid();
            $groupItems = [];

            for ($j = 1; $j <= $itemsPerGroup[$i]; $j++) {
                $groupItems[$groupName.'-text'.$j] = $this->generateTextNodeConfig($groupName, (string)$j);
            }

            $groupConfigurations[$groupName] = [
                'id' => $groupName,
                'name' => $groupName,
                'is' => 'group',
                'scaleX' => 1,
                'scaleY' => 1,
                'visible' => true,
                'draggable' => true,
                'width' => $this->faker->numberBetween(100, 300),
                'height' => $this->faker->numberBetween(100, 200),
                'items' => $groupItems
            ];
        }

        return $groupConfigurations;
    }

    /**
     * Generate a configuration for a text node.
     *
     * @return array
     */
    private function generateTextNodeConfig(string $groupName, string | int $index = ''): array
    {
        return [
            'id' => "{$groupName}-text-{$index}",
            'name' => "{$groupName}-text-{$index}",
            'text' => $this->faker->sentence,
            'fontSize' => $this->faker->numberBetween(12, 27),
            'scaleX' => 1,
            'scaleY' => 1,
            'fontFamily' => 'Verdaba',
            'fill' => $this->faker->hexColor,
            'rotation' => $this->faker->numberBetween(0, 360),
            'x' => $this->faker->numberBetween(0, 1600),
            'y' => $this->faker->numberBetween(0, 900),
            'visible' => true,
            'drawBorder' => true,
            'is' => 'text'
        ];
    }

    /**
     * Generate a configuration for an image node.
     *
     * @return array
     */
    private function generateImageNodeConfig(string $groupName, string | int $index): array
    {
        return [
            'id' => "{$groupName}-image-{$index}",
            'name' => "{$groupName}-image-{$index}",
            'width' => $this->faker->numberBetween(100, 500),
            'height' => $this->faker->numberBetween(100, 500),
            'rotation' => 0,
            'visible' => true,
            'image' => $this->faker->imageUrl(),
            'x' => $this->faker->numberBetween(0, 500),
            'y' => $this->faker->numberBetween(0, 500),
            'draggable' => true,
            'is' => 'image'
        ];
    }
}
