<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('trx_belanja', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->id();

            $table->string('kode_sub_kegiatan', 100);
            $table->foreign('kode_sub_kegiatan')->references('kode')->on('ref_sub_kegiatan')
                ->onUpdate('cascade')->onDelete('restrict');

            $table->string('kode_unit_skpd', 100);
            $table->foreign('kode_unit_skpd')->references('kode')->on('ref_unit_skpd')
                ->onUpdate('cascade')->onDelete('restrict');

            $table->string('kode_akun', 100);
            $table->foreign('kode_akun')->references('kode')->on('ref_akun')
                ->onUpdate('cascade')->onDelete('restrict');

            $table->string('kode', 100);
            $table->string('nama', 200);
            $table->string('paket')->nullable();
            $table->string('keterangan_belanja')->nullable();
            $table->string('sumber_dana')->nullable();
            $table->string('nama_penerima')->nullable();
            $table->text('spesifikasi')->nullable();
            $table->string('koefisien')->nullable();
            $table->decimal('harga_satuan', 20, 2)->nullable();
            $table->decimal('total_harga', 20, 2)->nullable();
            $table->string('unit_kerja')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('trx_belanja');
    }
};
