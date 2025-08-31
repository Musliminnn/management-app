import CustomButton from '@/Components/CustomButton';
import CustomDayPicker from '@/Components/CustomDayPicker';
import RealisasiDropdown from '@/Components/RealisasiDropdown';
import SimpleDropdown from '@/Components/SimpleDropdown';
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
    kode_sub_kegiatan: string;
}

interface Props {
    kegiatan: DropdownOption[];
    subKegiatan: DropdownOption[];
    akun: DropdownOption[];
    trxBelanja: TrxBelanjaOption[];
}

export default function Create({
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
        resetForm,
    } = useRealisasiBelanjaStore();

    const [filteredSubKegiatan, setFilteredSubKegiatan] = useState<
        DropdownOption[]
    >([]);
    const [filteredAkun, setFilteredAkun] = useState<DropdownOption[]>([]);
    const [filteredTrxBelanja, setFilteredTrxBelanja] = useState<
        TrxBelanjaOption[]
    >([]);

    // Reset form to initial empty state when component mounts
    useEffect(() => {
        resetForm();
    }, []); // Empty dependency array means this runs only once on mount

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

    // Filter akun based on selected sub kegiatan
    useEffect(() => {
        if (formData.kode_sub_kegiatan) {
            // Get unique akun codes from TrxBelanja for selected sub kegiatan
            const trxBelanjaForSubKegiatan = trxBelanja.filter(
                (item) => item.kode_sub_kegiatan === formData.kode_sub_kegiatan,
            );
            const uniqueAkunCodes = [
                ...new Set(
                    trxBelanjaForSubKegiatan.map((item) => item.kode_akun),
                ),
            ];

            // Filter akun dropdown to only show those available in TrxBelanja
            const filtered = akun.filter((akunItem) =>
                uniqueAkunCodes.includes(akunItem.kode),
            );
            setFilteredAkun(filtered);
        } else {
            setFilteredAkun([]);
        }
    }, [formData.kode_sub_kegiatan, trxBelanja, akun]);

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

    // Get kelompok_belanja (paket) options based on selected akun
    const getKelompokBelanjaOptions = () => {
        if (!formData.kode_akun) return [];
        const filtered = trxBelanja.filter(
            (item) => item.kode_akun === formData.kode_akun,
        );

        // Remove duplicates with case insensitive comparison
        const uniqueMap = new Map();
        filtered.forEach((item) => {
            const lowerPaket = item.paket.toLowerCase();
            if (!uniqueMap.has(lowerPaket)) {
                uniqueMap.set(lowerPaket, item.paket); // Store original case
            }
        });

        return Array.from(uniqueMap.values()).filter(Boolean);
    };

    // Get keterangan_belanja options based on selected kelompok_belanja
    const getKeteranganBelanjaOptions = () => {
        if (!formData.kode_akun || !formData.kelompok_belanja) return [];
        const filtered = trxBelanja.filter(
            (item) =>
                item.kode_akun === formData.kode_akun &&
                item.paket.toLowerCase() ===
                    formData.kelompok_belanja.toLowerCase(),
        );

        // Remove duplicates with case insensitive comparison
        const uniqueMap = new Map();
        filtered.forEach((item) => {
            const lowerKeterangan = item.keterangan_belanja.toLowerCase();
            if (!uniqueMap.has(lowerKeterangan)) {
                uniqueMap.set(lowerKeterangan, item.keterangan_belanja); // Store original case
            }
        });

        return Array.from(uniqueMap.values()).filter(Boolean);
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
                item.paket.toLowerCase() ===
                    formData.kelompok_belanja.toLowerCase() &&
                item.keterangan_belanja.toLowerCase() ===
                    formData.keterangan_belanja.toLowerCase(),
        );

        // Remove duplicates with case insensitive comparison
        const uniqueMap = new Map();
        filtered.forEach((item) => {
            const lowerSumberDana = item.sumber_dana.toLowerCase();
            if (!uniqueMap.has(lowerSumberDana)) {
                uniqueMap.set(lowerSumberDana, item.sumber_dana); // Store original case
            }
        });

        return Array.from(uniqueMap.values()).filter(Boolean);
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
                item.paket.toLowerCase() ===
                    formData.kelompok_belanja.toLowerCase() &&
                item.keterangan_belanja.toLowerCase() ===
                    formData.keterangan_belanja.toLowerCase() &&
                item.sumber_dana.toLowerCase() ===
                    formData.sumber_dana.toLowerCase(),
        );

        // Remove duplicates with case insensitive comparison
        const uniqueMap = new Map();
        filtered.forEach((item) => {
            const lowerName = item.nama.toLowerCase();
            if (!uniqueMap.has(lowerName)) {
                uniqueMap.set(lowerName, item.nama); // Store original case
            }
        });

        return Array.from(uniqueMap.values()).filter(Boolean);
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
                item.paket.toLowerCase() ===
                    formData.kelompok_belanja.toLowerCase() &&
                item.keterangan_belanja.toLowerCase() ===
                    formData.keterangan_belanja.toLowerCase() &&
                item.sumber_dana.toLowerCase() ===
                    formData.sumber_dana.toLowerCase() &&
                item.nama.toLowerCase() ===
                    formData.nama_standar_harga.toLowerCase(),
        );

        // Remove duplicates with case insensitive comparison
        const uniqueMap = new Map();
        filtered.forEach((item) => {
            const lowerSpesifikasi = item.spesifikasi.toLowerCase();
            if (!uniqueMap.has(lowerSpesifikasi)) {
                uniqueMap.set(lowerSpesifikasi, item.spesifikasi); // Store original case
            }
        });

        return Array.from(uniqueMap.values()).filter(Boolean);
    };

    // Clear kode_akun when kode_sub_kegiatan changes
    useEffect(() => {
        if (formData.kode_sub_kegiatan) {
            setFormData({
                kode_akun: '',
                kelompok_belanja: '',
                keterangan_belanja: '',
                sumber_dana: '',
                nama_standar_harga: '',
                spesifikasi: '',
                koefisien: '',
                harga_satuan: 0,
                total_harga: 0,
            });
        }
    }, [formData.kode_sub_kegiatan]);

    // Clear keterangan_belanja when kelompok_belanja changes
    useEffect(() => {
        if (formData.kelompok_belanja) {
            setFormData({ keterangan_belanja: '' });
        }
    }, [formData.kelompok_belanja]);

    // Clear sumber_dana when keterangan_belanja changes
    useEffect(() => {
        if (formData.keterangan_belanja) {
            setFormData({ sumber_dana: '' });
        }
    }, [formData.keterangan_belanja]);

    // Clear nama_standar_harga when sumber_dana changes
    useEffect(() => {
        if (formData.sumber_dana) {
            setFormData({ nama_standar_harga: '' });
        }
    }, [formData.sumber_dana]);

    // Clear spesifikasi when nama_standar_harga changes
    useEffect(() => {
        if (formData.nama_standar_harga) {
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
            router.post('/realisasi-belanja', formData as any, {
                onSuccess: () => {
                    router.visit('/realisasi-belanja');
                },
                onError: (errors) => {
                    setErrors(errors as Record<string, string>);
                },
                onFinish: () => {
                    setSubmitting(false);
                },
            });
        } catch (error) {
            console.error('Submit error:', error);
            setSubmitting(false);
        }
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
                item.paket.toLowerCase() ===
                    formData.kelompok_belanja.toLowerCase() &&
                item.keterangan_belanja.toLowerCase() ===
                    formData.keterangan_belanja.toLowerCase() &&
                item.sumber_dana.toLowerCase() ===
                    formData.sumber_dana.toLowerCase() &&
                item.nama.toLowerCase() ===
                    formData.nama_standar_harga.toLowerCase() &&
                item.spesifikasi.toLowerCase() ===
                    selectedSpesifikasi.toLowerCase(),
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

    return (
        <ParentLayout>
            <Head title="Tambah Realisasi Belanja" />

            <div className="mx-auto max-w-4xl p-6">
                <div className="rounded-lg border border-gray-100 bg-white shadow-md">
                    <div className="rounded-t-lg bg-gradient-to-r from-main to-main/90 p-6">
                        <h2 className="text-xl font-semibold text-white">
                            Tambah Realisasi Belanja
                        </h2>
                        <p className="mt-1 text-sm text-white/90">
                            Input data realisasi belanja baru
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 p-6">
                        {errors.form && (
                            <div className="flex items-center rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                                <svg
                                    className="mr-2 h-5 w-5 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {errors.form}
                            </div>
                        )}

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            {/* Tanggal */}
                            <div>
                                <CustomDayPicker
                                    value={formData.tanggal}
                                    onChange={(date: string) =>
                                        setFormData({ tanggal: date })
                                    }
                                    baseDate={
                                        new Date().toISOString().split('T')[0]
                                    } // Periode hari ini
                                    label="Tanggal"
                                    placeholder="Pilih tanggal realisasi"
                                    required
                                    error={errors.tanggal}
                                />
                            </div>

                            {/* Kegiatan */}
                            <div>
                                <RealisasiDropdown
                                    options={kegiatan}
                                    value={formData.kode_kegiatan}
                                    onChange={(value) => {
                                        setFormData({
                                            kode_kegiatan: value,
                                            kode_sub_kegiatan: '', // Reset sub kegiatan
                                        });
                                    }}
                                    label="Kegiatan"
                                    placeholder="Pilih Kegiatan"
                                    required
                                    error={errors.kode_kegiatan}
                                />
                            </div>

                            {/* Sub Kegiatan */}
                            <div>
                                <RealisasiDropdown
                                    options={filteredSubKegiatan}
                                    value={formData.kode_sub_kegiatan}
                                    onChange={(value) =>
                                        setFormData({
                                            kode_sub_kegiatan: value,
                                        })
                                    }
                                    label="Sub Kegiatan"
                                    placeholder="Pilih Sub Kegiatan"
                                    required
                                    disabled={!formData.kode_kegiatan}
                                    error={errors.kode_sub_kegiatan}
                                />
                            </div>

                            {/* Akun */}
                            <div>
                                <RealisasiDropdown
                                    options={filteredAkun}
                                    value={formData.kode_akun}
                                    onChange={(value) =>
                                        setFormData({
                                            kode_akun: value,
                                        })
                                    }
                                    label="Akun"
                                    placeholder="Pilih Akun"
                                    required
                                    disabled={!formData.kode_sub_kegiatan}
                                    error={errors.kode_akun}
                                />
                            </div>

                            {/* Kelompok Belanja */}
                            <div>
                                <SimpleDropdown
                                    options={getKelompokBelanjaOptions()}
                                    value={formData.kelompok_belanja}
                                    onChange={(value) =>
                                        setFormData({
                                            kelompok_belanja: value,
                                        })
                                    }
                                    label="Kelompok Belanja"
                                    placeholder="Pilih Kelompok Belanja"
                                    required
                                    disabled={!formData.kode_akun}
                                    error={errors.kelompok_belanja}
                                />
                            </div>

                            {/* Keterangan Belanja */}
                            <div>
                                <SimpleDropdown
                                    options={getKeteranganBelanjaOptions()}
                                    value={formData.keterangan_belanja}
                                    onChange={(value) =>
                                        setFormData({
                                            keterangan_belanja: value,
                                        })
                                    }
                                    label="Keterangan Belanja"
                                    placeholder="Pilih Keterangan Belanja"
                                    required
                                    disabled={
                                        !formData.kode_akun ||
                                        !formData.kelompok_belanja
                                    }
                                    error={errors.keterangan_belanja}
                                />
                            </div>

                            {/* Sumber Dana */}
                            <div>
                                <SimpleDropdown
                                    options={getSumberDanaOptions()}
                                    value={formData.sumber_dana}
                                    onChange={(value) =>
                                        setFormData({
                                            sumber_dana: value,
                                        })
                                    }
                                    label="Sumber Dana"
                                    placeholder="Pilih Sumber Dana"
                                    required
                                    disabled={
                                        !formData.kode_akun ||
                                        !formData.kelompok_belanja ||
                                        !formData.keterangan_belanja
                                    }
                                    error={errors.sumber_dana}
                                />
                            </div>

                            {/* Nama Standar Harga */}
                            <div>
                                <SimpleDropdown
                                    options={getNamaStandarHargaOptions()}
                                    value={formData.nama_standar_harga}
                                    onChange={(value) => {
                                        setFormData({
                                            nama_standar_harga: value,
                                            spesifikasi: '',
                                            koefisien: '',
                                            harga_satuan: 0,
                                            total_harga: 0,
                                        });
                                    }}
                                    label="Nama Standar Harga"
                                    placeholder="Pilih Standar Harga"
                                    required
                                    disabled={
                                        !formData.kode_akun ||
                                        !formData.kelompok_belanja ||
                                        !formData.keterangan_belanja ||
                                        !formData.sumber_dana
                                    }
                                    error={errors.nama_standar_harga}
                                />
                            </div>
                        </div>

                        {/* Spesifikasi */}
                        <div>
                            <SimpleDropdown
                                options={getSpesifikasiOptions()}
                                value={formData.spesifikasi}
                                onChange={(value) =>
                                    handleSpesifikasiSelect(value)
                                }
                                label="Spesifikasi"
                                placeholder="Pilih Spesifikasi"
                                required
                                disabled={
                                    !formData.kode_akun ||
                                    !formData.kelompok_belanja ||
                                    !formData.keterangan_belanja ||
                                    !formData.sumber_dana ||
                                    !formData.nama_standar_harga
                                }
                                error={errors.spesifikasi}
                            />
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
                                    className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700"
                                />
                                {errors.koefisien && (
                                    <p className="mt-1 flex items-center text-sm text-red-600">
                                        <svg
                                            className="mr-1 h-4 w-4 flex-shrink-0"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
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
                                    className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700"
                                />
                                {errors.harga_satuan && (
                                    <p className="mt-1 flex items-center text-sm text-red-600">
                                        <svg
                                            className="mr-1 h-4 w-4 flex-shrink-0"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
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
                                    className="w-full cursor-not-allowed rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-700"
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
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 transition-all duration-200 ease-in-out hover:border-main focus:border-main focus:outline-none focus:ring-2 focus:ring-main"
                                placeholder="Masukkan nilai realisasi..."
                                required
                            />
                            {errors.realisasi && (
                                <p className="mt-1 flex items-center text-sm text-red-600">
                                    <svg
                                        className="mr-1 h-4 w-4 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
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
                                className="resize-vertical w-full rounded-lg border border-gray-300 px-4 py-3 text-gray-900 placeholder-gray-500 transition-all duration-200 ease-in-out hover:border-main/50 focus:border-main focus:outline-none focus:ring-2 focus:ring-main/20"
                                placeholder="Masukkan tujuan pembayaran..."
                                required
                            />
                            {errors.tujuan_pembayaran && (
                                <p className="mt-1 flex items-center text-sm text-red-600">
                                    <svg
                                        className="mr-1 h-4 w-4 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {errors.tujuan_pembayaran}
                                </p>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 flex justify-end space-x-3 border-t border-gray-200 pt-6">
                            <CustomButton
                                type="button"
                                variant="outlined"
                                onClick={() =>
                                    router.visit('/realisasi-belanja')
                                }
                                disabled={isSubmitting}
                                className="px-6 py-2.5"
                            >
                                Batal
                            </CustomButton>
                            <CustomButton
                                type="submit"
                                variant="primary"
                                disabled={isSubmitting || !isFormValid()}
                                className="min-w-[120px] px-6 py-2.5"
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center">
                                        <svg
                                            className="-ml-1 mr-2 h-4 w-4 animate-spin text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Menyimpan...
                                    </div>
                                ) : (
                                    'Simpan'
                                )}
                            </CustomButton>
                        </div>
                    </form>
                </div>
            </div>
        </ParentLayout>
    );
}
