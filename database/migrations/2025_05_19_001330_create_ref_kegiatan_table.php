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
        Schema::create('ref_kegiatan', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->string('kode', 100)->primary();
            $table->string('nama', 200);

            $table->string('kode_program', 100);
            $table->foreign('kode_program')
                ->references('kode')->on('ref_program')
                ->onUpdate('cascade')
                ->onDelete('restrict');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ref_kegiatan');
    }
};
