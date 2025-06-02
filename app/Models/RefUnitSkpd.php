<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefUnitSkpd extends Model
{
    protected $table = 'ref_unit_skpd';
    protected $primaryKey = 'kode';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['kode', 'nama', 'kode_skpd'];

    public function skpd()
    {
        return $this->belongsTo(RefSkpd::class, 'kode_skpd', 'kode');
    }

    public function belanja()
    {
        return $this->hasMany(TrxBelanja::class, 'kode_unit_skpd', 'kode');
    }
}
