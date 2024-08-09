<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PromptsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('prompts')->insert([
            ['name' => "Objet d'email optimisé", 'slug' => 'email-subject', 'blade_view' => 'email-subject', 'icon_class' => 'fa-envelope-open-text'],
            ['name' => "Objet d'email optimisé (Léger)", 'slug' => 'email-subject-light', 'blade_view' => 'email-subject-light', 'icon_class' => 'fa-paper-plane'],
            ['name' => 'Liste des meilleurs', 'slug' => 'top-list', 'blade_view' => 'top-maker', 'icon_class' => 'fa-list-ol'],
            ['name' => "Vieux Sage", 'slug' => 'wisemen', 'blade_view' => 'the-wisemen', 'icon_class' => 'fa-book'],
            ['name' => "Gardien des paroles sacrées", 'slug' => 'guardians-of-sacred-words', 'blade_view' => 'guardians-of-sacred-words', 'icon_class' => 'fa-shield-alt'],
            ['name' => "Motivateur invétéré", 'slug' => 'motivator', 'blade_view' => 'motivator', 'icon_class' => 'fa-bullhorn'],
            ['name' => "Descriptor", 'slug' => 'descriptor', 'blade_view' => 'descriptor', 'icon_class' => 'fa-pen-alt'],
            ['name' => "Freestyle", 'slug' => 'freestyle', 'blade_view' => 'freestyle', 'icon_class' => 'fa-magic'],
            ['name' => "Photo Analyst", 'slug' => 'photo-analyst', 'blade_view' => 'photo-analyst', 'icon_class' => 'fa-camera'],
            ['name' => "Email Analyst", 'slug' => 'email-analyst', 'blade_view' => 'email-analyst', 'icon_class' => 'fa-search'],
        ]);
    }
}
