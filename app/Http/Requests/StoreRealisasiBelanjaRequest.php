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
            // Base data rules
            'tanggal' => 'required|date',
            'kode_kegiatan' => 'required|exists:ref_kegiatan,kode',
            'kode_sub_kegiatan' => 'required|exists:ref_sub_kegiatan,kode',
            'kode_akun' => 'required|exists:ref_akun,kode',
            'kelompok_belanja' => 'required|string|max:255',
            'keterangan_belanja' => 'required|string|max:255',
            'sumber_dana' => 'required|string|max:255',
            'tujuan_pembayaran' => 'required|string',

            // Bulk items rules
            'bulk_items' => 'required|array|min:1',
            'bulk_items.*.nama_standar_harga' => 'required|string|max:255',
            'bulk_items.*.spesifikasi' => 'required|string',
            'bulk_items.*.koefisien' => 'required|numeric|min:0',
            'bulk_items.*.harga_satuan' => 'required|numeric|min:0',
            'bulk_items.*.realisasi' => 'required|numeric|min:0',
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
            // Base field messages
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
            'tujuan_pembayaran.required' => 'Tujuan pembayaran harus diisi.',

            // Bulk submission messages
            'bulk_items.required' => 'Data realisasi tidak boleh kosong.',
            'bulk_items.array' => 'Format data realisasi tidak valid.',
            'bulk_items.min' => 'Minimal harus ada satu data realisasi.',
            'bulk_items.*.nama_standar_harga.required' => 'Nama standar harga harus diisi pada semua item.',
            'bulk_items.*.spesifikasi.required' => 'Spesifikasi harus diisi pada semua item.',
            'bulk_items.*.koefisien.required' => 'Koefisien realisasi harus diisi pada semua item.',
            'bulk_items.*.koefisien.numeric' => 'Koefisien realisasi harus berupa angka pada semua item.',
            'bulk_items.*.koefisien.min' => 'Koefisien realisasi tidak boleh negatif pada semua item.',
            'bulk_items.*.harga_satuan.required' => 'Harga satuan realisasi harus diisi pada semua item.',
            'bulk_items.*.harga_satuan.numeric' => 'Harga satuan realisasi harus berupa angka pada semua item.',
            'bulk_items.*.harga_satuan.min' => 'Harga satuan realisasi tidak boleh negatif pada semua item.',
            'bulk_items.*.realisasi.required' => 'Realisasi harus diisi pada semua item.',
            'bulk_items.*.realisasi.numeric' => 'Realisasi harus berupa angka pada semua item.',
            'bulk_items.*.realisasi.min' => 'Realisasi tidak boleh negatif pada semua item.',
        ];
    }
}
