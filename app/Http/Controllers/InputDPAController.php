<?php

namespace App\Http\Controllers;

use App\Models\TrxBelanja;
use Inertia\Inertia;

class InputDPAController extends Controller
{
    public function index()
    {
        $data = TrxBelanja::with([
            'subKegiatan.kegiatan.program.bidang.urusan',
            'unitSkpd.skpd',
            'akun',
            'standarHarga',
        ])
            ->orderBy('id', 'asc')
            ->paginate(10);

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

        $programList = $data
            ->pluck('subKegiatan.kegiatan.program')
            ->unique('kode')
            ->values()
            ->map(fn($program) => [
                'kode' => $program->kode,
                'nama' => $program->nama,
            ]);

        $subKegiatanList = $data
            ->pluck('subKegiatan')
            ->filter()
            ->unique('kode')
            ->values()
            ->map(fn($sub) => [
                'kode' => $sub->kode,
                'nama' => $sub->nama,
            ]);

        $sumberDanaList = $data
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
        ]);
    }
}
