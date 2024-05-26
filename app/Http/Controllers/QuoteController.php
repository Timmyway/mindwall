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
}
