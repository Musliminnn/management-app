<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefStandarHarga extends Model
{
    protected $table = 'ref_standar_harga';
    protected $primaryKey = 'kode';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['kode', 'nama'];

    public function belanja()
    {
        return $this->hasMany(TrxBelanja::class, 'kode_standar_harga', 'kode');
    }
}
