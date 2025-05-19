<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefSubKegiatan extends Model
{
    protected $table = 'ref_sub_kegiatan';
    protected $primaryKey = 'kode';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['kode', 'nama', 'kode_kegiatan'];

    public function kegiatan()
    {
        return $this->belongsTo(RefKegiatan::class, 'kode_kegiatan', 'kode');
    }
}
