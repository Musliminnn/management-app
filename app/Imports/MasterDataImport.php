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
use App\Models\RefStandarHarga;
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
        'standar_harga' => [],
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
            'standar_harga' => Cache::get('ref_standar_harga_codes', []),
        ];
    }

    public function onRow(Row $row): void
    {
        $r = array_map('trim', $row->toArray()); // Normalisasi: trim semua value

        try {
            // Validasi minimal untuk mencegah duplikasi tak perlu
            if (
                empty($r['kode_urusan']) || empty($r['kode_program']) ||
                empty($r['kode_skpd']) || empty($r['kode_akun']) ||
                empty($r['kode_standar_harga'])
            ) {
                Log::info('Baris dilewati karena field penting kosong', $r);
                return;
            }

            // === RefUrusan ===
            if (
                !isset($this->cache['urusan'][$r['kode_urusan']]) &&
                !isset($this->redisCache['urusan'][$r['kode_urusan']])
            ) {
                RefUrusan::firstOrCreate(
                    ['kode' => $r['kode_urusan']],
                    ['nama' => $r['nama_urusan'] ?? '']
                );
                $this->cache['urusan'][$r['kode_urusan']] = true;
                // Update Redis cache
                Cache::put('ref_urusan_codes', array_merge($this->redisCache['urusan'], [$r['kode_urusan'] => $r['nama_urusan'] ?? '']), 3600);
            }

            // === RefBidang ===
            if (!isset($this->cache['bidang'][$r['kode_bidang_urusan']])) {
                RefBidang::firstOrCreate(
                    ['kode' => $r['kode_bidang_urusan']],
                    [
                        'nama' => $r['nama_bidang_urusan'] ?? '',
                        'kode_urusan' => $r['kode_urusan'],
                    ]
                );
                $this->cache['bidang'][$r['kode_bidang_urusan']] = true;
            }

            // === RefProgram ===
            if (!isset($this->cache['program'][$r['kode_program']])) {
                RefProgram::firstOrCreate(
                    ['kode' => $r['kode_program']],
                    [
                        'nama' => $r['nama_program'] ?? '',
                        'kode_bidang' => $r['kode_bidang_urusan'],
                    ]
                );
                $this->cache['program'][$r['kode_program']] = true;
            }

            // === RefKegiatan ===
            if (!isset($this->cache['kegiatan'][$r['kode_kegiatan']])) {
                RefKegiatan::firstOrCreate(
                    ['kode' => $r['kode_kegiatan']],
                    [
                        'nama' => $r['nama_kegiatan'] ?? '',
                        'kode_program' => $r['kode_program'],
                    ]
                );
                $this->cache['kegiatan'][$r['kode_kegiatan']] = true;
            }

            // === RefSubKegiatan ===
            if (!isset($this->cache['sub_kegiatan'][$r['kode_sub_kegiatan']])) {
                RefSubKegiatan::firstOrCreate(
                    ['kode' => $r['kode_sub_kegiatan']],
                    [
                        'nama' => $r['nama_sub_kegiatan'] ?? '',
                        'kode_kegiatan' => $r['kode_kegiatan'],
                    ]
                );
                $this->cache['sub_kegiatan'][$r['kode_sub_kegiatan']] = true;
            }

            // === RefSkpd ===
            if (!isset($this->cache['skpd'][$r['kode_skpd']])) {
                RefSkpd::firstOrCreate(
                    ['kode' => $r['kode_skpd']],
                    ['nama' => $r['nama_skpd'] ?? '']
                );
                $this->cache['skpd'][$r['kode_skpd']] = true;
            }

            // === RefUnitSkpd ===
            if (!isset($this->cache['unit_skpd'][$r['kode_unit_skpd']])) {
                RefUnitSkpd::firstOrCreate(
                    ['kode' => $r['kode_unit_skpd']],
                    [
                        'nama' => $r['nama_unit_skpd'] ?? '',
                        'kode_skpd' => $r['kode_skpd'],
                    ]
                );
                $this->cache['unit_skpd'][$r['kode_unit_skpd']] = true;
            }

            // === RefAkun ===
            if (!isset($this->cache['akun'][$r['kode_akun']])) {
                RefAkun::firstOrCreate(
                    ['kode' => $r['kode_akun']],
                    ['nama' => $r['nama_akun'] ?? '']
                );
                $this->cache['akun'][$r['kode_akun']] = true;
            }

            // === RefStandarHarga ===
            if (!isset($this->cache['standar_harga'][$r['kode_standar_harga']])) {
                RefStandarHarga::firstOrCreate(
                    ['kode' => $r['kode_standar_harga']],
                    ['nama' => $r['nama_standar_harga'] ?? '']
                );
                $this->cache['standar_harga'][$r['kode_standar_harga']] = true;
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
