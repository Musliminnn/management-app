<?php

namespace App\Imports;

use App\Models\TrxBelanja;
use App\Services\ImportOptimizationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Row;
use Illuminate\Contracts\Queue\ShouldQueue;

class TransaksiBelanjaImport implements OnEachRow, WithHeadingRow, WithChunkReading, ShouldQueue
{
    protected array $batch = [];
    protected int $batchSize;
    protected string $importId;

    public function __construct(string $importId = null)
    {
        $this->importId = $importId ?? uniqid('import_');

        // Dynamic batch size based on memory
        $this->batchSize = min(500, max(50, ImportOptimizationService::getDynamicChunkSize() / 2));
    }

    public function onRow(Row $row): void
    {
        $r = array_map('trim', $row->toArray());

        if (
            empty($r['KODE SUB KEGIATAN']) ||
            empty($r['KODE UNIT SKPD']) ||
            empty($r['KODE AKUN'])
        ) {
            Log::info("Row dilewati karena kode penting kosong.", $r);
            return;
        }

        $this->batch[] = [
            'kode_sub_kegiatan'   => $r['KODE SUB KEGIATAN'],
            'kode_unit_skpd'      => $r['KODE UNIT SKPD'],
            'kode_akun'           => $r['KODE AKUN'],
            'kode'                => $r['KODE STANDAR HARGA'] ?? '-',
            'nama'                => $r['NAMA STANDAR HARGA'] ?? '-',
            'paket'               => $r['PAKET/KELOMPOK BELANJA/TAGGING (#)'] ?? '-',
            'keterangan_belanja'  => $r['KETERANGAN BELANJA/AKTIVITAS (-)'] ?? '-',
            'sumber_dana'        => $r['SUMBER DANA'] ?? '-',
            'nama_penerima'      => $r['NAMA PENERIMA BANTUAN'] ?? '-',
            'spesifikasi'         => $r['SPESIFIKASI'] ?? '-',
            'koefisien'           => $r['KOEFISIEN'] ?? '-',
            'harga_satuan'        => floatval($r['HARGA SATUAN'] ?? 0),
            'total_harga'         => floatval($r['TOTAL HARGA'] ?? 0),
            'unit_kerja'          => $r['UNIT KERJA'] ?? '-',
            'created_at'          => now(),
            'updated_at'          => now(),
        ];

        if (count($this->batch) >= $this->batchSize) {
            $this->insertBatch();
        }
    }

    protected function insertBatch(): void
    {
        try {
            // Use transaction for better performance and data integrity
            DB::transaction(function () {
                TrxBelanja::insert($this->batch);
            });

            Log::info('Batch transaksi berhasil diinsert', ['count' => count($this->batch)]);
        } catch (\Throwable $e) {
            Log::error('Gagal insert batch trx_belanja', [
                'error' => $e->getMessage(),
                'count' => count($this->batch),
                'first_row' => $this->batch[0] ?? null,
            ]);
        }

        $this->batch = []; // Reset
    }

    public function chunkSize(): int
    {
        return ImportOptimizationService::getDynamicChunkSize();
    }

    public function __destruct()
    {
        // Pastikan sisa batch juga disimpan
        if (!empty($this->batch)) {
            $this->insertBatch();
        }
    }
}
