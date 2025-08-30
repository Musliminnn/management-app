<?php

namespace App\Http\Controllers;

use App\Models\RealisasiBelanja;
use App\Models\RefKegiatan;
use App\Models\RefSubKegiatan;
use App\Models\RefAkun;
use App\Models\TrxBelanja;
use App\Http\Requests\StoreRealisasiBelanjaRequest;
use App\Http\Requests\UpdateRealisasiBelanjaRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class RealisasiBelanjaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $realisasiBelanja = RealisasiBelanja::with(['kegiatan', 'subKegiatan', 'akun', 'user'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('RealisasiBelanja/Index', [
            'realisasiBelanja' => $realisasiBelanja
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $kegiatan = RefKegiatan::all();
        $subKegiatan = RefSubKegiatan::all();
        $akun = RefAkun::all();
        $trxBelanja = TrxBelanja::all();

        return Inertia::render('RealisasiBelanja/Create', [
            'kegiatan' => $kegiatan,
            'subKegiatan' => $subKegiatan,
            'akun' => $akun,
            'trxBelanja' => $trxBelanja
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreRealisasiBelanjaRequest $request)
    {
        $validatedData = $request->validated();
        $validatedData['user_id'] = Auth::id();

        RealisasiBelanja::create($validatedData);

        return redirect()->route('realisasi-belanja.index')
            ->with('success', 'Data realisasi belanja berhasil ditambahkan.');
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $realisasiBelanja = RealisasiBelanja::with(['kegiatan', 'subKegiatan', 'akun', 'user'])->findOrFail($id);

        return Inertia::render('RealisasiBelanja/Show', [
            'realisasiBelanja' => $realisasiBelanja
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $realisasiBelanja = RealisasiBelanja::findOrFail($id);
        $kegiatan = RefKegiatan::all();
        $subKegiatan = RefSubKegiatan::all();
        $akun = RefAkun::all();
        $trxBelanja = TrxBelanja::all();

        return Inertia::render('RealisasiBelanja/Edit', [
            'realisasiBelanja' => $realisasiBelanja,
            'kegiatan' => $kegiatan,
            'subKegiatan' => $subKegiatan,
            'akun' => $akun,
            'trxBelanja' => $trxBelanja
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateRealisasiBelanjaRequest $request, string $id)
    {
        $realisasiBelanja = RealisasiBelanja::findOrFail($id);
        $validatedData = $request->validated();

        $realisasiBelanja->update($validatedData);

        return redirect()->route('realisasi-belanja.index')
            ->with('success', 'Data realisasi belanja berhasil diperbarui.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $realisasiBelanja = RealisasiBelanja::findOrFail($id);
        $realisasiBelanja->delete();

        return redirect()->route('realisasi-belanja.index')
            ->with('success', 'Data realisasi belanja berhasil dihapus.');
    }

    /**
     * Get sub kegiatan by kegiatan code
     */
    public function getSubKegiatan($kodeKegiatan)
    {
        $subKegiatan = RefSubKegiatan::where('kode_kegiatan', $kodeKegiatan)->get();
        return response()->json($subKegiatan);
    }

    /**
     * Get TrxBelanja data for dropdowns
     */
    public function getTrxBelanjaData($kodeAkun)
    {
        $trxBelanja = TrxBelanja::where('kode_akun', $kodeAkun)->get();
        return response()->json($trxBelanja);
    }
}
