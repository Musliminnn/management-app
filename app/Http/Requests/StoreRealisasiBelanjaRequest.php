<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreRealisasiBelanjaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // User sudah diverifikasi melalui middleware auth
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'tanggal' => 'required|date',
            'kode_kegiatan' => 'required|exists:ref_kegiatan,kode',
            'kode_sub_kegiatan' => 'required|exists:ref_sub_kegiatan,kode',
            'kode_akun' => 'required|exists:ref_akun,kode',
            'kelompok_belanja' => 'required|string|max:255',
            'keterangan_belanja' => 'required|string|max:255',
            'sumber_dana' => 'required|string|max:255',
            'nama_standar_harga' => 'required|string|max:255',
            'spesifikasi' => 'required|string',
            'koefisien' => 'required|numeric|min:0',
            'harga_satuan' => 'required|numeric|min:0',
            'realisasi' => 'required|numeric|min:0',
            'tujuan_pembayaran' => 'required|string',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'tanggal.required' => 'Tanggal harus diisi.',
            'tanggal.date' => 'Format tanggal tidak valid.',
            'kode_kegiatan.required' => 'Kegiatan harus dipilih.',
            'kode_kegiatan.exists' => 'Kegiatan yang dipilih tidak valid.',
            'kode_sub_kegiatan.required' => 'Sub kegiatan harus dipilih.',
            'kode_sub_kegiatan.exists' => 'Sub kegiatan yang dipilih tidak valid.',
            'kode_akun.required' => 'Akun harus dipilih.',
            'kode_akun.exists' => 'Akun yang dipilih tidak valid.',
            'kelompok_belanja.required' => 'Kelompok belanja harus diisi.',
            'keterangan_belanja.required' => 'Keterangan belanja harus diisi.',
            'sumber_dana.required' => 'Sumber dana harus diisi.',
            'nama_standar_harga.required' => 'Nama standar harga harus diisi.',
            'spesifikasi.required' => 'Spesifikasi harus diisi.',
            'koefisien.required' => 'Koefisien harus diisi.',
            'koefisien.numeric' => 'Koefisien harus berupa angka.',
            'koefisien.min' => 'Koefisien tidak boleh negatif.',
            'harga_satuan.required' => 'Harga satuan harus diisi.',
            'harga_satuan.numeric' => 'Harga satuan harus berupa angka.',
            'harga_satuan.min' => 'Harga satuan tidak boleh negatif.',
            'realisasi.required' => 'Realisasi harus diisi.',
            'realisasi.numeric' => 'Realisasi harus berupa angka.',
            'realisasi.min' => 'Realisasi tidak boleh negatif.',
            'tujuan_pembayaran.required' => 'Tujuan pembayaran harus diisi.',
        ];
    }
}
