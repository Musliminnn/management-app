<?php

namespace App\Imports;

use App\Models\RefUrusan;
use App\Models\RefBidang;
use App\Models\RefProgram;
use App\Models\RefKegiatan;
use App\Models\RefSubKegiatan;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Illuminate\Contracts\Queue\ShouldQueue;

class SubKegiatanImport implements ToModel, WithHeadingRow, WithChunkReading, ShouldQueue
{
    public function model(array $row)
    {
        // Simpan Urusan
        RefUrusan::firstOrCreate(
            ['kode' => $row['kode_urusan']],
            ['nama' => $row['nama_urusan']]
        );

        // Simpan Bidang
        RefBidang::firstOrCreate(
            ['kode' => $row['kode_bidang_urusan']],
            [
                'nama' => $row['nama_bidang_urusan'],
                'kode_urusan' => $row['kode_urusan'],
            ]
        );

        // Simpan Program
        RefProgram::firstOrCreate(
            ['kode' => $row['kode_program']],
            [
                'nama' => $row['nama_program'],
                'kode_bidang' => $row['kode_bidang_urusan'],
            ]
        );

        // Simpan Kegiatan
        RefKegiatan::firstOrCreate(
            ['kode' => $row['kode_kegiatan']],
            [
                'nama' => $row['nama_kegiatan'],
                'kode_program' => $row['kode_program'],
            ]
        );

        // Simpan Sub Kegiatan
        RefSubKegiatan::firstOrCreate(
            ['kode' => $row['kode_sub_kegiatan']],
            [
                'nama' => $row['nama_sub_kegiatan'],
                'kode_kegiatan' => $row['kode_kegiatan'],
            ]
        );
    }

    public function chunkSize(): int
    {
        return 500; // Aman untuk RAM kecil, efisien untuk queue
    }
}
