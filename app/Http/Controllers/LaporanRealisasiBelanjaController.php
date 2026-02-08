<?php

namespace App\Http\Controllers;

use App\Enums\RealisasiStatusEnum;
use App\Models\RealisasiBelanja;
use App\Models\TrxBelanja;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Inertia\Inertia;

class LaporanRealisasiBelanjaController extends Controller
{
    public function index(Request $request)
    {
        $sessionFilters = session('laporan_filters', []);
        $filters = [
            'program' => $sessionFilters['program'] ?? null,
            'kegiatan' => $sessionFilters['kegiatan'] ?? null,
            'subKegiatan' => $sessionFilters['subKegiatan'] ?? null,
        ];

        // Get filter options
        $filterOptions = $this->getFilterOptions($filters);

        // Get report data if sub kegiatan is selected
        $reportData = null;
        $headerInfo = null;
        $totals = null;

        if ($filters['subKegiatan']) {
            $result = $this->generateReportData($filters);
            $reportData = $result['data'];
            $headerInfo = $result['header'];
            $totals = $result['totals'];
        }

        return Inertia::render('LaporanRealisasiBelanja', [
            'cascadingFilters' => $filters,
            'programList' => $filterOptions['programList'],
            'kegiatanList' => $filterOptions['kegiatanList'],
            'subKegiatanList' => $filterOptions['subKegiatanList'],
            'reportData' => $reportData,
            'headerInfo' => $headerInfo,
            'totals' => $totals,
        ]);
    }

    private function generateReportData($filters)
    {
        // Get sub kegiatan info with hierarchy
        $subKegiatanData = TrxBelanja::with([
            'subKegiatan.kegiatan.program.bidang.urusan',
        ])
            ->where('kode_sub_kegiatan', $filters['subKegiatan'])
            ->first();

        $headerInfo = null;
        if ($subKegiatanData) {
            $headerInfo = [
                'program' => $subKegiatanData->subKegiatan->kegiatan->program->kode . ' - ' .
                            $subKegiatanData->subKegiatan->kegiatan->program->nama,
                'kegiatan' => $subKegiatanData->subKegiatan->kegiatan->kode . ' - ' .
                             $subKegiatanData->subKegiatan->kegiatan->nama,
                'sub_kegiatan' => $subKegiatanData->subKegiatan->kode . ' - ' .
                                 $subKegiatanData->subKegiatan->nama,
            ];
        }

        // Get all trx_belanja for this sub kegiatan (anggaran)
        $anggaranData = TrxBelanja::with(['akun'])
            ->where('kode_sub_kegiatan', $filters['subKegiatan'])
            ->get()
            ->groupBy('kode_akun');

        // Get all validated realisasi for this sub kegiatan
        $realisasiData = RealisasiBelanja::where('kode_sub_kegiatan', $filters['subKegiatan'])
            ->where('status', RealisasiStatusEnum::Validated)
            ->get()
            ->groupBy('kode_akun');

        $reportRows = [];
        $totalAnggaran = 0;
        $totalRealisasi = 0;

        foreach ($anggaranData as $kodeAkun => $items) {
            $akun = $items->first()->akun;

            // Group by spesifikasi within each akun
            $itemsBySpesifikasi = $items->groupBy(function ($item) {
                return $item->spesifikasi . '|' . $item->nama . '|' . $item->keterangan_belanja . '|' . $item->sumber_dana;
            });

            foreach ($itemsBySpesifikasi as $key => $specItems) {
                $parts = explode('|', $key);
                $spesifikasi = $parts[0] ?? '';
                $namaStandar = $parts[1] ?? '';
                $keteranganBelanja = $parts[2] ?? '';
                $sumberDana = $parts[3] ?? '';

                // Sum anggaran for this spesifikasi
                $anggaran = $specItems->sum('total_harga');
                $totalAnggaran += $anggaran;

                // Get realisasi for this kode_akun and spesifikasi
                $realisasi = 0;
                if (isset($realisasiData[$kodeAkun])) {
                    $realisasi = $realisasiData[$kodeAkun]
                        ->where('spesifikasi', $spesifikasi)
                        ->sum('realisasi');
                }
                $totalRealisasi += $realisasi;

                $sisaAnggaran = $anggaran - $realisasi;

                $reportRows[] = [
                    'kode_akun' => $kodeAkun,
                    'nama_akun' => $akun->nama ?? '',
                    'nama_standar' => $namaStandar,
                    'spesifikasi' => $spesifikasi,
                    'kelompok_belanja' => $keteranganBelanja,
                    'sumber_dana' => $sumberDana,
                    'anggaran' => $anggaran,
                    'realisasi' => $realisasi,
                    'sisa_anggaran' => $sisaAnggaran,
                ];
            }
        }

        return [
            'data' => $reportRows,
            'header' => $headerInfo,
            'totals' => [
                'anggaran' => $totalAnggaran,
                'realisasi' => $totalRealisasi,
                'sisa_anggaran' => $totalAnggaran - $totalRealisasi,
            ],
        ];
    }

