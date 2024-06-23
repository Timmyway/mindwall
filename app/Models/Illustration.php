<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Illustration extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'location',
        'url',
        'thumbnail',
        'url_thumbnail',
        'config',
        'user_id',
    ];

    protected $casts = [
        'config' => 'array', // Automatically cast the config attribute to an array
    ];

    /**
     * Get the user that owns the image.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
