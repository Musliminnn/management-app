<?php

use App\Http\Controllers\RootRedirectController;
use App\Http\Controllers\ImportController;
use App\Http\Controllers\InputDPAController;
use App\Http\Controllers\RealisasiBelanjaController;
use App\Http\Controllers\LaporanRealisasiBelanjaController;
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
Route::put('/input-dpa/{id}', [InputDPAController::class, 'update'])
    ->middleware(['auth', 'verified'])->name('inputdpa.update');

// Realisasi Belanja Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::resource('realisasi-belanja', RealisasiBelanjaController::class);
    Route::get('/realisasi-belanja/sub-kegiatan/{kodeKegiatan}', [RealisasiBelanjaController::class, 'getSubKegiatan'])
        ->name('realisasi-belanja.sub-kegiatan');
    Route::get('/realisasi-belanja/trx-belanja/{kodeAkun}', [RealisasiBelanjaController::class, 'getTrxBelanjaData'])
        ->name('realisasi-belanja.trx-belanja');
    Route::post('/realisasi-belanja/total-realisasi', [RealisasiBelanjaController::class, 'getTotalRealisasiBySpesifikasi'])
        ->name('realisasi-belanja.total-realisasi');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

// Laporan Realisasi Belanja Routes
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/laporan-realisasi-belanja', [LaporanRealisasiBelanjaController::class, 'index'])
        ->name('laporan-realisasi-belanja.index');
    Route::post('/laporan-realisasi-belanja/cascading-filter', [LaporanRealisasiBelanjaController::class, 'cascadingFilter'])
        ->name('laporan-realisasi-belanja.cascading-filter');
    Route::post('/laporan-realisasi-belanja/reset', [LaporanRealisasiBelanjaController::class, 'reset'])
        ->name('laporan-realisasi-belanja.reset');
    Route::get('/laporan-realisasi-belanja/export-pdf', [LaporanRealisasiBelanjaController::class, 'exportPdf'])
        ->name('laporan-realisasi-belanja.export-pdf');
});

require __DIR__ . '/auth.php';
