<?php
namespace App\Imports;

use App\Models\RefUrusan;
use App\Models\RefBidang;
use App\Models\RefProgram;
use App\Models\RefKegiatan;
use App\Models\RefSubKegiatan;
use Maatwebsite\Excel\Row;
use Maatwebsite\Excel\Concerns\OnEachRow;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class SubKegiatanImport implements OnEachRow, WithHeadingRow
{
    public function onRow(Row $row)
    {
        $r = $row->toArray();

        // URUSAN
        RefUrusan::firstOrCreate([
            'kode' => $r['kode_urusan'],
        ], [
            'nama' => $r['nama_urusan'],
        ]);

        // BIDANG
        RefBidang::firstOrCreate([
            'kode' => $r['kode_bidang_urusan'],
        ], [
            'nama' => $r['nama_bidang_urusan'],
            'kode_urusan' => $r['kode_urusan'],
        ]);

        // PROGRAM
        RefProgram::firstOrCreate([
            'kode' => $r['kode_program'],
        ], [
            'nama' => $r['nama_program'],
            'kode_bidang' => $r['kode_bidang_urusan'],
        ]);

        // KEGIATAN
        RefKegiatan::firstOrCreate([
            'kode' => $r['kode_kegiatan'],
        ], [
            'nama' => $r['nama_kegiatan'],
            'kode_program' => $r['kode_program'],
        ]);

        // SUB KEGIATAN
        RefSubKegiatan::firstOrCreate([
            'kode' => $r['kode_sub_kegiatan'],
        ], [
            'nama' => $r['nama_sub_kegiatan'],
            'kode_kegiatan' => $r['kode_kegiatan'],
        ]);
    }
}
