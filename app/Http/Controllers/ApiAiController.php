<?php

namespace App\Http\Controllers;

use App\Helpers\General\LogHelper;
use App\Http\Responses\SSEResponse;
use App\Models\Language;
use App\Models\Prompt;
use App\Prompts\PromptStorage;
use App\Services\Google\Gemini;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ApiAiController extends Controller
{
    public function getLanguages()
    {
        $languages = Language::select(['name'])
            ->get();

        return response()->json($languages);
    }

    public function getPrompts()
    {
        $prompts = Prompt::select(['id', 'name', 'slug'])
            ->get();

        return response()->json($prompts);
    }

    public static function toString(array|string $input)
    {
        // Check if input is an array
        if (is_array($input)) {
            // If array, implode and return
            return implode(', ', $input);
        } else {
            // If not an array, return input as is
            return $input;
        }
    }

    public function generateContent(Request $request)
    {
        $rules = [
            'thematic' => 'max:250',
            'count' => 'numeric|between:5,100',
            'tones' => 'nullable|array',
            'segments' => 'nullable|array',
            'language' => 'nullable|string',
            'engine' => 'string',
            'preheader' => 'boolean',
            'temperature' => ['required', 'numeric', 'between:0,2'],
            'topK' => ['required', 'numeric', 'between:1,3'],
            'topP' => ['required', 'numeric', 'between:0,1'],
            'promptOnly' => 'boolean|nullable',
            'examples' => 'string|nullable',
            'restrictionLevel' => 'string',
            'image' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg|max:2048', // Add image validation
        ];

        $postData = $request->validate($rules);

        $promptData = [
            'count' => $postData['count'],
            'thematic' => $postData['thematic'],
            'tones' => !empty($postData['tones']) ? self::toString($postData['tones']) : null,
            'segments' => !empty($postData['segments']) ? self::toString($postData['segments']) : null,
            'language' => $postData['language'] ?? 'français',
            'copyrighting' => true,
            'preheader' => $postData['preheader'] ?? null,
            'examples' => $postData['examples'] ?? null
        ];

        $promptName = $postData['engine'] ?? 'email-subject';
        $prompt = Prompt::where('slug', $promptName)->first();

        if ($prompt) {
            $promptView = $prompt->blade_view;
        } else {
            $promptView = 'email-subject';
        }
        LogHelper::debug('Prompt used: ', $promptView);
            $promptStorage = new PromptStorage();

        $promptStorage->cookPrompt($promptView, $promptData);

        // Save the prompt and other configurations to the session or database
        session(['prompt' => $promptStorage->getPrompt()]);
        session(['temperature' => $postData['temperature']]);
        session(['topP' => $postData['topP']]);
        session(['topK' => $postData['topK']]);
        session(['restrictionLevel' => $postData['restrictionLevel'] ?? 'safe']);
        session(['base64Image' => $postData['base64Image'] ?? $this->handleImageUpload($request)]);

        if ($postData['promptOnly'] ?? false) {
            return response()->json([
                'result' => [],
                'promptUsed' => $promptStorage->getPrompt(),
            ]);
        }

        return response()->json([
            'message' => 'Subject generation started, stream will be available at /api/ai/content-generator/stream',
            'promptUsed' => $promptStorage->getPrompt(),
        ]);
    }

    public function streamResponse()
    {
        $prompt = session('prompt');
        $temperature = session('temperature');
        $topP = session('topP');
        $topK = session('topK');
        $restrictionLevel = session('restrictionLevel');
        $base64Image = session('base64Image');

        $gemini = new Gemini();
        $gemini->setTemperature($temperature)
            ->setTopP($topP)
            ->setTopK($topK);

        $responseBody = $gemini->askStream(
            $prompt,
            restrictionLevel: $restrictionLevel,
            base64Image: $base64Image
        );

        $response = new SSEResponse($responseBody);

        return $response->create();
    }

    // Reusable method to handle image upload and conversion to base64
    private function handleImageUpload(Request $request, $imageName = 'image')
    {
        if ($request->hasFile($imageName)) {
            $file = $request->file($imageName);
            $path = $file->store('images');
            return $this->convertImageToBase64(storage_path('app/' . $path));
        }
        return null; // No image uploaded
    }

    private function convertImageToBase64($imagePath)
    {
        $imageData = file_get_contents($imagePath);
        return base64_encode($imageData);
    }

    public function askToAi(Request $request)
    {
        try {
            // Validate incoming request data
            $rules = [
                'thematic' => 'max:1500',
                'count' => 'nullable|numeric|between:1,100',
                'tones' => 'nullable|array',
                'segments' => 'nullable|array',
                'language' => 'nullable|string',
                'engine' => 'string',
                'preheader' => 'nullable|boolean',
                'temperature' => ['required', 'numeric', 'between:0,2'],
                'topK' => ['required', 'numeric', 'between:1,3'],
                'topP' => ['required', 'numeric', 'between:0,1'],
                'promptOnly' => 'boolean|nullable',
                'examples' => 'string|nullable',
                'restrictionLevel' => 'string',
                'asHtml' => 'boolean|nullable',
                'base64Image' => 'nullable',
                'image' => 'nullable|file|mimes:jpeg,png,jpg,gif,svg|max:2048', // Add image validation
            ];

            $postData = $request->validate($rules);

            // Prepare prompt data
            $promptData = [
                'count' => $postData['count'],
                'thematic' => $postData['thematic'],
                'tones' => !empty($postData['tones']) ? self::toString($postData['tones']) : null,
                'segments' => !empty($postData['segments']) ? self::toString($postData['segments']) : null,
                'language' => $postData['language'] ?? 'français',
                'copyrighting' => true,
                'preheader' => $postData['preheader'] ?? null,
                'examples' => $postData['examples'] ?? null,
            ];

            // Handle image upload or use the provided base64 string
            $base64Image = $postData['base64Image'] ?? $this->handleImageUpload($request);

            // Fetch the prompt
            $promptName = $postData['engine'] ?? 'email-subject';
            $prompt = Prompt::where('slug', $promptName)->first();

            // Determine the view to use for the prompt
            $promptView = $prompt ? $prompt->blade_view : 'email-subject';
            LogHelper::info('Prompt used: ', $promptView);

            // Prepare the prompt storage
            $promptStorage = new PromptStorage();
            $promptStorage->cookPrompt($promptView, $promptData);

            // Initialize the Gemini API
            $gemini = new Gemini();
            $gemini->setTemperature($postData['temperature'] ?? 1);
            $gemini->setTopP($postData['topP'] ?? 1);
            $gemini->setTopK($postData['topK'] ?? 1);

            // Set restriction level
            $restrictionLevel = $postData['restrictionLevel'] ?? 'safe';

            // Call the Gemini API
            $result = $gemini->ask(
                $prompt = $promptStorage->getPrompt(),
                restrictionLevel: $restrictionLevel,
                base64Image: $base64Image
            );

            // Process the result
            $resultText = $result['candidates'][0]['content']['parts'][0]['text'] ?? '';

            // Convert Markdown to HTML if required
            if ($postData['asHtml'] ?? false) {
                $resultText = Str::markdown($resultText);
            }

            // Prepare the API response
            $apiResponse = [
                'generatedText' => $resultText,
            ];

            // Include additional response data if requested
            if ($postData['withConfig'] ?? false) {
                $apiResponse['configUsed'] = $gemini->getConfig();
            }
            if ($postData['withPrompt'] ?? false) {
                $apiResponse['promptUsed'] = $promptStorage->getPrompt();
            }

            return response()->json($apiResponse);

        } catch (\Illuminate\Validation\ValidationException $e) {
            // Handle validation errors
            return response()->json([
                'error' => 'Validation Error',
                'messages' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            // Handle general exceptions
            LogHelper::error('Error in askToAi: ' . $e->getMessage(), [
                'request' => $request->all(),
                'stack' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'An unexpected error occurred: ',
                'details' => $e->getMessage()
            ], 500);
        }
    }
}
