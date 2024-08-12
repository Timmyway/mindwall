<?php

namespace App\Http\Controllers;

use App\Services\ImageBank\FreepikService;
use Illuminate\Http\Request;

class ImageBankController extends Controller
{
    protected $freepikService;

    public function __construct(FreepikService $freepikService)
    {
        $this->freepikService = $freepikService;
    }

    public function search(Request $request)
    {
        // Validate incoming request data
        $validated = $request->validate([
            'page' => 'integer|min:1',
            'limit' => 'integer|min:1|max:100',
            'term' => 'string|min:2|max:100'
        ]);

        // Set default values for page and limit if not provided
        $page = $validated['page'] ?? 1;
        $limit = $validated['limit'] ?? 10;
        $term = $validated['term'] ?? 'voiture';

        try {
            $results = $this->freepikService->searchResources($page, $limit, $term);

            return response()->json($results);
        } catch (\Exception $e) {
            // Handle errors by returning a JSON response with the error message
            return response()->json([
                'error' => 'An error occurred while fetching resources.',
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}
