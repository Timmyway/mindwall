<?php

namespace Database\Seeders;

use App\Models\Language;
use App\Traits\ProgressDisplayTrait;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class LanguageSeeder extends Seeder
{
    use ProgressDisplayTrait;
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Load data from themes.php
        $languageDatas = include(database_path('seeders/datas/languages.php'));

        // 1. Initialize progression
        $total = count($languageDatas);
        $progress = 0;

        foreach ($languageDatas as $language) {
            Language::create($language);

            // 2. Display new progression
            $progress++;
            $this->displayProgress($total, $progress, $language['name']);
        }
    }
}
