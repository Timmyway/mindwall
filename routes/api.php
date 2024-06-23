<?php

use App\Http\Controllers\GalleryController;
use App\Http\Controllers\QuoteController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/wall/update', [QuoteController::class, 'updateWall']);

Route::middleware('auth:sanctum')->group(function() {
    Route::get('images', [GalleryController::class, 'index']);
    Route::post('images', [GalleryController::class, 'store']);
    Route::post('images/delete/{id}', [GalleryController::class, 'delete']);
});
