<?php
namespace App\Services\Google;

use Exception;
use GuzzleHttp\Client;

class SafetySettings {
    const CATEGORY_HARASSMENT = 'HARM_CATEGORY_HARASSMENT';
    const CATEGORY_HATE_SPEECH = 'HARM_CATEGORY_HATE_SPEECH';
    const CATEGORY_SEXUALLY_EXPLICIT = 'HARM_CATEGORY_SEXUALLY_EXPLICIT';
    const CATEGORY_DANGEROUS_CONTENT = 'HARM_CATEGORY_DANGEROUS_CONTENT';

    private $settings;

    public function __construct() {
        // Default safety settings
        $this->settings = [
            self::CATEGORY_HARASSMENT => 'BLOCK_MEDIUM_AND_ABOVE',
            self::CATEGORY_HATE_SPEECH => 'BLOCK_MEDIUM_AND_ABOVE',
            self::CATEGORY_SEXUALLY_EXPLICIT => 'BLOCK_NONE',
            self::CATEGORY_DANGEROUS_CONTENT => 'BLOCK_MEDIUM_AND_ABOVE',
        ];
    }

    public function getSetting(string $category) {
        return $this->settings[$category] ?? 'BLOCK_NONE';
    }

    public function setMode(string $restrictionLevel) {
        if ($restrictionLevel === 'default') {
            $this->settings = [
                self::CATEGORY_HARASSMENT => 'BLOCK_MEDIUM_AND_ABOVE',
                self::CATEGORY_HATE_SPEECH => 'BLOCK_MEDIUM_AND_ABOVE',
                self::CATEGORY_SEXUALLY_EXPLICIT => 'BLOCK_MEDIUM_AND_ABOVE',
                self::CATEGORY_DANGEROUS_CONTENT => 'BLOCK_MEDIUM_AND_ABOVE',
            ];
        } elseif ($restrictionLevel === 'unrestricted') {
            $this->settings = [
                self::CATEGORY_HARASSMENT => 'BLOCK_NONE',
                self::CATEGORY_HATE_SPEECH => 'BLOCK_NONE',
                self::CATEGORY_SEXUALLY_EXPLICIT => 'BLOCK_NONE',
                self::CATEGORY_DANGEROUS_CONTENT => 'BLOCK_NONE',
            ];
        } elseif ($restrictionLevel === 'secure') {
            $this->settings = [
                self::CATEGORY_HARASSMENT => 'BLOCK_LOW_AND_ABOVE',
                self::CATEGORY_HATE_SPEECH => 'BLOCK_LOW_AND_ABOVE',
                self::CATEGORY_SEXUALLY_EXPLICIT => 'BLOCK_LOW_AND_ABOVE',
                self::CATEGORY_DANGEROUS_CONTENT => 'BLOCK_LOW_AND_ABOVE',
            ];
        }
    }
}
