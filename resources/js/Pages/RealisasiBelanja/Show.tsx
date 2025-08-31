import { ParentLayout } from '@/Layouts/MainLayout';
import { formatCurrency } from '@/helper/currency';
import { Head, Link } from '@inertiajs/react';

interface RealisasiBelanjaData {
    id: number;
    tanggal: string;
    kode_kegiatan: string;
    kode_sub_kegiatan: string;
    kode_akun: string;
    kelompok_belanja: string;
    keterangan_belanja: string;
    sumber_dana: string;
    nama_standar_harga: string;
    spesifikasi: string;
    koefisien: number;
    harga_satuan: number;
    realisasi: number;
    tujuan_pembayaran: string;
    user_id: number;
    created_at: string;
    updated_at: string;
    kegiatan?: { kode: string; nama: string };
    subKegiatan?: { kode: string; nama: string };
    akun?: { kode: string; nama: string };
    user?: { id: number; name: string };
}

interface Props {
    realisasiBelanja: RealisasiBelanjaData;
}

export default function Show({ realisasiBelanja }: Props) {
    const totalHarga =
        realisasiBelanja.koefisien * realisasiBelanja.harga_satuan;

    return (
        <ParentLayout>
            <Head title={`Detail Realisasi Belanja - ${realisasiBelanja.id}`} />

            <div className="mx-auto max-w-4xl p-6">
                <div className="rounded-lg border border-gray-100 bg-white shadow-md">
                    <div className="rounded-t-lg bg-gradient-to-r from-main to-main/90 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Detail Realisasi Belanja
                                </h2>
                                <p className="mt-1 text-sm text-white/90">
                                    ID: {realisasiBelanja.id} | Tanggal:{' '}
                                    {new Date(
                                        realisasiBelanja.tanggal,
                                    ).toLocaleDateString('id-ID')}
                                </p>
                            </div>
                            <div className="flex space-x-2">
                                <Link
                                    href={`/realisasi-belanja/${realisasiBelanja.id}/edit`}
                                    className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-white/20"
                                >
                                    Edit
                                </Link>
                                <Link
                                    href="/realisasi-belanja"
                                    className="rounded-lg border border-white/40 bg-white/20 px-4 py-2 font-medium text-white transition-all duration-200 hover:bg-white/30"
                                >
                                    Kembali
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Informasi Kegiatan */}
                            <div className="space-y-4">
                                <h3 className="border-b border-main/20 pb-2 text-lg font-medium text-main">
                                    Informasi Kegiatan
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Kegiatan
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {realisasiBelanja.kegiatan
                                            ? `${realisasiBelanja.kegiatan.kode} - ${realisasiBelanja.kegiatan.nama}`
                                            : realisasiBelanja.kode_kegiatan}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Sub Kegiatan
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {realisasiBelanja.subKegiatan
                                            ? `${realisasiBelanja.subKegiatan.kode} - ${realisasiBelanja.subKegiatan.nama}`
                                            : realisasiBelanja.kode_sub_kegiatan}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Akun
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {realisasiBelanja.akun
                                            ? `${realisasiBelanja.akun.kode} - ${realisasiBelanja.akun.nama}`
                                            : realisasiBelanja.kode_akun}
                                    </p>
                                </div>
                            </div>

                            {/* Informasi Belanja */}
                            <div className="space-y-4">
                                <h3 className="border-b border-main/20 pb-2 text-lg font-medium text-main">
                                    Detail Belanja
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Kelompok Belanja
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {realisasiBelanja.kelompok_belanja}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Keterangan Belanja
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {realisasiBelanja.keterangan_belanja}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Sumber Dana
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {realisasiBelanja.sumber_dana}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Informasi Standar Harga */}
                        <div className="mt-8">
                            <h3 className="mb-4 border-b border-main/20 pb-2 text-lg font-medium text-main">
                                Standar Harga & Spesifikasi
                            </h3>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Nama Standar Harga
                                    </label>
                                    <p className="mt-1 text-sm text-gray-900">
                                        {realisasiBelanja.nama_standar_harga}
                                    </p>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Spesifikasi
                                    </label>
                                    <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">
                                        {realisasiBelanja.spesifikasi}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Perhitungan */}
                        <div className="mt-8">
                            <h3 className="mb-4 border-b border-main/20 pb-2 text-lg font-medium text-main">
                                Perhitungan Harga
                            </h3>

                            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Koefisien
                                    </label>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                        {realisasiBelanja.koefisien.toLocaleString(
                                            'id-ID',
                                            {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                            },
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Harga Satuan
                                    </label>
                                    <p className="mt-1 text-lg font-semibold text-gray-900">
                                        {formatCurrency(
                                            realisasiBelanja.harga_satuan,
                                        )}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Total Harga
                                    </label>
                                    <p className="mt-1 text-lg font-semibold text-blue-600">
                                        {formatCurrency(totalHarga)}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700">
                                        Realisasi
                                    </label>
                                    <p className="mt-1 text-lg font-semibold text-green-600">
                                        {formatCurrency(
                                            realisasiBelanja.realisasi,
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar Realisasi */}
                            <div className="mt-4">
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Persentase Realisasi
                                </label>
                                <div className="h-2.5 w-full rounded-full bg-gray-200">
                                    <div
                                        className="h-2.5 rounded-full bg-green-600"
                                        style={{
                                            width: `${Math.min((realisasiBelanja.realisasi / totalHarga) * 100, 100)}%`,
                                        }}
                                    ></div>
                                </div>
                                <p className="mt-1 text-sm text-gray-600">
                                    {(
                                        (realisasiBelanja.realisasi /
                                            totalHarga) *
                                        100
                                    ).toFixed(2)}
                                    % dari total anggaran
                                </p>
                            </div>
                        </div>

                        {/* Tujuan Pembayaran */}
                        <div className="mt-8">
                            <h3 className="mb-4 border-b border-main/20 pb-2 text-lg font-medium text-main">
                                Tujuan Pembayaran
                            </h3>
                            <p className="whitespace-pre-wrap rounded-lg border border-main/10 bg-main/5 p-4 text-sm text-gray-900">
                                {realisasiBelanja.tujuan_pembayaran}
                            </p>
                        </div>

                        {/* Informasi Tambahan */}
                        <div className="mt-8 border-t border-gray-200 pt-6">
                            <div className="grid grid-cols-1 gap-6 text-sm text-gray-600 md:grid-cols-3">
                                <div>
                                    <label className="block font-medium">
                                        Dibuat oleh
                                    </label>
                                    <p>
                                        {realisasiBelanja.user?.name ||
                                            'Unknown'}
                                    </p>
                                </div>
                                <div>
                                    <label className="block font-medium">
                                        Tanggal Dibuat
                                    </label>
                                    <p>
                                        {new Date(
                                            realisasiBelanja.created_at,
                                        ).toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <div>
                                    <label className="block font-medium">
                                        Terakhir Diperbarui
                                    </label>
                                    <p>
                                        {new Date(
                                            realisasiBelanja.updated_at,
                                        ).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ParentLayout>
    );
}
