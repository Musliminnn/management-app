<?php

namespace App\Http\Controllers;

use App\Enums\RealisasiStatusEnum;
use App\Models\TrxBelanja;
use App\Models\RealisasiBelanja;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // Summary statistics - only count validated realisasi
        $totalAnggaran = TrxBelanja::sum('total_harga');
        $totalRealisasi = RealisasiBelanja::where('status', RealisasiStatusEnum::Validated)->sum('realisasi');
        $sisaAnggaran = $totalAnggaran - $totalRealisasi;
        $persentaseRealisasi = $totalAnggaran > 0 ? ($totalRealisasi / $totalAnggaran) * 100 : 0;

        // Counts - only count validated realisasi
        $jumlahItemAnggaran = TrxBelanja::count();
        $jumlahTransaksiRealisasi = RealisasiBelanja::where('status', RealisasiStatusEnum::Validated)->count();

        // Realisasi per Program
        $realisasiPerProgram = $this->getRealisasiPerProgram();

        // Anggaran per Program
        $anggaranPerProgram = $this->getAnggaranPerProgram();

        // Recent realisasi transactions (all statuses)
        $recentRealisasi = RealisasiBelanja::with(['kegiatan', 'subKegiatan', 'akun', 'user'])
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'tanggal' => $item->tanggal->format('d M Y'),
                    'kegiatan' => $item->kegiatan->nama ?? '-',
                    'sub_kegiatan' => $item->subKegiatan->nama ?? '-',
                    'realisasi' => $item->realisasi,
                    'user' => $item->user->name ?? '-',
                    'status' => $item->status->value,
                ];
            });

        // Top 5 Program by Anggaran
        $topProgramAnggaran = collect($anggaranPerProgram)
            ->sortByDesc('anggaran')
            ->take(5)
            ->values();

        return Inertia::render('Dashboard', [
            'stats' => [
                'totalAnggaran' => $totalAnggaran,
                'totalRealisasi' => $totalRealisasi,
                'sisaAnggaran' => $sisaAnggaran,
                'persentaseRealisasi' => round($persentaseRealisasi, 2),
                'jumlahItemAnggaran' => $jumlahItemAnggaran,
                'jumlahTransaksiRealisasi' => $jumlahTransaksiRealisasi,
            ],
            'realisasiPerProgram' => $realisasiPerProgram,
            'anggaranPerProgram' => $anggaranPerProgram,
            'recentRealisasi' => $recentRealisasi,
            'topProgramAnggaran' => $topProgramAnggaran,
        ]);
    }

    private function getRealisasiPerProgram()
    {
        $realisasi = RealisasiBelanja::with('subKegiatan.kegiatan.program')
            ->where('status', RealisasiStatusEnum::Validated)
            ->get()
            ->groupBy(function ($item) {
                return $item->subKegiatan->kegiatan->program->kode ?? 'Unknown';
            })
            ->map(function ($items, $kode) {
                $program = $items->first()->subKegiatan->kegiatan->program ?? null;
                return [
                    'kode' => $kode,
                    'nama' => $program->nama ?? 'Unknown',
                    'realisasi' => $items->sum('realisasi'),
                    'jumlah_transaksi' => $items->count(),
                ];
            })
            ->values()
            ->toArray();

        return $realisasi;
    }

    private function getAnggaranPerProgram()
    {
        $anggaran = TrxBelanja::with('subKegiatan.kegiatan.program')
            ->get()
            ->groupBy(function ($item) {
                return $item->subKegiatan->kegiatan->program->kode ?? 'Unknown';
            })
            ->map(function ($items, $kode) {
                $program = $items->first()->subKegiatan->kegiatan->program ?? null;

                // Get validated realisasi for this program
                $realisasi = RealisasiBelanja::where('status', RealisasiStatusEnum::Validated)
                    ->whereHas('subKegiatan.kegiatan.program', function ($q) use ($kode) {
                        $q->where('kode', $kode);
                    })->sum('realisasi');

                $totalAnggaran = $items->sum('total_harga');
                $persentase = $totalAnggaran > 0 ? ($realisasi / $totalAnggaran) * 100 : 0;

                return [
                    'kode' => $kode,
                    'nama' => $program->nama ?? 'Unknown',
                    'anggaran' => $totalAnggaran,
                    'realisasi' => $realisasi,
                    'sisa' => $totalAnggaran - $realisasi,
                    'persentase' => round($persentase, 2),
                    'jumlah_item' => $items->count(),
                ];
            })
            ->values()
            ->toArray();

        return $anggaran;
    }
}
