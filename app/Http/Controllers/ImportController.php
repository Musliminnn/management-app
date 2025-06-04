<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Jobs\ImportTransaksiBelanja;
use App\Imports\MasterDataImport;
use Illuminate\Support\Facades\Log;

class ImportController extends Controller
{
    public function import(Request $request)
{
    $request->validate([
        'file' => 'required|file|mimes:xlsx,xls|max:20480',
    ]);

    try {
        $path = $request->file('file')->store('imports');

        // Chain job: setelah MasterDataImport selesai → jalankan Transaksi
        Excel::queueImport(new MasterDataImport(), $path)
            ->chain([
                new ImportTransaksiBelanja($path),
            ]);

        return back()->with('success', 'File sedang diproses. Transaksi akan dijalankan setelah master selesai.');
    } catch (\Throwable $e) {
        Log::error('Gagal import Excel', [
            'message' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);

        return back()->withErrors(['msg' => 'Gagal mengimpor file. Lihat log.']);
    }
}
}
