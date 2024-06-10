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
        $groupName1 = 'group-'.Str::uuid();
        $groupName2 = 'group-'.Str::uuid();
        $groupName3 = 'group-'.Str::uuid();
        return [
            $groupName1 => [
                'id' => $groupName1,
                'name' => $groupName1,
                'is' => 'group',
                'scaleX' => 1,
                'scaleY' => 1,
                'visible' => true,
                'draggable' => true,
                'items' => [
                    $groupName1.'-text1' => $this->generateTextNodeConfig($groupName1, '1'),
                    $groupName1.'-text2' => $this->generateTextNodeConfig($groupName1, '2'),
                    $groupName1.'-text3' => $this->generateTextNodeConfig($groupName1, '3'),
                ]
            ],
            $groupName2 => [
                'id' => $groupName2,
                'name' => $groupName2,
                'is' => 'group',
                'scaleX' => 1,
                'scaleY' => 1,
                'visible' => true,
                'draggable' => true,
                'items' => [
                    $groupName2.'-text1' => $this->generateTextNodeConfig($groupName2, '1'),
                ]
            ],
            $groupName3 => [
                'id' => $groupName3,
                'name' => $groupName3,
                'is' => 'group',
                'scaleX' => 1,
                'scaleY' => 1,
                'visible' => true,
                'draggable' => true,
                'items' => [
                    $groupName3.'-text1' => $this->generateTextNodeConfig($groupName3, '1'),
                    $groupName3.'-text2' => $this->generateTextNodeConfig($groupName3, '2'),
                ]
            ],
            // Add more groups as needed
        ];
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
