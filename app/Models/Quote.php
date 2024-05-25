<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quote extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'slug', 'thematic_id'];

    public function thematic()
    {
        return $this->belongsTo(Thematic::class);
    }
}
