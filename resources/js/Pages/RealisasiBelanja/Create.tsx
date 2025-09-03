import CustomButton from '@/Components/CustomButton';
import CustomDayPicker from '@/Components/CustomDayPicker';
import RealisasiDropdown from '@/Components/RealisasiDropdown';
import SimpleDropdown from '@/Components/SimpleDropdown';
import { ParentLayout } from '@/Layouts/MainLayout';
import {
    BulkInputItem,
    useRealisasiBelanjaStore,
} from '@/stores/realisasiBelanjaStore';
import {
    calculateMaxKoefisien,
    formatCurrency,
    formatCurrencyNumber,
    handleCurrencyInputChange,
    validateKoefisienRealisasi,
    validateRealisasiPagu,
} from '@/utils/currencyUtils';
import { Head, router } from '@inertiajs/react';
import React, { useEffect, useMemo, useState } from 'react';

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
        resetForm,
        bulkInputItems,
        addBulkInputItem,
        removeBulkInputItem,
        clearBulkInputItems,
    } = useRealisasiBelanjaStore();

    const [filteredSubKegiatan, setFilteredSubKegiatan] = useState<
        DropdownOption[]
    >([]);
    const [filteredAkun, setFilteredAkun] = useState<DropdownOption[]>([]);
    const [filteredTrxBelanja, setFilteredTrxBelanja] = useState<
        TrxBelanjaOption[]
    >([]);

    // State for currency input display
    const [hargaSatuanDisplay, setHargaSatuanDisplay] = useState<string>('');

    // State for DPA values (readonly, from TrxBelanja)
    const [dpaValues, setDpaValues] = useState({
        koefisien: '',
        harga_satuan: 0,
        total_harga: 0,
    });

    // State for existing realisasi total
    const [existingRealisasiTotal, setExistingRealisasiTotal] =
        useState<number>(0);
    const [isLoadingRealisasi, setIsLoadingRealisasi] =
        useState<boolean>(false);

    // Calculate remaining Pagu Anggaran
    const remainingPaguAnggaran =
        dpaValues.total_harga - existingRealisasiTotal;

    // Helper function to calculate maximum koefisien from DPA string
    // Now using utility function for consistency
    const maxKoefisien = calculateMaxKoefisien(dpaValues.koefisien);

    // Auto-calculate realisasi when koefisien_realisasi or harga_satuan_realisasi changes
    useEffect(() => {
        const realisasi =
            formData.koefisien_realisasi * formData.harga_satuan_realisasi;

        // Validate realisasi against remaining Pagu Anggaran (original - existing)
        let realisasiValidation;
        if (remainingPaguAnggaran > 0) {
            realisasiValidation = validateRealisasiPagu(
                realisasi,
                remainingPaguAnggaran,
            );
        } else {
            realisasiValidation = validateRealisasiPagu(
                realisasi,
                dpaValues.total_harga,
            );
        }

        if (!realisasiValidation.isValid) {
            setErrors({
                ...errors,
                realisasi: realisasiValidation.errorMessage!,
            });
        } else {
            // Clear realisasi error if valid
            const newErrors = { ...errors };
            delete newErrors.realisasi;
            setErrors(newErrors);
        }

        setFormData({ realisasi });
    }, [
        formData.koefisien_realisasi,
        formData.harga_satuan_realisasi,
        dpaValues.total_harga,
        remainingPaguAnggaran,
    ]);

    // Reset form to initial empty state when component mounts
    useEffect(() => {
        resetForm();
        setExistingRealisasiTotal(0);
    }, []); // Empty dependency array means this runs only once on mount

    // Function to add current form data to bulk input
    const addToBulkInput = () => {
        // Validate all required fields for adding to preview (except tujuan_pembayaran)
        if (
            !formData.tanggal ||
            !formData.kode_kegiatan ||
            !formData.kode_sub_kegiatan ||
            !formData.kode_akun ||
            !formData.kelompok_belanja ||
            !formData.keterangan_belanja ||
            !formData.sumber_dana ||
            !formData.nama_standar_harga ||
            !formData.spesifikasi ||
            !dpaValues.koefisien ||
            dpaValues.harga_satuan === 0 ||
            formData.koefisien_realisasi === 0 ||
            formData.harga_satuan_realisasi === 0
        ) {
            setErrors({
                ...errors,
                bulk: 'Mohon lengkapi semua data yang diperlukan sebelum menambahkan ke Preview Realisasi',
            });
            return;
        }

        // Check if remaining budget is sufficient
        if (remainingPaguAnggaran <= 0) {
            setErrors({
                ...errors,
                bulk: 'Pagu anggaran untuk spesifikasi ini sudah habis. Tidak dapat menambahkan realisasi baru.',
            });
            return;
        }

        // Check if current realisasi exceeds remaining budget
        if (formData.realisasi > remainingPaguAnggaran) {
            setErrors({
                ...errors,
                bulk: `Realisasi ${formatCurrency(formData.realisasi)} melebihi sisa anggaran ${formatCurrency(remainingPaguAnggaran)}`,
            });
            return;
        }

        const newItem: BulkInputItem = {
            id: `${Date.now()}-${Math.random()}`,
            // Store all necessary form data in each item
            tanggal: formData.tanggal,
            kode_kegiatan: formData.kode_kegiatan,
            kode_sub_kegiatan: formData.kode_sub_kegiatan,
            kode_akun: formData.kode_akun,
            kelompok_belanja: formData.kelompok_belanja,
            keterangan_belanja: formData.keterangan_belanja,
            sumber_dana: formData.sumber_dana,
            nama_standar_harga: formData.nama_standar_harga,
            spesifikasi: formData.spesifikasi,
            koefisien_dpa: dpaValues.koefisien,
            harga_satuan_dpa: dpaValues.harga_satuan,
            pagu_anggaran: dpaValues.total_harga,
            koefisien_realisasi: formData.koefisien_realisasi,
            harga_satuan_realisasi: formData.harga_satuan_realisasi,
            realisasi: formData.realisasi,
        };

        addBulkInputItem(newItem);

        // Clear bulk error
        const newErrors = { ...errors };
        delete newErrors.bulk;
        setErrors(newErrors);

        const clearedErrors = { ...errors };
        delete clearedErrors.nama_standar_harga;
        delete clearedErrors.spesifikasi;
        delete clearedErrors.koefisien;
        delete clearedErrors.harga_satuan;
        delete clearedErrors.realisasi;
        setErrors(clearedErrors);

        setFormData({
            nama_standar_harga: '',
            spesifikasi: '',
            koefisien_realisasi: 0,
            harga_satuan_realisasi: 0,
            realisasi: 0,
        });
        setHargaSatuanDisplay('');
        setDpaValues({
            koefisien: '',
            harga_satuan: 0,
            total_harga: 0,
        });
        setExistingRealisasiTotal(0);
    };

    // Update harga satuan display when form data changes
    useEffect(() => {
        if (formData.harga_satuan_realisasi > 0) {
            setHargaSatuanDisplay(
                formatCurrencyNumber(formData.harga_satuan_realisasi),
            );
        } else {
            setHargaSatuanDisplay('');
        }
    }, [formData.harga_satuan_realisasi]);

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

    // Reset existing realisasi when key fields change
    useEffect(() => {
        setExistingRealisasiTotal(0);
    }, [
        formData.kode_sub_kegiatan,
        formData.kode_akun,
        formData.kelompok_belanja,
        formData.keterangan_belanja,
        formData.sumber_dana,
        formData.nama_standar_harga,
    ]);

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

    // Get spesifikasi options based on selected nama_standar_harga (memoized)
    const getSpesifikasiOptions = useMemo(() => {
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

        // Get all available spesifikasi
        const allSpesifikasi = Array.from(uniqueMap.values()).filter(Boolean);

        // Get spesifikasi that are already used in bulkInputItems
        const usedSpesifikasi = bulkInputItems.map((item) =>
            item.spesifikasi.toLowerCase(),
        );

        // Filter out already used spesifikasi
        return allSpesifikasi.filter(
            (spesifikasi) =>
                !usedSpesifikasi.includes(spesifikasi.toLowerCase()),
        );
    }, [
        formData.kode_akun,
        formData.kelompok_belanja,
        formData.keterangan_belanja,
        formData.sumber_dana,
        formData.nama_standar_harga,
        trxBelanja,
        bulkInputItems,
    ]);

    // Auto-clear spesifikasi if current selected spesifikasi is no longer available
    useEffect(() => {
        if (
            formData.spesifikasi &&
            !getSpesifikasiOptions.includes(formData.spesifikasi)
        ) {
            setFormData({
                spesifikasi: '',
                koefisien_realisasi: 0,
                harga_satuan_realisasi: 0,
                realisasi: 0,
            });
            setDpaValues({
                koefisien: '',
                harga_satuan: 0,
                total_harga: 0,
            });
        }
    }, [getSpesifikasiOptions, formData.spesifikasi]);

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
                koefisien_realisasi: 0,
                harga_satuan_realisasi: 0,
                realisasi: 0,
            });
            setDpaValues({
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

        // Clear all errors at the start
        setErrors({});

        // Validation for bulk submission
        if (bulkInputItems.length === 0) {
            setErrors({
                form: 'Mohon tambahkan minimal satu data ke Preview Realisasi sebelum menyimpan',
            });
            return;
        }

        if (!formData.tujuan_pembayaran?.trim()) {
            setErrors({
                form: 'Mohon isi Tujuan Pembayaran sebelum menyimpan',
            });
            return;
        }

        setSubmitting(true);

        try {
            // Prepare bulk submission data
            const firstItem = bulkInputItems[0];
            const submitData = {
                // Base data (shared across all items)
                tanggal: firstItem.tanggal,
                kode_kegiatan: firstItem.kode_kegiatan,
                kode_sub_kegiatan: firstItem.kode_sub_kegiatan,
                kode_akun: firstItem.kode_akun,
                kelompok_belanja: firstItem.kelompok_belanja,
                keterangan_belanja: firstItem.keterangan_belanja,
                sumber_dana: firstItem.sumber_dana,
                tujuan_pembayaran: formData.tujuan_pembayaran.trim(),

                // Items data (variable per item)
                bulk_items: bulkInputItems.map((item) => ({
                    nama_standar_harga: item.nama_standar_harga,
                    spesifikasi: item.spesifikasi,
                    koefisien: item.koefisien_realisasi,
                    harga_satuan: item.harga_satuan_realisasi,
                    realisasi: item.realisasi,
                })),
            };

            router.post('/realisasi-belanja', submitData, {
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

    // Function to fetch existing realisasi total for the selected spesifikasi
    const fetchExistingRealisasi = async (spesifikasiData: any) => {
        if (
            !spesifikasiData.kode_sub_kegiatan ||
            !spesifikasiData.kode_akun ||
            !spesifikasiData.kelompok_belanja ||
            !spesifikasiData.keterangan_belanja ||
            !spesifikasiData.sumber_dana ||
            !spesifikasiData.nama_standar_harga ||
            !spesifikasiData.spesifikasi
        ) {
            setExistingRealisasiTotal(0);
            return;
        }

        setIsLoadingRealisasi(true);
        try {
            const response = await fetch('/realisasi-belanja/total-realisasi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN':
                        document
                            .querySelector('meta[name="csrf-token"]')
                            ?.getAttribute('content') || '',
                },
                body: JSON.stringify(spesifikasiData),
            });

            if (response.ok) {
                const data = await response.json();
                setExistingRealisasiTotal(data.total_realisasi || 0);
            } else {
                console.error('Failed to fetch existing realisasi');
                setExistingRealisasiTotal(0);
            }
        } catch (error) {
            console.error('Error fetching existing realisasi:', error);
            setExistingRealisasiTotal(0);
        } finally {
            setIsLoadingRealisasi(false);
        }
    };

    // Handle spesifikasi selection to auto-fill DPA values (koefisien, harga_satuan, total_harga)
    const handleSpesifikasiSelect = (selectedSpesifikasi: string) => {
        if (!selectedSpesifikasi) {
            setFormData({
                spesifikasi: '',
                koefisien_realisasi: 0,
                harga_satuan_realisasi: 0,
                realisasi: 0,
            });
            setDpaValues({
                koefisien: '',
                harga_satuan: 0,
                total_harga: 0,
            });
            setExistingRealisasiTotal(0);
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
                koefisien_realisasi: 0,
                harga_satuan_realisasi: 0,
                realisasi: 0,
            });
            setDpaValues({
                koefisien: selectedTrx.koefisien,
                harga_satuan: selectedTrx.harga_satuan,
                total_harga: selectedTrx.total_harga,
            });

            // Fetch existing realisasi for this spesifikasi
            fetchExistingRealisasi({
                kode_sub_kegiatan: formData.kode_sub_kegiatan,
                kode_akun: formData.kode_akun,
                kelompok_belanja: formData.kelompok_belanja,
                keterangan_belanja: formData.keterangan_belanja,
                sumber_dana: formData.sumber_dana,
                nama_standar_harga: formData.nama_standar_harga,
                spesifikasi: selectedTrx.spesifikasi,
            });
        } else {
            setFormData({
                spesifikasi: selectedSpesifikasi,
                koefisien_realisasi: 0,
                harga_satuan_realisasi: 0,
                realisasi: 0,
            });
            setDpaValues({
                koefisien: '',
                harga_satuan: 0,
                total_harga: 0,
            });
            setExistingRealisasiTotal(0);
        }
    };

    return (
        <ParentLayout>
            <Head title="Tambah Realisasi Belanja" />

            <div className="mx-auto p-6">
                <div className="rounded-lg border border-gray-100 bg-white shadow-md">
                    <div className="rounded-t-lg bg-gradient-to-r from-main to-main/90 p-6">
                        <h2 className="text-xl font-semibold text-white">
                            Tambah Realisasi Belanja
                        </h2>
                        <p className="mt-1 text-sm text-white/90">
                            Input data realisasi belanja baru
                        </p>
                    </div>

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6 p-6"
                        noValidate
                    >
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
                                            koefisien_realisasi: 0,
                                            harga_satuan_realisasi: 0,
                                            realisasi: 0,
                                        });
                                        setDpaValues({
                                            koefisien: '',
                                            harga_satuan: 0,
                                            total_harga: 0,
                                        });
                                    }}
                                    label="Nama Standar Harga"
                                    placeholder="Pilih Standar Harga"
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
                                options={getSpesifikasiOptions}
                                value={formData.spesifikasi}
                                onChange={(value) =>
                                    handleSpesifikasiSelect(value)
                                }
                                label="Spesifikasi"
                                placeholder="Pilih Spesifikasi"
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
                            {/* Koefisien DPA (readonly) */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Koefisien (DPA)
                                </label>
                                <input
                                    type="text"
                                    value={dpaValues.koefisien}
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 focus:border-main focus:outline-none focus:ring-2 focus:ring-main/20"
                                />
                            </div>

                            {/* Harga Satuan DPA (readonly) */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Harga Satuan (DPA)
                                </label>
                                <input
                                    type="text"
                                    value={formatCurrency(
                                        dpaValues.harga_satuan,
                                    )}
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 focus:border-main focus:outline-none focus:ring-2 focus:ring-main/20"
                                />
                            </div>

                            {/* Total Harga DPA (readonly) */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Pagu Anggaran
                                </label>
                                <input
                                    type="text"
                                    value={formatCurrency(
                                        dpaValues.total_harga,
                                    )}
                                    readOnly
                                    className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-gray-700 focus:border-main focus:outline-none focus:ring-2 focus:ring-main/20"
                                />
                                {existingRealisasiTotal > 0 && (
                                    <div className="mt-2 space-y-1">
                                        <div className="text-xs text-gray-600">
                                            <span className="font-medium">
                                                Sudah Diinput:
                                            </span>{' '}
                                            <span className="text-orange-600">
                                                {formatCurrency(
                                                    existingRealisasiTotal,
                                                )}
                                            </span>
                                        </div>
                                        {remainingPaguAnggaran <= 0 && (
                                            <div className="mt-1 rounded-md border border-red-200 bg-red-50 px-2 py-1">
                                                <div className="flex items-center text-xs text-red-700">
                                                    <svg
                                                        className="mr-1 h-3 w-3"
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    Anggaran sudah habis
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {isLoadingRealisasi && (
                                    <div className="mt-2 text-xs text-gray-500">
                                        <span className="animate-pulse">
                                            Mengecek realisasi yang sudah ada...
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                            {/* Koefisien Realisasi */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Koefisien *
                                    {maxKoefisien > 0 && (
                                        <span className="ml-1 text-xs text-gray-500">
                                            (Maksimal: {maxKoefisien})
                                        </span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max={
                                        maxKoefisien > 0
                                            ? maxKoefisien
                                            : undefined
                                    }
                                    value={formData.koefisien_realisasi || ''}
                                    onChange={(e) => {
                                        const value =
                                            parseFloat(e.target.value) || 0;

                                        // Validate against max koefisien from DPA
                                        const validation =
                                            validateKoefisienRealisasi(
                                                value,
                                                dpaValues.koefisien,
                                            );

                                        if (!validation.isValid) {
                                            setErrors({
                                                ...errors,
                                                koefisien:
                                                    validation.errorMessage!,
                                            });
                                        } else {
                                            // Clear error if valid
                                            const newErrors = { ...errors };
                                            delete newErrors.koefisien;
                                            setErrors(newErrors);
                                        }

                                        setFormData({
                                            koefisien_realisasi: value,
                                        });
                                    }}
                                    className={`w-full rounded-md border px-3 py-2 text-gray-900 placeholder-gray-500 transition-all duration-200 ease-in-out hover:border-main focus:border-main focus:outline-none focus:ring-2 focus:ring-main ${
                                        errors.koefisien
                                            ? 'border-red-300'
                                            : 'border-gray-300'
                                    }`}
                                    placeholder="Masukkan koefisien..."
                                />
                            </div>

                            {/* Harga Satuan Realisasi */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Harga Satuan *
                                </label>
                                <input
                                    type="text"
                                    value={hargaSatuanDisplay}
                                    onChange={(e) => {
                                        const formatted =
                                            handleCurrencyInputChange(
                                                e.target.value,
                                                (amount) =>
                                                    setFormData({
                                                        harga_satuan_realisasi:
                                                            amount,
                                                    }),
                                            );
                                        setHargaSatuanDisplay(formatted);
                                    }}
                                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 transition-all duration-200 ease-in-out hover:border-main focus:border-main focus:outline-none focus:ring-2 focus:ring-main"
                                    placeholder="Masukkan harga satuan..."
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

                            {/* Realisasi (Auto-calculated) */}
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-700">
                                    Realisasi
                                    {remainingPaguAnggaran > 0 ? (
                                        <span className="ml-1 text-xs text-green-600">
                                            (Maksimal:{' '}
                                            {formatCurrency(
                                                remainingPaguAnggaran,
                                            )}
                                            )
                                        </span>
                                    ) : dpaValues.total_harga > 0 ? (
                                        <span className="ml-1 text-xs text-gray-500">
                                            (Maksimal:{' '}
                                            {formatCurrency(
                                                dpaValues.total_harga,
                                            )}
                                            )
                                        </span>
                                    ) : null}
                                </label>
                                <input
                                    type="text"
                                    value={formatCurrency(formData.realisasi)}
                                    readOnly
                                    className={`w-full cursor-not-allowed rounded-md border px-3 py-2 text-gray-700 focus:border-main focus:outline-none focus:ring-2 focus:ring-main/20 ${
                                        errors.realisasi
                                            ? 'border-red-300'
                                            : 'border-gray-200 bg-gray-50'
                                    }`}
                                />
                            </div>
                        </div>

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

                        {/* Preview Realisasi - Bulk Input Section */}
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Preview Realisasi
                                </h3>
                                <CustomButton
                                    type="button"
                                    variant="primary"
                                    onClick={addToBulkInput}
                                    disabled={
                                        !formData.tanggal ||
                                        !formData.kode_kegiatan ||
                                        !formData.kode_sub_kegiatan ||
                                        !formData.kode_akun ||
                                        !formData.kelompok_belanja ||
                                        !formData.keterangan_belanja ||
                                        !formData.sumber_dana ||
                                        !formData.nama_standar_harga ||
                                        !formData.spesifikasi ||
                                        !dpaValues.koefisien ||
                                        dpaValues.harga_satuan === 0 ||
                                        formData.koefisien_realisasi === 0 ||
                                        formData.harga_satuan_realisasi === 0
                                    }
                                    className="px-4 py-2"
                                >
                                    Tambah ke Preview
                                </CustomButton>
                            </div>

                            {errors.bulk && (
                                <div className="mb-4 flex items-center rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700">
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
                                    {errors.bulk}
                                </div>
                            )}

                            {bulkInputItems.length === 0 ? (
                                <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
                                    <div className="text-gray-500">
                                        <svg
                                            className="mx-auto h-12 w-12 text-gray-400"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                                            />
                                        </svg>
                                        <p className="mt-2 text-sm">
                                            Belum ada data realisasi
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Lengkapi form di atas dan klik
                                            "Tambah ke Preview"
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full table-auto border-collapse text-sm">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Nama Standar Harga
                                                </th>
                                                <th className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Spesifikasi
                                                </th>
                                                <th className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Koefisien DPA
                                                </th>
                                                <th className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Harga Satuan DPA
                                                </th>
                                                <th className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Pagu Anggaran
                                                </th>
                                                <th className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Koefisien Realisasi
                                                </th>
                                                <th className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Harga Satuan Realisasi
                                                </th>
                                                <th className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Realisasi
                                                </th>
                                                <th className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                                                    Aksi
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white">
                                            {bulkInputItems.map(
                                                (item, index) => (
                                                    <tr
                                                        key={item.id}
                                                        className={
                                                            index % 2 === 0
                                                                ? 'bg-white'
                                                                : 'bg-gray-50'
                                                        }
                                                    >
                                                        <td className="whitespace-nowrap border border-gray-200 px-3 py-2 text-sm text-gray-900">
                                                            <div
                                                                className="max-w-[200px] truncate"
                                                                title={
                                                                    item.nama_standar_harga
                                                                }
                                                            >
                                                                {
                                                                    item.nama_standar_harga
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap border border-gray-200 px-3 py-2 text-sm text-gray-900">
                                                            <div
                                                                className="max-w-[250px] truncate"
                                                                title={
                                                                    item.spesifikasi
                                                                }
                                                            >
                                                                {
                                                                    item.spesifikasi
                                                                }
                                                            </div>
                                                        </td>
                                                        <td className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-sm text-gray-900">
                                                            {item.koefisien_dpa}
                                                        </td>
                                                        <td className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-sm text-gray-900">
                                                            {formatCurrency(
                                                                item.harga_satuan_dpa,
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-sm text-gray-900">
                                                            {formatCurrency(
                                                                item.pagu_anggaran,
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-sm text-gray-900">
                                                            {
                                                                item.koefisien_realisasi
                                                            }
                                                        </td>
                                                        <td className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-sm text-gray-900">
                                                            {formatCurrency(
                                                                item.harga_satuan_realisasi,
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center text-sm font-medium text-gray-900">
                                                            {formatCurrency(
                                                                item.realisasi,
                                                            )}
                                                        </td>
                                                        <td className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    removeBulkInputItem(
                                                                        item.id,
                                                                    )
                                                                }
                                                                className="text-red-600 hover:text-red-900"
                                                                title="Hapus item"
                                                            >
                                                                <svg
                                                                    className="h-4 w-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={
                                                                            2
                                                                        }
                                                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                        <tfoot className="bg-gray-50">
                                            <tr>
                                                <td
                                                    colSpan={7}
                                                    className="whitespace-nowrap border border-gray-200 px-3 py-2 text-right text-sm font-medium text-gray-900"
                                                >
                                                    Total Realisasi:
                                                </td>
                                                <td className="whitespace-nowrap border border-gray-200 px-3 py-2 text-right text-sm font-bold text-gray-900">
                                                    {formatCurrency(
                                                        bulkInputItems.reduce(
                                                            (sum, item) =>
                                                                sum +
                                                                item.realisasi,
                                                            0,
                                                        ),
                                                    )}
                                                </td>
                                                <td className="whitespace-nowrap border border-gray-200 px-3 py-2 text-center">
                                                    {bulkInputItems.length >
                                                        0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                clearBulkInputItems()
                                                            }
                                                            className="text-xs text-red-600 hover:text-red-900"
                                                            title="Hapus semua"
                                                        >
                                                            Hapus Semua
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
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
                                disabled={
                                    isSubmitting ||
                                    bulkInputItems.length === 0 ||
                                    !formData.tujuan_pembayaran
                                }
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
                                ) : bulkInputItems.length > 0 ? (
                                    `Simpan ${bulkInputItems.length} Realisasi`
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
