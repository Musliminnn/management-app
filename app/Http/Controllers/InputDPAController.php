<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TrxBelanja;
use Inertia\Inertia;
use Illuminate\Http\Response;

class InputDPAController extends Controller
{
    public function index(Request $request)
    {
        $filters = session('cascading_filters', [
            'program' => null,
            'kegiatan' => null,
            'subKegiatan' => null,
            'skpd' => null,
            'unitSkpd' => null,
            'sumberDana' => null,
            'paket' => [],
        ]);

        $query = TrxBelanja::with([
            'subKegiatan.kegiatan.program.bidang.urusan',
            'unitSkpd.skpd',
            'akun',
            'standarHarga',
        ]);

        // Apply cascading filters
        if ($filters['program']) {
            $query->whereHas('subKegiatan.kegiatan.program', function ($q) use ($filters) {
                $q->where('kode', $filters['program']);
            });
        }

        if ($filters['kegiatan']) {
            $query->whereHas('subKegiatan.kegiatan', function ($q) use ($filters) {
                $q->where('kode', $filters['kegiatan']);
            });
        }

        if ($filters['subKegiatan']) {
            $query->whereHas('subKegiatan', function ($q) use ($filters) {
                $q->where('kode', $filters['subKegiatan']);
            });
        }

        if ($filters['skpd']) {
            $query->whereHas('unitSkpd.skpd', function ($q) use ($filters) {
                $q->where('kode', $filters['skpd']);
            });
        }

        if ($filters['unitSkpd']) {
            $query->whereHas('unitSkpd', function ($q) use ($filters) {
                $q->where('kode', $filters['unitSkpd']);
            });
        }

        if ($filters['sumberDana']) {
            $query->where('sumber_dana', $filters['sumberDana']);
        }

        if (!empty($filters['paket']) && is_array($filters['paket'])) {
            $query->whereIn('paket', $filters['paket']);
        }

        $data = $query->orderBy('id')->paginate(10);

        $rows = collect($data->items())->map(function ($item) {
            return [
                'kode_urusan'         => $item->subKegiatan->kegiatan->program->bidang->urusan->kode ?? null,
                'nama_urusan'         => $item->subKegiatan->kegiatan->program->bidang->urusan->nama ?? null,
                'kode_bidang_urusan'  => $item->subKegiatan->kegiatan->program->bidang->kode ?? null,
                'nama_bidang_urusan'  => $item->subKegiatan->kegiatan->program->bidang->nama ?? null,
                'kode_program'        => $item->subKegiatan->kegiatan->program->kode ?? null,
                'nama_program'        => $item->subKegiatan->kegiatan->program->nama ?? null,
                'kode_kegiatan'       => $item->subKegiatan->kegiatan->kode ?? null,
                'nama_kegiatan'       => $item->subKegiatan->kegiatan->nama ?? null,
                'kode_sub_kegiatan'   => $item->subKegiatan->kode ?? null,
                'nama_sub_kegiatan'   => $item->subKegiatan->nama ?? null,
                'kode_skpd'           => $item->unitSkpd->skpd->kode ?? null,
                'nama_skpd'           => $item->unitSkpd->skpd->nama ?? null,
                'kode_unit_skpd'      => $item->unitSkpd->kode ?? null,
                'nama_unit_skpd'      => $item->unitSkpd->nama ?? null,
                'kode_akun'           => $item->akun->kode ?? null,
                'nama_akun'           => $item->akun->nama ?? null,
                'paket'               => $item->paket,
                'keterangan_belanja'  => $item->keterangan_belanja,
                'sumber_dana'         => $item->sumber_dana,
                'nama_penerima'       => $item->nama_penerima,
                'kode_standar_harga'  => $item->standarHarga->kode ?? null,
                'nama_standar_harga'  => $item->standarHarga->nama ?? null,
                'spesifikasi'         => $item->spesifikasi,
                'koefisien'           => $item->koefisien,
                'harga_satuan'        => $item->harga_satuan,
                'total_harga'         => $item->total_harga,
                'unit_kerja'          => $item->unit_kerja,
            ];
        });

        // Get filter options based on current selections
        $filterOptions = $this->getFilterOptions($filters);

        // Calculate grand total from all filtered data (not just current page)
        $grandTotal = $this->calculateGrandTotal($filters);

        return Inertia::render('InputDPA', [
            'data' => $rows,
            'pagination' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
                'links' => $data->linkCollection(),
            ],
            'grandTotal' => $grandTotal,
            'cascadingFilters' => $filters,
            'programList' => $filterOptions['programList'],
            'kegiatanList' => $filterOptions['kegiatanList'],
            'subKegiatanList' => $filterOptions['subKegiatanList'],
            'skpdList' => $filterOptions['skpdList'],
            'unitSkpdList' => $filterOptions['unitSkpdList'],
            'sumberDanaList' => $filterOptions['sumberDanaList'],
            'paketList' => $filterOptions['paketList'],
        ]);
    }

    private function calculateGrandTotal($filters)
    {
        $grandTotalQuery = TrxBelanja::query();

        // Apply same filters for grand total calculation
        if ($filters['program']) {
            $grandTotalQuery->whereHas('subKegiatan.kegiatan.program', function ($q) use ($filters) {
                $q->where('kode', $filters['program']);
            });
        }

        if ($filters['kegiatan']) {
            $grandTotalQuery->whereHas('subKegiatan.kegiatan', function ($q) use ($filters) {
                $q->where('kode', $filters['kegiatan']);
            });
        }

        if ($filters['subKegiatan']) {
            $grandTotalQuery->whereHas('subKegiatan', function ($q) use ($filters) {
                $q->where('kode', $filters['subKegiatan']);
            });
        }

        if ($filters['skpd']) {
            $grandTotalQuery->whereHas('unitSkpd.skpd', function ($q) use ($filters) {
                $q->where('kode', $filters['skpd']);
            });
        }

        if ($filters['unitSkpd']) {
            $grandTotalQuery->whereHas('unitSkpd', function ($q) use ($filters) {
                $q->where('kode', $filters['unitSkpd']);
            });
        }

        if ($filters['sumberDana']) {
            $grandTotalQuery->where('sumber_dana', $filters['sumberDana']);
        }

        if (!empty($filters['paket']) && is_array($filters['paket'])) {
            $grandTotalQuery->whereIn('paket', $filters['paket']);
        }

        return $grandTotalQuery->sum('total_harga');
    }

    private function getFilterOptions($filters)
    {
        // Get all available Programs (top level, always available)
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
        if ($filters['program']) {
            $kegiatanList = TrxBelanja::with('subKegiatan.kegiatan.program')
                ->whereHas('subKegiatan.kegiatan.program', function ($q) use ($filters) {
                    $q->where('kode', $filters['program']);
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
        if ($filters['kegiatan']) {
            $subKegiatanList = TrxBelanja::with('subKegiatan.kegiatan')
                ->whereHas('subKegiatan.kegiatan', function ($q) use ($filters) {
                    $q->where('kode', $filters['kegiatan']);
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

        // Get all available SKPD (independent of hierarchy)
        $skpdList = collect();
        if (TrxBelanja::count() > 0) {
            $skpdList = TrxBelanja::with('unitSkpd.skpd')
                ->get()
                ->pluck('unitSkpd.skpd')
                ->filter()
                ->unique('kode')
                ->values()
                ->map(fn($item) => [
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ]);
        }

        // Get Unit SKPD based on selected SKPD
        $unitSkpdList = collect();
        if ($filters['skpd']) {
            $unitSkpdList = TrxBelanja::with('unitSkpd.skpd')
                ->whereHas('unitSkpd.skpd', function ($q) use ($filters) {
                    $q->where('kode', $filters['skpd']);
                })
                ->get()
                ->pluck('unitSkpd')
                ->filter()
                ->unique('kode')
                ->values()
                ->map(fn($item) => [
                    'kode' => $item->kode,
                    'nama' => $item->nama,
                ]);
        }

        // Get all available Sumber Dana (independent)
        $sumberDanaList = collect();
        if (TrxBelanja::count() > 0) {
            $sumberDanaList = TrxBelanja::distinct()
                ->pluck('sumber_dana')
                ->filter()
                ->unique()
                ->values()
                ->map(fn($val) => [
                    'kode' => $val,
                    'nama' => $val,
                ]);
        }

        // Get all available Paket (independent, uppercase for display)
        $paketList = collect();
        if (TrxBelanja::count() > 0) {
            $paketList = TrxBelanja::distinct()
                ->pluck('paket')
                ->filter()
                ->unique()
                ->values()
                ->map(fn($val) => [
                    'kode' => $val, // Keep original value for filtering
                    'nama' => strtoupper($val), // Display in uppercase
                ]);
        }

        return [
            'programList' => $programList,
            'kegiatanList' => $kegiatanList,
            'subKegiatanList' => $subKegiatanList,
            'skpdList' => $skpdList,
            'unitSkpdList' => $unitSkpdList,
            'sumberDanaList' => $sumberDanaList,
            'paketList' => $paketList,
        ];
    }

    public function cascadingFilter(Request $request)
    {
        session([
            'cascading_filters.program' => $request->input('program'),
            'cascading_filters.kegiatan' => $request->input('kegiatan'),
            'cascading_filters.subKegiatan' => $request->input('subKegiatan'),
            'cascading_filters.skpd' => $request->input('skpd'),
            'cascading_filters.unitSkpd' => $request->input('unitSkpd'),
            'cascading_filters.sumberDana' => $request->input('sumberDana'),
            'cascading_filters.paket' => $request->input('paket', []),
        ]);

        return redirect()->route('inputdpa');
    }

    public function filter(Request $request)
    {
        session([
            'filters.program' => $request->input('program'),
            'filters.subKegiatan' => $request->input('subKegiatan'),
            'filters.sumberDana' => $request->input('sumberDana'),
        ]);

        return redirect()->route('inputdpa');
    }

    public function reset()
    {
        session()->forget(['filters', 'cascading_filters']);
        return redirect()->route('inputdpa');
    }

    public function export(Request $request)
    {
        $visibleColumns = $request->input('visibleColumns', []);

        $filters = session('cascading_filters', [
            'program' => null,
            'kegiatan' => null,
            'subKegiatan' => null,
            'skpd' => null,
            'unitSkpd' => null,
            'sumberDana' => null,
            'paket' => [],
        ]);

        $query = TrxBelanja::with([
            'subKegiatan.kegiatan.program.bidang.urusan',
            'unitSkpd.skpd',
            'akun',
            'standarHarga',
        ]);

        // Apply cascading filters
        if ($filters['program']) {
            $query->whereHas('subKegiatan.kegiatan.program', function ($q) use ($filters) {
                $q->where('kode', $filters['program']);
            });
        }

        if ($filters['kegiatan']) {
            $query->whereHas('subKegiatan.kegiatan', function ($q) use ($filters) {
                $q->where('kode', $filters['kegiatan']);
            });
        }

        if ($filters['subKegiatan']) {
            $query->whereHas('subKegiatan', function ($q) use ($filters) {
                $q->where('kode', $filters['subKegiatan']);
            });
        }

        if ($filters['skpd']) {
            $query->whereHas('unitSkpd.skpd', function ($q) use ($filters) {
                $q->where('kode', $filters['skpd']);
            });
        }

        if ($filters['unitSkpd']) {
            $query->whereHas('unitSkpd', function ($q) use ($filters) {
                $q->where('kode', $filters['unitSkpd']);
            });
        }

        if ($filters['sumberDana']) {
            $query->where('sumber_dana', $filters['sumberDana']);
        }

        if (!empty($filters['paket']) && is_array($filters['paket'])) {
            $query->whereIn('paket', $filters['paket']);
        }

        $data = $query->orderBy('id')->get();

        $rows = collect($data)->map(function ($item) {
            return [
                'kode_urusan'         => $item->subKegiatan->kegiatan->program->bidang->urusan->kode ?? null,
                'nama_urusan'         => $item->subKegiatan->kegiatan->program->bidang->urusan->nama ?? null,
                'kode_bidang_urusan'  => $item->subKegiatan->kegiatan->program->bidang->kode ?? null,
                'nama_bidang_urusan'  => $item->subKegiatan->kegiatan->program->bidang->nama ?? null,
                'kode_program'        => $item->subKegiatan->kegiatan->program->kode ?? null,
                'nama_program'        => $item->subKegiatan->kegiatan->program->nama ?? null,
                'kode_kegiatan'       => $item->subKegiatan->kegiatan->kode ?? null,
                'nama_kegiatan'       => $item->subKegiatan->kegiatan->nama ?? null,
                'kode_sub_kegiatan'   => $item->subKegiatan->kode ?? null,
                'nama_sub_kegiatan'   => $item->subKegiatan->nama ?? null,
                'kode_skpd'           => $item->unitSkpd->skpd->kode ?? null,
                'nama_skpd'           => $item->unitSkpd->skpd->nama ?? null,
                'kode_unit_skpd'      => $item->unitSkpd->kode ?? null,
                'nama_unit_skpd'      => $item->unitSkpd->nama ?? null,
                'kode_akun'           => $item->akun->kode ?? null,
                'nama_akun'           => $item->akun->nama ?? null,
                'paket'               => $item->paket,
                'keterangan_belanja'  => $item->keterangan_belanja,
                'sumber_dana'         => $item->sumber_dana,
                'nama_penerima'       => $item->nama_penerima,
                'kode_standar_harga'  => $item->standarHarga->kode ?? null,
                'nama_standar_harga'  => $item->standarHarga->nama ?? null,
                'spesifikasi'         => $item->spesifikasi,
                'koefisien'           => $item->koefisien,
                'harga_satuan'        => $item->harga_satuan,
                'total_harga'         => $item->total_harga,
                'unit_kerja'          => $item->unit_kerja,
            ];
        });

        // Filter hanya kolom yang visible
        $filteredRows = $rows->map(function ($row) use ($visibleColumns) {
            return collect($row)->only($visibleColumns)->toArray();
        });

        // Generate CSV
        $csvContent = '';

        // Header
        if ($visibleColumns) {
            $headers = array_map(function ($col) {
                return strtoupper(str_replace('_', ' ', $col));
            }, $visibleColumns);
            $csvContent .= implode(',', $headers) . "\n";
        }

        // Data rows
        foreach ($filteredRows as $row) {
            $csvRow = array_map(function ($value) {
                // Escape comma and quotes in CSV
                if (strpos($value, ',') !== false || strpos($value, '"') !== false) {
                    return '"' . str_replace('"', '""', $value) . '"';
                }
                return $value ?? '';
            }, array_values($row));
            $csvContent .= implode(',', $csvRow) . "\n";
        }

        $filename = 'data_dpa_' . date('Y-m-d_H-i-s') . '.csv';

        return response($csvContent)
            ->header('Content-Type', 'text/csv')
            ->header('Content-Disposition', 'attachment; filename="' . $filename . '"');
    }
}
