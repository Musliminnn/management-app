<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RootRedirectController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\InputDPAController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', RootRedirectController::class);
Route::prefix('import')->group(function () {
    Route::get('/file-pages', function () {
        return Inertia::render('ImportFile');
    })->name('import.file.pages');

    Route::post('/file', [ImportController::class, 'import'])->name('import.file');
    Route::get('/status', [ImportController::class, 'getImportStatus'])->name('import.status');
});

Route::get('/input-dpa', [InputDPAController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('inputdpa');
Route::post('/input-dpa/filter', [InputDPAController::class, 'filter'])
    ->middleware(['auth', 'verified'])->name('inputdpa.filter');
Route::post('/input-dpa/reset', [InputDPAController::class, 'reset'])
    ->middleware(['auth', 'verified'])->name('inputdpa.reset');
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
