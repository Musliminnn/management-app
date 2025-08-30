import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface RealisasiBelanjaFormData {
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
}

interface RealisasiBelanjaItem extends RealisasiBelanjaFormData {
    id: number;
    user_id: number;
    created_at: string;
    updated_at: string;
    kegiatan?: {
        kode: string;
        nama: string;
    };
    subKegiatan?: {
        kode: string;
        nama: string;
    };
    akun?: {
        kode: string;
        nama: string;
    };
    user?: {
        id: number;
        name: string;
    };
}

interface DropdownOptions {
    kegiatan: Array<{ kode: string; nama: string }>;
    subKegiatan: Array<{ kode: string; nama: string }>;
    akun: Array<{ kode: string; nama: string; kelompok_belanja?: string; keterangan_belanja?: string; sumber_dana?: string }>;
    trxBelanja: Array<{
        id: number;
        nama: string;
        spesifikasi: string;
        koefisien: number;
        harga_satuan: number;
    }>;
}

interface RealisasiBelanjaState {
    // Form data
    formData: RealisasiBelanjaFormData;
    
    // Dropdown options
    dropdownOptions: DropdownOptions;
    
    // Loading states
    isLoading: boolean;
    isSubmitting: boolean;
    
    // Data list
    realisasiBelanja: RealisasiBelanjaItem[];
    currentPage: number;
    totalPages: number;
    
    // Errors
    errors: Record<string, string>;
    
    // Actions
    setFormData: (data: Partial<RealisasiBelanjaFormData>) => void;
    setDropdownOptions: (options: Partial<DropdownOptions>) => void;
    setLoading: (loading: boolean) => void;
    setSubmitting: (submitting: boolean) => void;
    setRealisasiBelanja: (data: RealisasiBelanjaItem[]) => void;
    setCurrentPage: (page: number) => void;
    setTotalPages: (total: number) => void;
    setErrors: (errors: Record<string, string>) => void;
    clearErrors: () => void;
    resetForm: () => void;
    
    // Computed
    getTotalHarga: () => number;
    isFormValid: () => boolean;
}

const initialFormData: RealisasiBelanjaFormData = {
    tanggal: new Date().toISOString().split('T')[0],
    kode_kegiatan: '',
    kode_sub_kegiatan: '',
    kode_akun: '',
    kelompok_belanja: '',
    keterangan_belanja: '',
    sumber_dana: '',
    nama_standar_harga: '',
    spesifikasi: '',
    koefisien: 0,
    harga_satuan: 0,
    realisasi: 0,
    tujuan_pembayaran: '',
};

const initialDropdownOptions: DropdownOptions = {
    kegiatan: [],
    subKegiatan: [],
    akun: [],
    trxBelanja: [],
};

export const useRealisasiBelanjaStore = create<RealisasiBelanjaState>()(
    devtools(
        (set, get) => ({
            // Initial state
            formData: initialFormData,
            dropdownOptions: initialDropdownOptions,
            isLoading: false,
            isSubmitting: false,
            realisasiBelanja: [],
            currentPage: 1,
            totalPages: 1,
            errors: {},

            // Actions
            setFormData: (data) =>
                set((state) => ({
                    formData: { ...state.formData, ...data },
                })),

            setDropdownOptions: (options) =>
                set((state) => ({
                    dropdownOptions: { ...state.dropdownOptions, ...options },
                })),

            setLoading: (loading) =>
                set({ isLoading: loading }),

            setSubmitting: (submitting) =>
                set({ isSubmitting: submitting }),

            setRealisasiBelanja: (data) =>
                set({ realisasiBelanja: data }),

            setCurrentPage: (page) =>
                set({ currentPage: page }),

            setTotalPages: (total) =>
                set({ totalPages: total }),

            setErrors: (errors) =>
                set({ errors }),

            clearErrors: () =>
                set({ errors: {} }),

            resetForm: () =>
                set({
                    formData: initialFormData,
                    errors: {},
                }),

            // Computed
            getTotalHarga: () => {
                const { formData } = get();
                return formData.koefisien * formData.harga_satuan;
            },

            isFormValid: () => {
                const { formData } = get();
                const requiredFields: (keyof RealisasiBelanjaFormData)[] = [
                    'tanggal',
                    'kode_kegiatan',
                    'kode_sub_kegiatan',
                    'kode_akun',
                    'kelompok_belanja',
                    'keterangan_belanja',
                    'sumber_dana',
                    'nama_standar_harga',
                    'spesifikasi',
                    'tujuan_pembayaran',
                ];
                
                return requiredFields.every(field => {
                    const value = formData[field];
                    return value !== '' && value !== null && value !== undefined;
                }) && formData.koefisien > 0 && formData.harga_satuan > 0 && formData.realisasi > 0;
            },
        }),
        {
            name: 'realisasi-belanja-store',
        }
    )
);
