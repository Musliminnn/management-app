<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TrxBelanja extends Model
{
    protected $table = 'trx_belanja';

    protected $fillable = [
        'kode_sub_kegiatan',
        'kode_unit_skpd',
        'kode_akun',
        'kode_standar_harga',
        'paket',
        'keterangan_belanja',
        'sumber_dana',
        'nama_penerima',
        'spesifikasi',
        'koefisien',
        'harga_satuan',
        'total_harga',
        'unit_kerja'
    ];

    public function subKegiatan()
    {
        return $this->belongsTo(RefSubKegiatan::class, 'kode_sub_kegiatan', 'kode');
    }

    public function unitSkpd()
    {
        return $this->belongsTo(RefUnitSkpd::class, 'kode_unit_skpd', 'kode');
    }

    public function akun()
    {
        return $this->belongsTo(RefAkun::class, 'kode_akun', 'kode');
    }

    public function standarHarga()
    {
        return $this->belongsTo(RefStandarHarga::class, 'kode_standar_harga', 'kode');
    }
}
