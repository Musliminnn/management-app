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
        $filters = session('filters', [
            'program' => null,
            'subKegiatan' => null,
            'sumberDana' => null,
        ]);

        $query = TrxBelanja::with([
            'subKegiatan.kegiatan.program.bidang.urusan',
            'unitSkpd.skpd',
            'akun',
            'standarHarga',
        ]);

        if ($filters['program']) {
            $query->whereHas('subKegiatan.kegiatan.program', function ($q) use ($filters) {
                $q->where('kode', $filters['program']);
            });
        }

        if ($filters['subKegiatan']) {
            $query->whereHas('subKegiatan', function ($q) use ($filters) {
                $q->where('kode', $filters['subKegiatan']);
            });
        }

        if ($filters['sumberDana']) {
            $query->where('sumber_dana', $filters['sumberDana']);
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
                'koefisien_murni'     => $item->koefisien_murni,
                'harga_satuan_murni'  => $item->harga_satuan_murni,
                'total_harga_murni'   => $item->total_harga_murni,
                'koefisien'           => $item->koefisien,
                'harga_satuan'        => $item->harga_satuan,
                'total_harga'         => $item->total_harga,
            ];
        });

        $allData = TrxBelanja::with([
            'subKegiatan.kegiatan.program',
        ])->get();

        $programList = $allData
            ->pluck('subKegiatan.kegiatan.program')
            ->unique('kode')
            ->values()
            ->map(fn($program) => [
                'kode' => $program->kode,
                'nama' => $program->nama,
            ]);

        $subKegiatanList = $allData
            ->pluck('subKegiatan')
            ->filter()
            ->unique('kode')
            ->values()
            ->map(fn($sub) => [
                'kode' => $sub->kode,
                'nama' => $sub->nama,
            ]);

        $sumberDanaList = $allData
            ->pluck('sumber_dana')
            ->filter()
            ->unique()
            ->values()
            ->map(fn($val) => [
                'kode' => $val,
                'nama' => $val,
            ]);

        return Inertia::render('InputDPA', [
            'data' => $rows,
            'pagination' => [
                'current_page' => $data->currentPage(),
                'last_page' => $data->lastPage(),
                'per_page' => $data->perPage(),
                'total' => $data->total(),
                'links' => $data->linkCollection(),
            ],
            'programList' => $programList,
            'subKegiatanList' => $subKegiatanList,
            'sumberDanaList' => $sumberDanaList,
            'filters' => $filters,
        ]);
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
        session()->forget('filters');
        return redirect()->route('inputdpa');
    }

    public function export(Request $request)
    {
        $visibleColumns = $request->input('visibleColumns', []);

        $filters = session('filters', [
            'program' => null,
            'subKegiatan' => null,
            'sumberDana' => null,
        ]);

        $query = TrxBelanja::with([
            'subKegiatan.kegiatan.program.bidang.urusan',
            'unitSkpd.skpd',
            'akun',
            'standarHarga',
        ]);

        if ($filters['program']) {
            $query->whereHas('subKegiatan.kegiatan.program', function ($q) use ($filters) {
                $q->where('kode', $filters['program']);
            });
        }

        if ($filters['subKegiatan']) {
            $query->whereHas('subKegiatan', function ($q) use ($filters) {
                $q->where('kode', $filters['subKegiatan']);
            });
        }

        if ($filters['sumberDana']) {
            $query->where('sumber_dana', $filters['sumberDana']);
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
                'koefisien_murni'     => $item->koefisien_murni,
                'harga_satuan_murni'  => $item->harga_satuan_murni,
                'total_harga_murni'   => $item->total_harga_murni,
                'koefisien'           => $item->koefisien,
                'harga_satuan'        => $item->harga_satuan,
                'total_harga'         => $item->total_harga,
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
