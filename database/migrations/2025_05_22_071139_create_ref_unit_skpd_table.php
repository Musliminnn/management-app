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
        Schema::create('ref_unit_skpd', function (Blueprint $table) {
            $table->engine = 'InnoDB';
            $table->string('kode', 100)->primary();
            $table->string('nama', 200);

            $table->string('kode_skpd', 100);
            $table->foreign('kode_skpd')->references('kode')->on('ref_skpd')
                ->onUpdate('cascade')->onDelete('restrict');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ref_unit_skpd');
    }
};
