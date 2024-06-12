<?php

namespace App\Http\Controllers;

use App\Models\Thematic;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

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

    public function update(Request $request, Thematic $thematic)
    {
        // Validate the request data
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            // Add other fields as necessary
        ]);

        // Generate the slug from the name
        $validatedData['slug'] = Str::slug($validatedData['name']);

        // While this may be unnecessary, it adds an extra layer of security
        // by ensuring 'wall' cannot be updated even if included in the request
        unset($validatedData['wall']);

        // Update the thematic model with the validated data
        $thematic->update($validatedData);

        // Return the updated list to the Inertia component
        return redirect()->route('thematic.list');
    }


    public function detail(Thematic $thematic)
    {
        $thematic = Thematic::with(['user'])
            ->findOrFail($thematic->id);
        return Inertia::render('Thematics/ThematicDetail', [
            'thematic' => $thematic,
        ]);
    }
}
