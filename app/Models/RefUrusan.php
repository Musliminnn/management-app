<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RefUrusan extends Model
{
    protected $table = 'ref_urusan';
    protected $primaryKey = 'kode';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = ['kode', 'nama'];

    public function bidang()
    {
        return $this->hasMany(RefBidang::class, 'kode_urusan', 'kode');
    }
}
