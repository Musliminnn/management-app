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

        // Validasi wajib minimal
        if (
            empty($r['kode_sub_kegiatan']) ||
            empty($r['kode_unit_skpd']) ||
            empty($r['kode_akun'])
        ) {
            Log::info("Row dilewati karena kode penting kosong.", $r);
            return;
        }

        $this->batch[] = [
            'kode_sub_kegiatan'   => $r['kode_sub_kegiatan'],
            'kode_unit_skpd'      => $r['kode_unit_skpd'],
            'kode_akun'           => $r['kode_akun'],
            'kode_standar_harga'  => $r['kode_standar_harga'] ?? null,
            'paket'               => $r['paket'] ?? '',
            'keterangan_belanja'  => $r['keterangan_belanja'] ?? '',
            'sumber_dana'         => $r['sumber_dana'] ?? '',
            'nama_penerima'       => $r['nama_penerima'] ?? '',
            'spesifikasi'         => $r['spesifikasi'] ?? '',
            'koefisien_murni'     => $r['koefisien_murni'] ?? '',
            'harga_satuan_murni'  => floatval($r['harga_satuan_murni'] ?? 0),
            'total_harga_murni'   => floatval($r['total_harga_murni'] ?? 0),
            'koefisien'           => $r['koefisien'] ?? '',
            'harga_satuan'        => floatval($r['harga_satuan'] ?? 0),
            'total_harga'         => floatval($r['total_harga'] ?? 0),
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
