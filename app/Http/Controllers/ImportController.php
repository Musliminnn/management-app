<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\MasterDataImport;
use App\Imports\TransaksiBelanjaImport;
use Illuminate\Support\Facades\Log;

class ImportController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:20480',
        ]);

        try {
            $file = $request->file('file');

            // Jalankan dua queue sekaligus untuk 1 file yang sama
            Excel::queueImport(new MasterDataImport(), $file);
            Excel::queueImport(new TransaksiBelanjaImport(), $file);

            return back()->with('success', 'File sedang diproses oleh 2 proses import di background.');
        } catch (\Throwable $e) {
            Log::error('Gagal import Excel', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors(['msg' => 'Gagal mengimpor file. Silakan cek log.']);
        }
    }
}
