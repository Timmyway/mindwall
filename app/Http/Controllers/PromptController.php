<?php

namespace App\Http\Controllers;

use App\Models\Prompt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PromptController extends Controller
{
    protected $validations;

    public function __construct() {
        $this->validations = [
            'name' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:prompts,slug',
            'blade_view' => 'required|string|max:255',
            'icon_class' => 'nullable|string|max:255',
            'thumbnail_url' => 'nullable|string|max:255',
        ];
    }

    public function list()
    {
        $prompts = Prompt::orderBy('id', 'desc')
            ->get();

        return Inertia::render('Prompts/PromptList', [
            'prompts' => $prompts
        ]);
    }

    public function addPage(Prompt $prompt)
    {
        return Inertia::render('Prompts/PromptForm', [
            'mode' => 'add'
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate($this->validations);

        // Create a new prompt
        $newPrompt = new Prompt();
        $newPrompt->name = $validatedData['name'];
        $newPrompt->slug = $validatedData['slug'];
        $newPrompt->blade_view = $validatedData['blade_view'];
        $newPrompt->icon_class = $validatedData['icon_class'] ?? '';
        $newPrompt->thumbnail_url = $validatedData['thumbnail_url'] ?? '';

        $newPrompt->save();

        // Redirect back with success message
        return redirect()->route('prompt.list')
            ->with('success', 'Prompt created successfully.');
    }

    public function update(Request $request, Prompt $prompt)
    {
        // Validate the request
        $updateRules = array_merge([], $this->validations);
        $updateRules['slug'] = 'required|string|max:255';

        $validatedData = $request->validate($updateRules);

        // Update the prompt
        $prompt->update($validatedData);

        // Redirect with success message
        return redirect()->route('prompt.list')->with('success', 'Prompt updated successfully.');
    }

    public function formPage(Prompt $prompt = null, string $mode = null)
    {
        return Inertia::render('Prompts/PromptForm', [
            'prompt' => $prompt,
            'mode' => $mode
        ]);
    }
}
