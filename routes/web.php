<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\RootRedirectController;
use App\Http\Controllers\ImportController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Support\Facades\Artisan;

Route::get('/', RootRedirectController::class);
Route::get('/import-file-pages', function () {
    return Inertia::render('ImportFile');
})->middleware(['auth']);
Route::post('/import-file', [ImportController::class, 'import'])->name('import.subkegiatan');

Route::get('/run-queue-multiple-times', function () {
    $times = request('times', 5);

    for ($i = 0; $i < $times; $i++) {
        Artisan::call('queue:work --once');
    }

    return response()->json(['message' => "Import Success"]);
})->middleware(['auth']);

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
