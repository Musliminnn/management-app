<?php

namespace App\Enums;

enum MenuEnum: string
{
    case Dashboard = 'dashboard';
    case InputDPA = 'input_dpa';
    case InputRealisasiBelanja = 'input_realisasi_belanja';
    case RiwayatTransaksi = 'riwayat_transaksi';
    case LaporanRealisasi = 'laporan_realisasi';

    public function label(): string
    {
        return match ($this) {
            self::Dashboard => 'Dashboard',
            self::InputDPA => 'Input DPA',
            self::InputRealisasiBelanja => 'Input Realisasi Belanja',
            self::RiwayatTransaksi => 'Riwayat Transaksi',
            self::LaporanRealisasi => 'Laporan Realisasi',
        };
    }
}
