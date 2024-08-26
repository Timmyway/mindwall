<?php

use App\Http\Controllers\GalleryController;
use App\Http\Controllers\MindwallController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\PromptController;
use App\Http\Controllers\ThematicController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('home');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('storage/private/images/uploads/{filename}', [GalleryController::class, 'uploadedImage'])->name('private.image');
    Route::get('storage/private/images/uploads/thumbnails/{filename}', [GalleryController::class, 'thumbnailImage'])->name('private.thumbnail');

    Route::prefix('thematics')->name('thematic.')->group(function () {
        Route::get('/', [ThematicController::class, 'index'])->name('list');
        Route::get('/detail/{thematic}', [ThematicController::class, 'detail'])->name('detail');
        Route::put('/{thematic}', [ThematicController::class, 'update'])->name('update');
    });
    Route::prefix('prompts')->name('prompt.')->group(function () {
        Route::get('', [PromptController::class, 'list'])->name('list');
        Route::get('/add', [PromptController::class, 'addPage'])->name('add');
        Route::get('/{prompt?}/{mode?}', [PromptController::class, 'formPage'])->name('detail');
        Route::post('', [PromptController::class, 'store'])->name('store');
        Route::put('/{prompt}', [PromptController::class, 'update'])->name('update');
    });
});

require __DIR__.'/auth.php';
