<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefKegiatan extends Model
{
    protected $table = 'ref_kegiatan';
    protected $primaryKey = 'kode';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['kode', 'nama', 'kode_program'];

    public function program()
    {
        return $this->belongsTo(RefProgram::class, 'kode_program', 'kode');
    }

    public function subKegiatan()
    {
        return $this->hasMany(RefSubKegiatan::class, 'kode_kegiatan', 'kode');
    }
}
