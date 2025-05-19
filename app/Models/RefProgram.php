<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefProgram extends Model
{
    protected $table = 'ref_program';
    protected $primaryKey = 'kode';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['kode', 'nama', 'kode_bidang'];

    public function bidang()
    {
        return $this->belongsTo(RefBidang::class, 'kode_bidang', 'kode');
    }

    public function kegiatan()
    {
        return $this->hasMany(RefKegiatan::class, 'kode_program', 'kode');
    }
}
