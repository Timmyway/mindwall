<?php

namespace App\Http\Controllers;

use App\Models\Thematic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ThematicController extends Controller
{
    public function index()
    {
        $thematics = Thematic::with(['user'])
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Thematics/ThematicList', [
            'thematics' => $thematics
        ]);
    }

        public function detail(Thematic $thematic)
        {
            $thematic = Thematic::with(['user', 'quotes'])
                ->findOrFail($thematic->id);
            return Inertia::render('Thematics/ThematicDetail', [
                'thematic' => $thematic,
            ]);
        }
}
