<?php

use App\Http\Controllers\RootRedirectController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\InputDPAController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', RootRedirectController::class);
Route::prefix('import')->group(function () {
    Route::post('/file', [ImportController::class, 'import'])->name('import.file');
});

Route::get('/input-dpa', [InputDPAController::class, 'index'])
    ->middleware(['auth', 'verified'])->name('inputdpa');
Route::post('/input-dpa/filter', [InputDPAController::class, 'filter'])
    ->middleware(['auth', 'verified'])->name('inputdpa.filter');
Route::post('/input-dpa/cascading-filter', [InputDPAController::class, 'cascadingFilter'])
    ->middleware(['auth', 'verified'])->name('inputdpa.cascading-filter');
Route::post('/input-dpa/change-per-page', [InputDPAController::class, 'changePerPage'])
    ->middleware(['auth', 'verified'])->name('inputdpa.change-per-page');
Route::post('/input-dpa/reset', [InputDPAController::class, 'reset'])
    ->middleware(['auth', 'verified'])->name('inputdpa.reset');
Route::get('/input-dpa/export', [InputDPAController::class, 'export'])
    ->middleware(['auth', 'verified'])->name('inputdpa.export');
Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

require __DIR__ . '/auth.php';
