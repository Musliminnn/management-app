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
        Schema::create('ref_program', function (Blueprint $table) {
            $table->string('kode', 50)->primary();
            $table->string('nama', 100);

            $table->string('kode_bidang', 50);
            $table->foreign('kode_bidang')
                ->references('kode')->on('ref_bidang')
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
        Schema::dropIfExists('ref_program');
    }
};
