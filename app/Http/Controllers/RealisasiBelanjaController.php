<?php

namespace App\Http\Controllers;

use App\Enums\MenuEnum;
use App\Enums\PermissionEnum;
use App\Models\RealisasiBelanja;
use App\Models\RefAkun;
use App\Models\RefKegiatan;
use App\Models\RefSubKegiatan;
use App\Models\TrxBelanja;
use App\Http\Requests\StoreRealisasiBelanjaRequest;
use App\Http\Requests\UpdateRealisasiBelanjaRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RealisasiBelanjaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $realisasiBelanja = RealisasiBelanja::with(['kegiatan', 'subKegiatan', 'akun', 'user', 'validator'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return Inertia::render('RealisasiBelanja/Index', [
            'realisasiBelanja' => $realisasiBelanja,
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

        // Handle bulk submission only
        $bulkItems = $request->input('bulk_items');
        $baseData = collect($validatedData)->except(['bulk_items'])->toArray();

        $createdItems = [];

        DB::transaction(function () use ($bulkItems, $baseData, &$createdItems) {
            foreach ($bulkItems as $item) {
                $itemData = array_merge($baseData, [
                    'nama_standar_harga' => $item['nama_standar_harga'],
                    'spesifikasi' => $item['spesifikasi'],
                    'koefisien' => $item['koefisien'],
                    'harga_satuan' => $item['harga_satuan'],
                    'realisasi' => $item['realisasi'],
                    'user_id' => Auth::id(),
                ]);

                $createdItems[] = RealisasiBelanja::create($itemData);
            }
        });

        $itemCount = count($createdItems);
        $message = $itemCount === 1
            ? 'Data realisasi belanja berhasil ditambahkan.'
            : "{$itemCount} data realisasi belanja berhasil ditambahkan.";

        return redirect()->route('realisasi-belanja.index')
            ->with('success', $message);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $realisasiBelanja = RealisasiBelanja::with(['kegiatan', 'subKegiatan', 'akun', 'user', 'validator'])->findOrFail($id);

        return Inertia::render('RealisasiBelanja/Show', [
            'realisasiBelanja' => $realisasiBelanja,
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

    /**
     * Get total realisasi for specific spesifikasi
     */
    public function getTotalRealisasiBySpesifikasi(Request $request)
    {
        $request->validate([
            'kode_sub_kegiatan' => 'required',
            'kode_akun' => 'required',
            'kelompok_belanja' => 'required',
            'keterangan_belanja' => 'required',
            'sumber_dana' => 'required',
            'nama_standar_harga' => 'required',
            'spesifikasi' => 'required',
        ]);

        $totalRealisasi = RealisasiBelanja::where([
            'kode_sub_kegiatan' => $request->kode_sub_kegiatan,
            'kode_akun' => $request->kode_akun,
            'kelompok_belanja' => $request->kelompok_belanja,
            'keterangan_belanja' => $request->keterangan_belanja,
            'sumber_dana' => $request->sumber_dana,
            'nama_standar_harga' => $request->nama_standar_harga,
            'spesifikasi' => $request->spesifikasi,
        ])->sum('realisasi');

        return response()->json(['total_realisasi' => $totalRealisasi]);
    }

    /**
     * Validate (approve) a realisasi belanja
     */
    public function validate(string $id)
    {
        $user = Auth::user();

        // Check permission
        if (! $user->hasPermission(MenuEnum::InputRealisasiBelanja, PermissionEnum::Validate)) {
            abort(403, 'Anda tidak memiliki izin untuk memvalidasi data.');
        }

        $realisasiBelanja = RealisasiBelanja::findOrFail($id);

        if (! $realisasiBelanja->isPending()) {
            return back()->with('error', 'Data sudah divalidasi atau ditolak sebelumnya.');
        }

        $realisasiBelanja->validate($user);

        return back()->with('success', 'Data realisasi belanja berhasil divalidasi.');
    }

    /**
     * Reject a realisasi belanja
     */
    public function reject(string $id)
    {
        $user = Auth::user();

        // Check permission
        if (! $user->hasPermission(MenuEnum::InputRealisasiBelanja, PermissionEnum::Validate)) {
            abort(403, 'Anda tidak memiliki izin untuk menolak data.');
        }

        $realisasiBelanja = RealisasiBelanja::findOrFail($id);

        if (! $realisasiBelanja->isPending()) {
            return back()->with('error', 'Data sudah divalidasi atau ditolak sebelumnya.');
        }

        $realisasiBelanja->reject($user);

        return back()->with('success', 'Data realisasi belanja berhasil ditolak.');
    }
}
