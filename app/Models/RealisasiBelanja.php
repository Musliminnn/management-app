<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RealisasiBelanja extends Model
{
    protected $table = 'realisasi_belanja';

    protected $fillable = [
        'tanggal',
        'kode_kegiatan',
        'kode_sub_kegiatan',
        'kode_akun',
        'kelompok_belanja',
        'keterangan_belanja',
        'sumber_dana',
        'nama_standar_harga',
        'spesifikasi',
        'koefisien',
        'harga_satuan',
        'realisasi',
        'tujuan_pembayaran',
        'user_id'
    ];

    protected $casts = [
        'tanggal' => 'date',
        'koefisien' => 'decimal:2',
        'harga_satuan' => 'decimal:2',
        'realisasi' => 'decimal:2',
    ];

    public function kegiatan(): BelongsTo
    {
        return $this->belongsTo(RefKegiatan::class, 'kode_kegiatan', 'kode');
    }

    public function subKegiatan(): BelongsTo
    {
        return $this->belongsTo(RefSubKegiatan::class, 'kode_sub_kegiatan', 'kode');
    }

    public function akun(): BelongsTo
    {
        return $this->belongsTo(RefAkun::class, 'kode_akun', 'kode');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    // Helper method untuk mendapatkan total perhitungan
    public function getTotalHargaAttribute()
    {
        return $this->koefisien * $this->harga_satuan;
    }
}
