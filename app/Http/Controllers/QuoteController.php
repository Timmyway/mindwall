<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\Thematic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class QuoteController extends Controller
{
    public function list()
    {
        $quotes = Quote::with(['thematic'])
            ->orderBy('id', 'desc')
            ->get();
        return Inertia::render('Quotes/QuoteView', [
            'quotes' => $quotes
        ]);
    }

    public function updateWall(Request $request)
    {
        $thematicId = $request->input('thematicId');

        // Validate positions data
        $validated = $request->validate([
            'thematicId' => 'required|integer|exists:thematics,id',
            'wall' => 'required|json',
        ]);

        // Fetch the thematic by ID
        $thematicId = $validated['thematicId'];
        $thematic = Thematic::findOrFail($thematicId);

        // Decode the JSON wall data
        $wallData = json_decode($validated['wall'], true);

        // Process the wall data to ensure only serializable properties are included
        foreach ($wallData as &$group) {
            if (isset($group['items'])) {
                foreach ($group['items'] as &$item) {
                    if (isset($item['is']) && $item['is'] === 'image') {
                        // Ensure only serializable properties are included
                        if (isset($item['image']) && is_object($item['image'])) {
                            $item['image'] = $item['image']->src ?? null;
                        }
                    }
                }
            }
        }

        // Update the wall field of the thematic
        $thematic->wall = $wallData;

        // Save the changes to the database
        $thematic->save();

        return response()->json(['message' => "Thematic's wall updated successfully"]);
    }
}
