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
        Schema::create('ref_akun', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->string('kode', 100)->primary();
            $table->string('nama', 200);
            $table->string('paket')->nullable();
            $table->string('keterangan_belanja')->nullable();
            $table->string('sumber_dana')->nullable();
            $table->string('nama_penerima')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ref_akun');
    }
};
