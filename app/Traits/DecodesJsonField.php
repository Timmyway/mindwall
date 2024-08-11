<?php
namespace App\Traits;

trait DecodesJsonField
{
    protected function decodeJsonField($field)
    {
        $decodedField = json_decode($field);

        // Check if JSON decoding was successful
        if (json_last_error() !== JSON_ERROR_NONE) {
            // Log an error or handle the invalid JSON data as needed
            // For now, just return null
            return null;
        }

        return $decodedField;
    }
}
