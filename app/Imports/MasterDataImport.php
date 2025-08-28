<?php

namespace App\Imports;

use App\Models\RefUrusan;
use App\Models\RefBidang;
use App\Models\RefProgram;
use App\Models\RefKegiatan;
use App\Models\RefSubKegiatan;
use App\Models\RefSkpd;
use App\Models\RefUnitSkpd;
use App\Models\RefAkun;
use App\Services\ImportOptimizationService;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use Maatwebsite\Excel\Row;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;

class MasterDataImport implements OnEachRow, WithHeadingRow, WithChunkReading, ShouldQueue
{
    // Cache lokal per chunk
    protected array $cache = [
        'urusan' => [],
        'bidang' => [],
        'program' => [],
        'kegiatan' => [],
        'sub_kegiatan' => [],
        'skpd' => [],
        'unit_skpd' => [],
        'akun' => [],
    ];

    // Cache Redis untuk validasi
    protected array $redisCache = [];
    protected string $importId;

    public function __construct(string $importId = null)
    {
        $this->importId = $importId ?? uniqid('import_');

        // Preload reference data into cache
        ImportOptimizationService::preloadReferenceData();

        // Load Redis cache
        $this->redisCache = [
            'urusan' => Cache::get('ref_urusan_codes', []),
            'bidang' => Cache::get('ref_bidang_codes', []),
            'program' => Cache::get('ref_program_codes', []),
            'kegiatan' => Cache::get('ref_kegiatan_codes', []),
            'sub_kegiatan' => Cache::get('ref_sub_kegiatan_codes', []),
            'skpd' => Cache::get('ref_skpd_codes', []),
            'unit_skpd' => Cache::get('ref_unit_skpd_codes', []),
            'akun' => Cache::get('ref_akun_codes', []),
        ];
    }

    public function onRow(Row $row): void
    {
        $r = array_map('trim', $row->toArray());

        try {
            if (
                empty($r['KODE URUSAN']) || empty($r['KODE PROGRAM']) ||
                empty($r['KODE SKPD']) || empty($r['KODE AKUN'])
            ) {
                Log::info('Baris dilewati karena field penting kosong', $r);
                return;
            }

            // === RefUrusan ===
            if (
                !isset($this->cache['urusan'][$r['KODE URUSAN']]) &&
                !isset($this->redisCache['urusan'][$r['KODE URUSAN']])
            ) {
                RefUrusan::firstOrCreate(
                    ['kode' => $r['KODE URUSAN']],
                    ['nama' => $r['NAMA URUSAN'] ?? '']
                );
                $this->cache['urusan'][$r['KODE URUSAN']] = true;
                // Update Redis cache
                Cache::put('ref_urusan_codes', array_merge($this->redisCache['urusan'], [$r['KODE URUSAN'] => $r['NAMA URUSAN'] ?? '']), 3600);
            }

            // === RefBidang ===
            if (!isset($this->cache['bidang'][$r['KODE BIDANG URUSAN']])) {
                RefBidang::firstOrCreate(
                    ['kode' => $r['KODE BIDANG URUSAN']],
                    [
                        'nama' => $r['NAMA BIDANG URUSAN'] ?? '',
                        'kode_urusan' => $r['KODE URUSAN'],
                    ]
                );
                $this->cache['bidang'][$r['KODE BIDANG URUSAN']] = true;
            }

            // === RefProgram ===
            if (!isset($this->cache['program'][$r['KODE PROGRAM']])) {
                RefProgram::firstOrCreate(
                    ['kode' => $r['KODE PROGRAM']],
                    [
                        'nama' => $r['NAMA PROGRAM'] ?? '',
                        'kode_bidang' => $r['KODE BIDANG URUSAN'],
                    ]
                );
                $this->cache['program'][$r['KODE PROGRAM']] = true;
            }

            // === RefKegiatan ===
            if (!isset($this->cache['kegiatan'][$r['KODE KEGIATAN']])) {
                RefKegiatan::firstOrCreate(
                    ['kode' => $r['KODE KEGIATAN']],
                    [
                        'nama' => $r['NAMA KEGIATAN'] ?? '',
                        'kode_program' => $r['KODE PROGRAM'],
                    ]
                );
                $this->cache['kegiatan'][$r['KODE KEGIATAN']] = true;
            }

            // === RefSubKegiatan ===
            if (!isset($this->cache['sub_kegiatan'][$r['KODE SUB KEGIATAN']])) {
                RefSubKegiatan::firstOrCreate(
                    ['kode' => $r['KODE SUB KEGIATAN']],
                    [
                        'nama' => $r['NAMA SUB KEGIATAN'] ?? '',
                        'kode_kegiatan' => $r['KODE KEGIATAN'],
                    ]
                );
                $this->cache['sub_kegiatan'][$r['KODE SUB KEGIATAN']] = true;
            }

            // === RefSkpd ===
            if (!isset($this->cache['skpd'][$r['KODE SKPD']])) {
                RefSkpd::firstOrCreate(
                    ['kode' => $r['KODE SKPD']],
                    ['nama' => $r['NAMA SKPD'] ?? '']
                );
                $this->cache['skpd'][$r['KODE SKPD']] = true;
            }

            // === RefUnitSkpd ===
            if (!isset($this->cache['unit_skpd'][$r['KODE UNIT SKPD']])) {
                RefUnitSkpd::firstOrCreate(
                    ['kode' => $r['KODE UNIT SKPD']],
                    [
                        'nama' => $r['NAMA UNIT SKPD'] ?? '',
                        'kode_skpd' => $r['KODE SKPD'],
                    ]
                );
                $this->cache['unit_skpd'][$r['KODE UNIT SKPD']] = true;
            }

            // === RefAkun ===
            if (!isset($this->cache['akun'][$r['KODE AKUN']])) {
                RefAkun::firstOrCreate(
                    ['kode' => $r['KODE AKUN']],
                    ['nama' => $r['NAMA AKUN'] ?? ''],
                    ['paket' => $r['PAKET/KELOMPOK BELANJA/TAGGING (#)'] ?? '-'],
                    ['keterangan_belanja' => $r['KETERANGAN BELANJA/AKTIVITAS (-)'] ?? '-'],
                    ['sumber_dana' => $r['SUMBER DANA'] ?? '-'],
                    ['nama_penerima' => $r['NAMA PENERIMA BANTUAN'] ?? '-'],
                );
                $this->cache['akun'][$r['KODE AKUN']] = true;
            }
        } catch (\Throwable $e) {
            Log::error('Gagal parsing row MasterDataImport', [
                'message' => $e->getMessage(),
                'row' => $r,
            ]);
        }
    }

    public function chunkSize(): int
    {
        return ImportOptimizationService::getDynamicChunkSize();
    }
}
