import CustomButton from '@/Components/CustomButton';
import { ParentLayout } from '@/Layouts/MainLayout';
import { useRealisasiBelanjaStore } from '@/stores/realisasiBelanjaStore';
import { Head, router } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';

interface DropdownOption {
    kode: string;
    nama: string;
    kelompok_belanja?: string;
    keterangan_belanja?: string;
    sumber_dana?: string;
}

interface TrxBelanjaOption {
    id: number;
    nama: string;
    spesifikasi: string;
    koefisien: number;
    harga_satuan: number;
    kode_akun: string;
}

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
}

interface Props {
    realisasiBelanja: RealisasiBelanjaData;
    kegiatan: DropdownOption[];
    subKegiatan: DropdownOption[];
    akun: DropdownOption[];
    trxBelanja: TrxBelanjaOption[];
}

export default function Edit({
    realisasiBelanja,
    kegiatan,
    subKegiatan,
    akun,
    trxBelanja,
}: Props) {
    const {
        formData,
        setFormData,
        isSubmitting,
        setSubmitting,
        errors,
        setErrors,
        clearErrors,
        getTotalHarga,
        isFormValid,
    } = useRealisasiBelanjaStore();

    const [filteredSubKegiatan, setFilteredSubKegiatan] = useState<
        DropdownOption[]
    >([]);
    const [filteredTrxBelanja, setFilteredTrxBelanja] = useState<
        TrxBelanjaOption[]
    >([]);

    // Initialize form with existing data
    useEffect(() => {
        setFormData({
            tanggal: realisasiBelanja.tanggal,
            kode_kegiatan: realisasiBelanja.kode_kegiatan,
            kode_sub_kegiatan: realisasiBelanja.kode_sub_kegiatan,
            kode_akun: realisasiBelanja.kode_akun,
            kelompok_belanja: realisasiBelanja.kelompok_belanja,
            keterangan_belanja: realisasiBelanja.keterangan_belanja,
            sumber_dana: realisasiBelanja.sumber_dana,
            nama_standar_harga: realisasiBelanja.nama_standar_harga,
            spesifikasi: realisasiBelanja.spesifikasi,
            koefisien: realisasiBelanja.koefisien,
            harga_satuan: realisasiBelanja.harga_satuan,
            realisasi: realisasiBelanja.realisasi,
            tujuan_pembayaran: realisasiBelanja.tujuan_pembayaran,
        });
    }, [realisasiBelanja]);

    // Filter sub kegiatan based on selected kegiatan
    useEffect(() => {
        if (formData.kode_kegiatan) {
            const filtered = subKegiatan.filter((item) =>
                item.kode.startsWith(formData.kode_kegiatan),
            );
            setFilteredSubKegiatan(filtered);
        } else {
            setFilteredSubKegiatan([]);
        }
    }, [formData.kode_kegiatan, subKegiatan]);

    // Filter trx belanja based on selected akun
    useEffect(() => {
        if (formData.kode_akun) {
            const filtered = trxBelanja.filter(
                (item) => item.kode_akun === formData.kode_akun,
            );
            setFilteredTrxBelanja(filtered);
        } else {
            setFilteredTrxBelanja([]);
        }
    }, [formData.kode_akun, trxBelanja]);

    // Auto-fill data from selected akun
    useEffect(() => {
        if (formData.kode_akun) {
            const selectedAkun = akun.find(
                (item) => item.kode === formData.kode_akun,
            );
            if (selectedAkun) {
                setFormData({
                    kelompok_belanja: selectedAkun.kelompok_belanja || '',
                    keterangan_belanja: selectedAkun.keterangan_belanja || '',
                    sumber_dana: selectedAkun.sumber_dana || '',
                });
            }
        }
    }, [formData.kode_akun, akun]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isFormValid()) {
            setErrors({ form: 'Mohon lengkapi semua field yang diperlukan' });
            return;
        }

        setSubmitting(true);
        clearErrors();

        try {
            router.put(
                `/realisasi-belanja/${realisasiBelanja.id}`,
                formData as any,
                {
                    onSuccess: () => {
                        router.visit('/realisasi-belanja');
                    },
                    onError: (errors) => {
                        setErrors(errors as Record<string, string>);
                    },
                    onFinish: () => {
                        setSubmitting(false);
                    },
                },
            );
        } catch (error) {
            console.error('Submit error:', error);
            setSubmitting(false);
        }
    };

    const handleTrxBelanjaSelect = (selectedTrx: TrxBelanjaOption) => {
        setFormData({
            nama_standar_harga: selectedTrx.nama,
            spesifikasi: selectedTrx.spesifikasi,
            koefisien: selectedTrx.koefisien,
            harga_satuan: selectedTrx.harga_satuan,
        });
    };

    return (
        <ParentLayout>
            <Head title={`Edit Realisasi Belanja - ${realisasiBelanja.id}`} />

            <div className="mx-auto max-w-4xl p-6">
                <div className="rounded-lg bg-white shadow-md">
                    <div className="border-b border-gray-200 p-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            Edit Realisasi Belanja
                        </h2>
                        <p className="mt-1 text-sm text-gray-600">
                            Update data realisasi belanja ID:{' '}
                            {realisasiBelanja.id}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        {errors.form && (
                            <div className="rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                                {errors.form}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Tanggal */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Tanggal *
                                </label>
                                <input
                                    type="date"
                                    value={formData.tanggal}
                                    onChange={(e) =>
                                        setFormData({ tanggal: e.target.value })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.tanggal && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.tanggal}
                                    </p>
                                )}
                            </div>

                            {/* Kegiatan */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Kegiatan *
                                </label>
                                <select
                                    value={formData.kode_kegiatan}
                                    onChange={(e) => {
                                        setFormData({
                                            kode_kegiatan: e.target.value,
                                            kode_sub_kegiatan: '', // Reset sub kegiatan
                                        });
                                    }}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Pilih Kegiatan</option>
                                    {kegiatan.map((item) => (
                                        <option
                                            key={item.kode}
                                            value={item.kode}
                                        >
                                            {item.kode} - {item.nama}
                                        </option>
                                    ))}
                                </select>
                                {errors.kode_kegiatan && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.kode_kegiatan}
                                    </p>
                                )}
                            </div>

                            {/* Sub Kegiatan */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Sub Kegiatan *
                                </label>
                                <select
                                    value={formData.kode_sub_kegiatan}
                                    onChange={(e) =>
                                        setFormData({
                                            kode_sub_kegiatan: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={!formData.kode_kegiatan}
                                >
                                    <option value="">Pilih Sub Kegiatan</option>
                                    {filteredSubKegiatan.map((item) => (
                                        <option
                                            key={item.kode}
                                            value={item.kode}
                                        >
                                            {item.kode} - {item.nama}
                                        </option>
                                    ))}
                                </select>
                                {errors.kode_sub_kegiatan && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.kode_sub_kegiatan}
                                    </p>
                                )}
                            </div>

                            {/* Akun */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Akun *
                                </label>
                                <select
                                    value={formData.kode_akun}
                                    onChange={(e) =>
                                        setFormData({
                                            kode_akun: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                >
                                    <option value="">Pilih Akun</option>
                                    {akun.map((item) => (
                                        <option
                                            key={item.kode}
                                            value={item.kode}
                                        >
                                            {item.kode} - {item.nama}
                                        </option>
                                    ))}
                                </select>
                                {errors.kode_akun && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.kode_akun}
                                    </p>
                                )}
                            </div>

                            {/* Kelompok Belanja */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Kelompok Belanja *
                                </label>
                                <input
                                    type="text"
                                    value={formData.kelompok_belanja}
                                    onChange={(e) =>
                                        setFormData({
                                            kelompok_belanja: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.kelompok_belanja && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.kelompok_belanja}
                                    </p>
                                )}
                            </div>

                            {/* Keterangan Belanja */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Keterangan Belanja *
                                </label>
                                <input
                                    type="text"
                                    value={formData.keterangan_belanja}
                                    onChange={(e) =>
                                        setFormData({
                                            keterangan_belanja: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.keterangan_belanja && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.keterangan_belanja}
                                    </p>
                                )}
                            </div>

                            {/* Sumber Dana */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Sumber Dana *
                                </label>
                                <input
                                    type="text"
                                    value={formData.sumber_dana}
                                    onChange={(e) =>
                                        setFormData({
                                            sumber_dana: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.sumber_dana && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.sumber_dana}
                                    </p>
                                )}
                            </div>

                            {/* Nama Standar Harga */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Nama Standar Harga *
                                </label>
                                <select
                                    value={formData.nama_standar_harga}
                                    onChange={(e) => {
                                        const selectedTrx =
                                            filteredTrxBelanja.find(
                                                (item) =>
                                                    item.nama ===
                                                    e.target.value,
                                            );
                                        if (selectedTrx) {
                                            handleTrxBelanjaSelect(selectedTrx);
                                        }
                                    }}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={!formData.kode_akun}
                                >
                                    <option value="">
                                        Pilih Standar Harga
                                    </option>
                                    {filteredTrxBelanja.map((item) => (
                                        <option key={item.id} value={item.nama}>
                                            {item.nama}
                                        </option>
                                    ))}
                                </select>
                                {errors.nama_standar_harga && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.nama_standar_harga}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Spesifikasi */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Spesifikasi *
                            </label>
                            <textarea
                                value={formData.spesifikasi}
                                onChange={(e) =>
                                    setFormData({ spesifikasi: e.target.value })
                                }
                                rows={3}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            {errors.spesifikasi && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.spesifikasi}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Koefisien */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Koefisien *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.koefisien}
                                    onChange={(e) =>
                                        setFormData({
                                            koefisien:
                                                parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.koefisien && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.koefisien}
                                    </p>
                                )}
                            </div>

                            {/* Harga Satuan */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Harga Satuan *
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={formData.harga_satuan}
                                    onChange={(e) =>
                                        setFormData({
                                            harga_satuan:
                                                parseFloat(e.target.value) || 0,
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                                {errors.harga_satuan && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.harga_satuan}
                                    </p>
                                )}
                            </div>

                            {/* Total Harga (readonly) */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Total Harga
                                </label>
                                <input
                                    type="text"
                                    value={new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                    }).format(getTotalHarga())}
                                    readOnly
                                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
                                />
                            </div>
                        </div>

                        {/* Realisasi */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Realisasi *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.realisasi}
                                onChange={(e) =>
                                    setFormData({
                                        realisasi:
                                            parseFloat(e.target.value) || 0,
                                    })
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            {errors.realisasi && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.realisasi}
                                </p>
                            )}
                        </div>

                        {/* Tujuan Pembayaran */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-700">
                                Tujuan Pembayaran *
                            </label>
                            <textarea
                                value={formData.tujuan_pembayaran}
                                onChange={(e) =>
                                    setFormData({
                                        tujuan_pembayaran: e.target.value,
                                    })
                                }
                                rows={3}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                            {errors.tujuan_pembayaran && (
                                <p className="mt-1 text-sm text-red-600">
                                    {errors.tujuan_pembayaran}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-3 border-t border-gray-200 pt-6">
                            <CustomButton
                                type="button"
                                variant="outlined"
                                onClick={() =>
                                    router.visit('/realisasi-belanja')
                                }
                                disabled={isSubmitting}
                            >
                                Batal
                            </CustomButton>
                            <CustomButton
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting || !isFormValid()}
                            >
                                {isSubmitting ? 'Menyimpan...' : 'Update'}
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </div>
        </ParentLayout>
    );
}
