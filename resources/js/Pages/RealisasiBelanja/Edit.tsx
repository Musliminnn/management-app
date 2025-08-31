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
    paket: string;
    keterangan_belanja: string;
    sumber_dana: string;
    spesifikasi: string;
    koefisien: string;
    harga_satuan: number;
    total_harga: number;
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
    koefisien: string;
    harga_satuan: number;
    total_harga: number;
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

    // Get unique dropdown options from TrxBelanja based on selected akun
    const getUniqueOptions = (field: string) => {
        if (!formData.kode_akun) return [];
        const filtered = trxBelanja.filter(
            (item) => item.kode_akun === formData.kode_akun,
        );
        const unique = [
            ...new Set(
                filtered.map((item) => item[field as keyof TrxBelanjaOption]),
            ),
        ];
        return unique.filter(Boolean);
    };

    // Get keterangan_belanja options based on selected kelompok_belanja
    const getKeteranganBelanjaOptions = () => {
        if (!formData.kode_akun || !formData.kelompok_belanja) return [];
        const filtered = trxBelanja.filter(
            (item) =>
                item.kode_akun === formData.kode_akun &&
                item.paket === formData.kelompok_belanja,
        );
        const unique = [
            ...new Set(filtered.map((item) => item.keterangan_belanja)),
        ];
        return unique.filter(Boolean);
    };

    // Get sumber_dana options based on selected keterangan_belanja
    const getSumberDanaOptions = () => {
        if (
            !formData.kode_akun ||
            !formData.kelompok_belanja ||
            !formData.keterangan_belanja
        )
            return [];
        const filtered = trxBelanja.filter(
            (item) =>
                item.kode_akun === formData.kode_akun &&
                item.paket === formData.kelompok_belanja &&
                item.keterangan_belanja === formData.keterangan_belanja,
        );
        const unique = [...new Set(filtered.map((item) => item.sumber_dana))];
        return unique.filter(Boolean);
    };

    // Get nama_standar_harga options based on selected sumber_dana
    const getNamaStandarHargaOptions = () => {
        if (
            !formData.kode_akun ||
            !formData.kelompok_belanja ||
            !formData.keterangan_belanja ||
            !formData.sumber_dana
        )
            return [];
        const filtered = trxBelanja.filter(
            (item) =>
                item.kode_akun === formData.kode_akun &&
                item.paket === formData.kelompok_belanja &&
                item.keterangan_belanja === formData.keterangan_belanja &&
                item.sumber_dana === formData.sumber_dana,
        );
        return filtered; // Return full objects for nama standar harga
    };

    // Get spesifikasi options based on selected nama_standar_harga
    const getSpesifikasiOptions = () => {
        if (
            !formData.kode_akun ||
            !formData.kelompok_belanja ||
            !formData.keterangan_belanja ||
            !formData.sumber_dana ||
            !formData.nama_standar_harga
        )
            return [];
        const filtered = trxBelanja.filter(
            (item) =>
                item.kode_akun === formData.kode_akun &&
                item.paket === formData.kelompok_belanja &&
                item.keterangan_belanja === formData.keterangan_belanja &&
                item.sumber_dana === formData.sumber_dana &&
                item.nama === formData.nama_standar_harga,
        );
        const unique = [...new Set(filtered.map((item) => item.spesifikasi))];
        return unique.filter(Boolean);
    };

    // Handle spesifikasi selection to auto-fill koefisien, harga_satuan, total_harga
    const handleSpesifikasiSelect = (selectedSpesifikasi: string) => {
        if (!selectedSpesifikasi) {
            setFormData({
                spesifikasi: '',
                koefisien: '',
                harga_satuan: 0,
                total_harga: 0,
            });
            return;
        }

        // Find the exact trx_belanja item based on all selected criteria
        const selectedTrx = trxBelanja.find(
            (item) =>
                item.kode_akun === formData.kode_akun &&
                item.paket === formData.kelompok_belanja &&
                item.keterangan_belanja === formData.keterangan_belanja &&
                item.sumber_dana === formData.sumber_dana &&
                item.nama === formData.nama_standar_harga &&
                item.spesifikasi === selectedSpesifikasi,
        );

        if (selectedTrx) {
            setFormData({
                spesifikasi: selectedTrx.spesifikasi,
                koefisien: selectedTrx.koefisien,
                harga_satuan: selectedTrx.harga_satuan,
                total_harga: selectedTrx.total_harga,
            });
        } else {
            setFormData({
                spesifikasi: selectedSpesifikasi,
                koefisien: '',
                harga_satuan: 0,
                total_harga: 0,
            });
        }
    };

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

    // Clear keterangan_belanja when kelompok_belanja changes (except on initial load)
    useEffect(() => {
        if (
            formData.kelompok_belanja &&
            formData.kelompok_belanja !== realisasiBelanja.kelompok_belanja
        ) {
            setFormData({ keterangan_belanja: '' });
        }
    }, [formData.kelompok_belanja]);

    // Clear sumber_dana when keterangan_belanja changes (except on initial load)
    useEffect(() => {
        if (
            formData.keterangan_belanja &&
            formData.keterangan_belanja !== realisasiBelanja.keterangan_belanja
        ) {
            setFormData({ sumber_dana: '' });
        }
    }, [formData.keterangan_belanja]);

    // Clear nama_standar_harga when sumber_dana changes (except on initial load)
    useEffect(() => {
        if (
            formData.sumber_dana &&
            formData.sumber_dana !== realisasiBelanja.sumber_dana
        ) {
            setFormData({ nama_standar_harga: '' });
        }
    }, [formData.sumber_dana]);

    // Clear spesifikasi when nama_standar_harga changes (except on initial load)
    useEffect(() => {
        if (
            formData.nama_standar_harga &&
            formData.nama_standar_harga !== realisasiBelanja.nama_standar_harga
        ) {
            setFormData({ spesifikasi: '' });
        }
    }, [formData.nama_standar_harga]);

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
                                <select
                                    value={formData.kelompok_belanja}
                                    onChange={(e) =>
                                        setFormData({
                                            kelompok_belanja: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={!formData.kode_akun}
                                >
                                    <option value="">
                                        Pilih Kelompok Belanja
                                    </option>
                                    {getUniqueOptions('paket').map(
                                        (paket, index) => (
                                            <option key={index} value={paket}>
                                                {paket}
                                            </option>
                                        ),
                                    )}
                                </select>
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
                                <select
                                    value={formData.keterangan_belanja}
                                    onChange={(e) =>
                                        setFormData({
                                            keterangan_belanja: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={
                                        !formData.kode_akun ||
                                        !formData.kelompok_belanja
                                    }
                                >
                                    <option value="">
                                        Pilih Keterangan Belanja
                                    </option>
                                    {getKeteranganBelanjaOptions().map(
                                        (keterangan, index) => (
                                            <option
                                                key={index}
                                                value={keterangan}
                                            >
                                                {keterangan}
                                            </option>
                                        ),
                                    )}
                                </select>
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
                                <select
                                    value={formData.sumber_dana}
                                    onChange={(e) =>
                                        setFormData({
                                            sumber_dana: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    disabled={
                                        !formData.kode_akun ||
                                        !formData.kelompok_belanja ||
                                        !formData.keterangan_belanja
                                    }
                                >
                                    <option value="">Pilih Sumber Dana</option>
                                    {getSumberDanaOptions().map(
                                        (sumber, index) => (
                                            <option key={index} value={sumber}>
                                                {sumber}
                                            </option>
                                        ),
                                    )}
                                </select>
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
                                            getNamaStandarHargaOptions().find(
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
                                    disabled={
                                        !formData.kode_akun ||
                                        !formData.kelompok_belanja ||
                                        !formData.keterangan_belanja ||
                                        !formData.sumber_dana
                                    }
                                >
                                    <option value="">
                                        Pilih Standar Harga
                                    </option>
                                    {getNamaStandarHargaOptions().map(
                                        (item) => (
                                            <option
                                                key={item.id}
                                                value={item.nama}
                                            >
                                                {item.nama}
                                            </option>
                                        ),
                                    )}
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
                            <select
                                value={formData.spesifikasi}
                                onChange={(e) =>
                                    handleSpesifikasiSelect(e.target.value)
                                }
                                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                disabled={
                                    !formData.kode_akun ||
                                    !formData.kelompok_belanja ||
                                    !formData.keterangan_belanja ||
                                    !formData.sumber_dana ||
                                    !formData.nama_standar_harga
                                }
                            >
                                <option value="">Pilih Spesifikasi</option>
                                {getSpesifikasiOptions().map((spek, index) => (
                                    <option key={index} value={spek}>
                                        {spek}
                                    </option>
                                ))}
                            </select>
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
                                    type="text"
                                    value={formData.koefisien}
                                    readOnly
                                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
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
                                    type="text"
                                    value={new Intl.NumberFormat('id-ID', {
                                        style: 'currency',
                                        currency: 'IDR',
                                    }).format(formData.harga_satuan)}
                                    readOnly
                                    className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2"
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
                                    }).format(formData.total_harga)}
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
