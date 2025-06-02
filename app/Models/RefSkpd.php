<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefSkpd extends Model
{
    protected $table = 'ref_skpd';
    protected $primaryKey = 'kode';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['kode', 'nama'];

    public function unitSkpd()
    {
        return $this->hasMany(RefUnitSkpd::class, 'kode_skpd', 'kode');
    }
}
