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
        Schema::create('realisasi_belanja', function (Blueprint $table) {
            $table->id();
            $table->date('tanggal');
            $table->string('kode_kegiatan');
            $table->string('kode_sub_kegiatan');
            $table->string('kode_akun');
            $table->string('kelompok_belanja');
            $table->string('keterangan_belanja');
            $table->string('sumber_dana');
            $table->string('nama_standar_harga');
            $table->text('spesifikasi');
            $table->decimal('koefisien', 10, 2);
            $table->decimal('harga_satuan', 15, 2);
            $table->decimal('realisasi', 15, 2);
            $table->text('tujuan_pembayaran');
            $table->unsignedBigInteger('user_id');
            $table->timestamps();

            // Foreign key constraints
            $table->foreign('kode_kegiatan')->references('kode')->on('ref_kegiatan')->onDelete('cascade');
            $table->foreign('kode_sub_kegiatan')->references('kode')->on('ref_sub_kegiatan')->onDelete('cascade');
            $table->foreign('kode_akun')->references('kode')->on('ref_akun')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('realisasi_belanja');
    }
};
