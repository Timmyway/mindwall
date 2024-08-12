<?php

namespace App\Helpers\General;

use Exception;
use Illuminate\Support\Facades\Log;

class LogHelper
{
    public static function debug(string $message, $data = null, $channel = 'kmailing')
    {
        if (is_array($data)) {
            Log::channel($channel)->debug($message, $data);
        } elseif (is_string($data)) {
            Log::channel($channel)->debug($message . ' ' . $data);
        } else {
            Log::channel($channel)->debug($message);
        }
    }

    public static function info(string $message, $data = null, $channel = 'kmailing')
    {
        if (is_array($data)) {
            Log::channel($channel)->info($message, $data);
        } elseif (is_string($data)) {
            Log::channel($channel)->info($message . ' ' . $data);
        } else {
            Log::channel($channel)->info($message);
        }
    }

    public static function error(string $message, $data = null, $channel = 'kmailing')
    {
        if (is_array($data)) {
            Log::channel($channel)->error($message, $data);
        } elseif (is_string($data)) {
            Log::channel($channel)->error($message . ' ' . $data);
        } else {
            Log::channel($channel)->error($message);
        }
    }

    public static function toJson($data) {
        try {
            $json = json_encode($data);
            if ($json === false) {
                return 'Not a valid json';
            }
            return $json;
        } catch (Exception $e) {
            // Log the error or handle it gracefully
            return $e->getMessage();
        }
    }
}
