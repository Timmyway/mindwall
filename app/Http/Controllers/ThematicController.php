<?php

namespace App\Http\Controllers;

use App\Models\Thematic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ThematicController extends Controller
{
    public function index()
    {
        $thematics = Thematic::all();

        return Inertia::render('Thematics/ThematicList', [
            'thematics' => $thematics
        ]);
    }
}
