<?php

namespace App\Http\Controllers;

use App\Models\Quote;
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

    public function updatePositions(Request $request)
    {
        $thematicId = $request->input('thematicId');
        $positions = $request->input('positions');

        // Validate positions data
        $validated = $request->validate([
            'thematicId' => 'required|integer|exists:thematics,id',
            'positions' => 'required|array',
            'positions.*.x' => 'required|integer',
            'positions.*.y' => 'required|integer',
        ]);

        // Fetch the quotes for the given thematic ID
        $quotes = Quote::where('thematic_id', $thematicId)->get();

        // Update each quote's position
        foreach ($quotes as $index => $quote) {
            if (isset($positions[$index])) {
                $quote->position = json_encode($positions[$index]);
                $quote->save();
            }
        }

        return response()->json(['message' => 'Positions updated successfully']);
    }
}
