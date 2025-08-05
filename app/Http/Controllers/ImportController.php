<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Jobs\ImportTransaksiBelanja;
use App\Imports\MasterDataImport;
use App\Models\ImportLog;
use App\Services\ImportOptimizationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class ImportController extends Controller
{
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls|max:51200', // Increased to 50MB
        ]);

        try {
            $file = $request->file('file');
            $fileSize = $file->getSize();
            $fileName = $file->getClientOriginalName();

            // Store file and get path
            $path = $file->store('imports');

            // Create import log entry
            $importId = uniqid('import_');
            $chunkSize = ImportOptimizationService::getDynamicChunkSize($fileSize);

            $importLog = ImportLog::create([
                'import_id' => $importId,
                'filename' => $fileName,
                'file_size' => $fileSize,
                'status' => 'queued',
                'chunk_size' => $chunkSize,
                'started_at' => now(),
                'metadata' => [
                    'file_path' => $path,
                    'original_name' => $fileName,
                    'mime_type' => $file->getMimeType()
                ]
            ]);

            Log::info('Starting import process', [
                'import_id' => $importId,
                'filename' => $fileName,
                'file_size' => $fileSize,
                'chunk_size' => $chunkSize
            ]);

            // Chain job: setelah MasterDataImport selesai → jalankan Transaksi
            Excel::queueImport(new MasterDataImport($importId), $path)
                ->chain([
                    new ImportTransaksiBelanja($path, $importId),
                ]);

            // Return to the same page with simple success message
            return redirect()->back()->with('success', 'File berhasil diunggah dan sedang diproses.');
        } catch (\Throwable $e) {
            Log::error('Gagal import Excel', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()->with('error', 'Gagal mengunggah file: ' . $e->getMessage());
        }
    }

    /**
     * Format file size for display
     */
    private function formatFileSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $factor = floor((strlen($bytes) - 1) / 3);

        return sprintf("%.2f %s", $bytes / pow(1024, $factor), $units[$factor]);
    }
}
