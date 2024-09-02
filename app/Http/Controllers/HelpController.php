<?php

namespace App\Http\Controllers;

use App\Models\Prompt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class HelpController extends Controller
{
    public function index()
    {
        $prompts = Prompt::select(['id', 'name', 'slug'])
            ->get();
        return Inertia::render('Helps/HelpPrompts', ['engines' => $prompts]);
    }

    public function detail(string $doc)
    {        
        return Inertia::render('Helps/HelpPromptDetails', ['doc' => $doc]);
    }
}