    private function getFilterOptions($filters)
    {
        $program = $filters['program'] ?? null;
        $kegiatan = $filters['kegiatan'] ?? null;

        // Get all available Programs
        $programList = collect();
        if (TrxBelanja::count() > 0) {
            $programList = TrxBelanja::with('subKegiatan.kegiatan.program')
                ->get()
                ->pluck('subKegiatan.kegiatan.program')
                ->filter()
                ->unique('kode')
                ->values()
                ->map(fn($item) => [
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ]);
        }

        // Get Kegiatan based on selected Program
        $kegiatanList = collect();
        if ($program) {
            $kegiatanList = TrxBelanja::with('subKegiatan.kegiatan.program')
                ->whereHas('subKegiatan.kegiatan.program', function ($q) use ($program) {
                    $q->where('kode', $program);
                })
                ->get()
                ->pluck('subKegiatan.kegiatan')
                ->filter()
                ->unique('kode')
                ->values()
                ->map(fn($item) => [
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ]);
        }

        // Get Sub Kegiatan based on selected Kegiatan
        $subKegiatanList = collect();
        if ($kegiatan) {
            $subKegiatanList = TrxBelanja::with('subKegiatan.kegiatan')
                ->whereHas('subKegiatan.kegiatan', function ($q) use ($kegiatan) {
                    $q->where('kode', $kegiatan);
                })
                ->get()
                ->pluck('subKegiatan')
                ->filter()
                ->unique('kode')
                ->values()
                ->map(fn($item) => [
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ]);
        }

        return [
            'programList' => $programList,
            'kegiatanList' => $kegiatanList,
            'subKegiatanList' => $subKegiatanList,
        ];
    }

    public function cascadingFilter(Request $request)
    {
        session([
            'laporan_filters.program' => $request->input('program'),
            'laporan_filters.kegiatan' => $request->input('kegiatan'),
            'laporan_filters.subKegiatan' => $request->input('subKegiatan'),
        ]);

        return redirect()->route('laporan-realisasi-belanja.index');
    }

    public function reset()
    {
        session()->forget('laporan_filters');
        return redirect()->route('laporan-realisasi-belanja.index');
    }

    public function exportPdf(Request $request)
    {
        $sessionFilters = session('laporan_filters', []);
        $filters = [
            'program' => $sessionFilters['program'] ?? null,
            'kegiatan' => $sessionFilters['kegiatan'] ?? null,
            'subKegiatan' => $sessionFilters['subKegiatan'] ?? null,
        ];

        if (!$filters['subKegiatan']) {
            return redirect()->route('laporan-realisasi-belanja.index')
                ->with('error', 'Pilih Sub Kegiatan terlebih dahulu');
        }

        $result = $this->generateReportData($filters);

        $pdf = Pdf::loadView('pdf.laporan-realisasi-belanja', [
            'reportData' => $result['data'],
            'headerInfo' => $result['header'],
            'totals' => $result['totals'],
        ]);

        $pdf->setPaper('a4', 'landscape');

        $filename = 'laporan_realisasi_belanja_' . date('Y-m-d_H-i-s') . '.pdf';

        return $pdf->download($filename);
    }
}
