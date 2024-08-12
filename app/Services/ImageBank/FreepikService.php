<?php
namespace App\Services\ImageBank;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class FreepikService
{
    protected $client;
    protected $apiKey;

    public function __construct()
    {
        $this->client = new Client();
        $this->apiKey = config('services.freepik.api_key');
    }

    public function searchResources($page = 1, $limit = 10, string $term = '')
    {
        $url = config('services.freepik.api_base_url').'resources';

        try {
            $response = $this->client->get($url, [
                'query' => [
                    'page' => $page,
                    'limit' => $limit,
                    'term' => $term,
                    'filters[license][freemium]' => 1
                ],
                'headers' => [
                    'x-freepik-api-key' => $this->apiKey,
                    'Accept-Language' => 'en',  // You can change this to another language if needed
                    'Content-Type' => 'application/json',
                ],
            ]);

            $data = json_decode($response->getBody(), true);
            $resources = collect($data['data'])->map(function($item) {
                return [
                    'id' => $item['id'],
                    'title' => $item['title'],
                    'url' => $item['url'],
                    'filename' => $item['filename'],
                    'image_source_url' => $item['image']['source']['url'] ?? null,  // Extract the image URL
                    'orientation' => $item['image']['orientation'],
                    'author' => [
                        'name' => $item['author']['name'] ?? 'Unknown',
                        'avatar' => $item['author']['avatar'] ?? null,
                        'profile_url' => $item['author']['slug'] ? "https://www.freepik.com/profile/{$item['author']['slug']}" : null,
                    ],
                ];
            });

            // Optionally, add metadata from the response
            $meta = $data['meta'] ?? [];

            return [
                'resources' => $resources,
                'meta' => $meta,
            ];

        } catch (RequestException $e) {
            // Handle the error
            return [
                'error' => $e->getMessage(),
            ];
        }
    }
}
