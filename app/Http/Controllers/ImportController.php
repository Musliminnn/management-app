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

            return response()->json([
                'success' => true,
                'message' => 'File sedang diproses. Transaksi akan dijalankan setelah master selesai.',
                'import_id' => $importId,
                'file_info' => [
                    'name' => $fileName,
                    'size' => $this->formatFileSize($fileSize),
                    'chunk_size' => $chunkSize
                ]
            ]);
        } catch (\Throwable $e) {
            Log::error('Gagal import Excel', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Gagal mengimpor file: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get import progress status
     */
    public function getImportStatus(Request $request)
    {
        $importId = $request->input('import_id');

        if (!$importId) {
            return response()->json(['error' => 'Import ID required'], 400);
        }

        $importLog = ImportLog::where('import_id', $importId)->first();
        $queueStatus = ImportOptimizationService::getQueueStatus();

        if (!$importLog) {
            return response()->json(['error' => 'Import session not found'], 404);
        }

        return response()->json([
            'import_session' => [
                'filename' => $importLog->filename,
                'file_size' => $importLog->file_size,
                'status' => $importLog->status,
                'started_at' => $importLog->started_at,
                'progress' => $importLog->progress_percentage,
                'processed_rows' => $importLog->processed_rows,
                'total_rows' => $importLog->total_rows,
                'failed_rows' => $importLog->failed_rows,
                'duration' => $importLog->duration
            ],
            'queue_status' => $queueStatus
        ]);
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
