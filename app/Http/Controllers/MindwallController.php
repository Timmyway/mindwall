<?php

namespace App\Http\Controllers;

use App\Models\Prompt;
use Illuminate\Http\Request;
use Inertia\Inertia;

class MindwallController extends Controller
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

    public function promptList()
    {
        $prompts = Prompt::orderBy('id', 'desc')
            ->get();

        return Inertia::render('Prompts/PromptList', [
            'prompts' => $prompts
        ]);
    }

    public function promptAdd(Prompt $prompt)
    {
        return Inertia::render('Prompts/PromptDetail', [
            'mode' => 'add'
        ]);
    }

    public function PromptStore(Request $request)
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

    public function PromptUpdate(Request $request, Prompt $prompt)
    {
        // Validate the request
        $validatedData = $request->validate($this->validations);

        // Update the prompt
        $prompt->update($validatedData);

        // Redirect with success message
        return redirect()->route('prompts.index')->with('success', 'Prompt updated successfully.');
    }

    public function promptDetail(Prompt $prompt = null, string $mode = null)
    {
        return Inertia::render('Prompts/PromptDetail', [
            'prompt' => $prompt,
            'mode' => $mode
        ]);
    }
}
