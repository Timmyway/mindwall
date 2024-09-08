<?php

namespace App\Http\Controllers;

use App\Models\Language;
use App\Models\Prompt;
use App\Models\Thematic;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Str;

class ThematicController extends Controller
{
    public function index(Request $request)
    {
        $itemsPerPage = 10;

        $thematics = $request->user()->thematics()
            ->select(['id', 'name', 'slug'])
            ->orderBy('id', 'desc')
            ->paginate($itemsPerPage);
        // $thematics = Thematic::with(['user'])
        //     ->select(['id', 'name', 'slug'])
        //     ->orderBy('id', 'desc')
        //     ->paginate($itemsPerPage);

        return Inertia::render('Thematics/ThematicList', [
            'thematics' => $thematics
        ]);
    }

    public function store(Request $request)
    {
        $rules = [
            'name' => 'required|string|min:2|max:50|unique:thematics,name',
            'wall' => 'required|array',
            'wall.layers' => 'required|array',
        ];
        $validatedData = $request->validate($rules);
        $newThematic = new Thematic();
        $name = $validatedData['name'];
        $newThematic->name = $name;
        $newThematic->slug = Str::slug($name);
        $newThematic->wall = json_encode($validatedData['wall']) ?? json_encode(['layers' => []]);

        // Associate the thematic with the currently authenticated user
        $newThematic->user()->associate(auth()->user());

        $newThematic->save();

        return redirect()->route('thematic.list');
    }

    public function update(Request $request, Thematic $thematic)
    {
        if ($request->user()->cannot('update', $thematic)) {
            abort(403);
        }
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


    public function detail(Request $request, Thematic $thematic)
    {
        if ($request->user()->cannot('update', $thematic)) {
            abort(403);
        }
        $thematic = Thematic::with(['user'])
            ->findOrFail($thematic->id);
        $engines = Prompt::orderBy('name', 'asc')->get();
        $languages = Language::all();
        return Inertia::render('Thematics/ThematicDetail', [
            'thematic' => $thematic,
            'engines' => $engines,
            'languages' => $languages,
        ]);
    }
}
