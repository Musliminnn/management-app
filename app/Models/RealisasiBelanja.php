<?php

namespace App\Models;

use App\Enums\RealisasiStatusEnum;
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
        'user_id',
        'status',
        'validated_by',
        'validated_at',
    ];

    protected $casts = [
        'tanggal' => 'date',
        'koefisien' => 'decimal:2',
        'harga_satuan' => 'decimal:2',
        'realisasi' => 'decimal:2',
        'status' => RealisasiStatusEnum::class,
        'validated_at' => 'datetime',
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

    public function validator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'validated_by');
    }

    public function getTotalHargaAttribute()
    {
        return $this->koefisien * $this->harga_satuan;
    }

    public function isPending(): bool
    {
        return $this->status === RealisasiStatusEnum::Pending;
    }

    public function isValidated(): bool
    {
        return $this->status === RealisasiStatusEnum::Validated;
    }

    public function isRejected(): bool
    {
        return $this->status === RealisasiStatusEnum::Rejected;
    }

    public function validate(User $user): void
    {
        $this->update([
            'status' => RealisasiStatusEnum::Validated,
            'validated_by' => $user->id,
            'validated_at' => now(),
        ]);
    }

    public function reject(User $user): void
    {
        $this->update([
            'status' => RealisasiStatusEnum::Rejected,
            'validated_by' => $user->id,
            'validated_at' => now(),
        ]);
    }
}
