<?php

namespace App\Services\Google;

use App\Helpers\General\LogHelper;
use Exception;
use GuzzleHttp\Client;

class Gemini
{
    private $apiKey;
    private $apiUrl;
    protected $config;
    private $defaultSafetySettings;
    private $client;

    private const DEFAULT_TEMPERATURE = 0.9;
    private const DEFAULT_TOP_K = 1;
    private const DEFAULT_TOP_P = 1;
    private const DEFAULT_MAX_OUTPUT_TOKENS = 2048;

    public function __construct() {
        $this->apiKey = config('services.google.gemini_api_key'); // Assuming you have your API key stored in config
        $this->apiUrl = config('services.google.gemini_api_url');
        $this->config = [
            'temperature' => self::DEFAULT_TEMPERATURE,
            'topK' => self::DEFAULT_TOP_K,
            'topP' => self::DEFAULT_TOP_P,
            'maxOutputTokens' => self::DEFAULT_MAX_OUTPUT_TOKENS,
        ];
        $this->defaultSafetySettings = new SafetySettings();
        $this->client = new Client();
    }

    public function setTemperature(float|int $temperature = self::DEFAULT_TEMPERATURE): self
    {
        $this->config['temperature'] = $temperature;
        return $this;
    }

    public function setTopK(float|int $topK = self::DEFAULT_TOP_K): self
    {
        $this->config['topK'] = $topK;
        return $this;
    }

    public function setTopP(float|int $topP = self::DEFAULT_TOP_P): self
    {
        $this->config['topP'] = $topP;
        return $this;
    }

    public function maxOutputTokens(int $tokenCount = self::DEFAULT_MAX_OUTPUT_TOKENS): self
    {
        $this->config['maxOutputTokens'] = $tokenCount;
        return $this;
    }

    public function getConfig(): array {
        return $this->config;
    }

    private function prepareSafetySettings(string $restrictionLevel): array
    {
        $this->defaultSafetySettings->setMode($restrictionLevel);
        $safetyCategories = [
            SafetySettings::CATEGORY_HARASSMENT,
            SafetySettings::CATEGORY_HATE_SPEECH,
            SafetySettings::CATEGORY_SEXUALLY_EXPLICIT,
            SafetySettings::CATEGORY_DANGEROUS_CONTENT,
        ];
        return array_map(function ($category) {
            return [
                'category' => $category,
                'threshold' => $this->defaultSafetySettings->getSetting($category),
            ];
        }, $safetyCategories);
    }

    private function prepareRequestData(string $prompt, array $safetySettings, string $base64Image = null): array
    {
        $contents = [
            [
                'role' => 'user',
                'parts' => [
                    [
                        'text' => $prompt,
                    ],
                ],
            ],
        ];

        if ($base64Image) {
            $imageData = $this->getBase64Data($base64Image);
            $contents[0]['parts'][] = [
                'inline_data' => [
                    'mime_type' => 'image/png',
                    'data' => $imageData,
                ],
            ];
        }

        return [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'contents' => $contents,
                'generationConfig' => [
                    'temperature' => $this->config['temperature'],
                    'topK' => $this->config['topK'],
                    'topP' => $this->config['topP'],
                    'maxOutputTokens' => $this->config['maxOutputTokens'],
                    'stopSequences' => [],
                ],
                'safetySettings' => $safetySettings,
            ],
            'query' => [
                'key' => $this->apiKey,
            ],
        ];
    }

    private function getBase64Data($base64Image) {
        // Define the prefix for base64 image data
        $prefix = 'data:image/';

        // Check if the base64 data includes the prefix
        if (strpos($base64Image, $prefix) !== false) {
            // Split the string by the comma, the base64 data is after the comma
            $parts = explode(',', $base64Image);
            // Check if the split was successful
            if (isset($parts[1])) {
                return $parts[1];
            } else {
                throw new Exception('Base64 data not found.');
            }
        } else {
            // If there's no prefix, the base64 data is the entire input string
            return $base64Image;
        }
    }

    private function handleRequest(string $url, array $data, bool $stream = false)
    {
        LogHelper::debug('data: ', $data);
        try {
            if ($stream) {
                $data[\GuzzleHttp\RequestOptions::STREAM] = true;
            }
            $response = $this->client->post($url, $data);
            return $stream ? $response->getBody() : json_decode($response->getBody(), true);
        } catch (Exception $e) {
            throw new Exception($e->getMessage());
        }
    }

    public function ask(string $prompt, string $restrictionLevel = 'default', $base64Image = null)
    {
        $safetySettings = $this->prepareSafetySettings($restrictionLevel);
        $data = $this->prepareRequestData($prompt, $safetySettings, $base64Image);
        LogHelper::debug('==> Data: ', $data);

        return $this->handleRequest($this->apiUrl . 'generateContent', $data);
    }

    public function askStream(string $prompt, string $restrictionLevel = 'default', $base64Image = null)
    {
        $safetySettings = $this->prepareSafetySettings($restrictionLevel);
        $data = $this->prepareRequestData($prompt, $safetySettings, $base64Image);
        $data['query']['alt'] = 'sse';

        return $this->handleRequest($this->apiUrl . 'streamGenerateContent', $data, true);
    }

    public function countTokens(string $prompt)
    {
        $data = [
            'headers' => [
                'Content-Type' => 'application/json',
            ],
            'json' => [
                'contents' => [
                    [
                        'parts' => [
                            [
                                'text' => $prompt,
                            ],
                        ],
                    ]
                ],
            ],
            'query' => [
                'key' => $this->apiKey,
            ],
        ];
        return $this->handleRequest($this->apiUrl . 'countTokens', $data);
    }
}
