<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefAkun extends Model
{
    protected $table = 'ref_akun';
    protected $primaryKey = 'kode';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'kode',
        'nama',
    ];

    public function belanja()
    {
        return $this->hasMany(TrxBelanja::class, 'kode_akun', 'kode');
    }
}
