<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefBidang extends Model
{
    protected $table = 'ref_bidang';
    protected $primaryKey = 'kode';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['kode', 'nama', 'kode_urusan'];

    public function urusan()
    {
        return $this->belongsTo(RefUrusan::class, 'kode_urusan', 'kode');
    }

    public function program()
    {
        return $this->hasMany(RefProgram::class, 'kode_bidang', 'kode');
    }
}
