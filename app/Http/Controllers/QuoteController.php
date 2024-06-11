<?php

namespace App\Http\Controllers;

use App\Models\Quote;
use App\Models\Thematic;
use Exception;
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

        // Update the wall field of the thematic
        $thematic->wall = $validated['wall'];

        // Save the changes to the database
        try {
            $thematic->save();
        } catch(Exception $e) {
            throw($e);
        }

        return response()->json(['message' => "Thematic's wall updated successfully"]);
    }
}
