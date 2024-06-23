<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('illustrations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->mediumText('location'); // Assuming this is a path to the image file
            $table->mediumText('url')->nullable();
            $table->mediumText('thumbnail')->nullable();
            $table->mediumText('url_thumbnail')->nullable();
            $table->json('config')->nullable(); // JSON column for storing the image configuration
            $table->timestamps();

            $table->foreignId('user_id')->constrained('users');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('illustrations');
    }
};
