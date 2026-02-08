import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface EditDPAModalProps {
    isOpen: boolean;
    onClose: () => void;
    rowData: Record<string, any> | null;
}

export default function EditDPAModal({
    isOpen,
    onClose,
    rowData,
}: EditDPAModalProps) {
    const { data, setData, put, processing, errors, reset } = useForm<
        Record<string, any>
    >({});

    useEffect(() => {
        if (rowData) {
            setData(rowData);
        }
    }, [rowData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.id) {
            alert('Data tidak valid');
            return;
        }

        put(route('inputdpa.update', data.id), {
            onSuccess: () => {
                onClose();
                reset();
            },
            onError: (errors) => {
                console.error('Error saat update:', errors);
            },
        });
    };

    if (!isOpen || !rowData) return null;

    // Fields yang bisa diedit (field dari TrxBelanja)
    const editableFields = [
        { key: 'kode_standar_harga', label: 'Kode Standar Harga' },
        { key: 'nama_standar_harga', label: 'Nama Standar Harga' },
        { key: 'paket', label: 'Paket' },
        { key: 'keterangan_belanja', label: 'Keterangan Belanja' },
        { key: 'sumber_dana', label: 'Sumber Dana' },
        { key: 'nama_penerima', label: 'Nama Penerima' },
        { key: 'spesifikasi', label: 'Spesifikasi' },
        { key: 'koefisien', label: 'Koefisien' },
        { key: 'harga_satuan', label: 'Harga Satuan', type: 'number' },
        { key: 'total_harga', label: 'Total Harga', type: 'number' },
        { key: 'unit_kerja', label: 'Unit Kerja' },
    ];

    // Fields yang hanya bisa dilihat (referensi)
    const readonlyFields = [
        { key: 'kode_urusan', label: 'Kode Urusan' },
        { key: 'nama_urusan', label: 'Nama Urusan' },
        { key: 'kode_bidang_urusan', label: 'Kode Bidang Urusan' },
        { key: 'nama_bidang_urusan', label: 'Nama Bidang Urusan' },
        { key: 'kode_program', label: 'Kode Program' },
        { key: 'nama_program', label: 'Nama Program' },
        { key: 'kode_kegiatan', label: 'Kode Kegiatan' },
        { key: 'nama_kegiatan', label: 'Nama Kegiatan' },
        { key: 'kode_sub_kegiatan', label: 'Kode Sub Kegiatan' },
        { key: 'nama_sub_kegiatan', label: 'Nama Sub Kegiatan' },
        { key: 'kode_skpd', label: 'Kode SKPD' },
        { key: 'nama_skpd', label: 'Nama SKPD' },
        { key: 'kode_unit_skpd', label: 'Kode Unit SKPD' },
        { key: 'nama_unit_skpd', label: 'Nama Unit SKPD' },
        { key: 'kode_akun', label: 'Kode Akun' },
        { key: 'nama_akun', label: 'Nama Akun' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-800">
                        Ubah Data DPA
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-xl font-bold text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    {/* Readonly Fields */}
                    <div className="mb-6">
                        <h3 className="mb-3 text-sm font-semibold text-gray-500">
                            Informasi Referensi (Tidak dapat diubah)
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {readonlyFields.map((field) => (
                                <div key={field.key}>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">
                                        {field.label}
                                    </label>
                                    <input
                                        type="text"
                                        value={data[field.key] ?? '-'}
                                        disabled
                                        className="w-full rounded border border-gray-200 bg-gray-100 px-3 py-2 text-sm text-gray-600"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Editable Fields */}
                    <div className="mb-6">
                        <h3 className="mb-3 text-sm font-semibold text-gray-700">
                            Data Belanja (Dapat diubah)
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                            {editableFields.map((field) => (
                                <div key={field.key}>
                                    <label className="mb-1 block text-xs font-medium text-gray-700">
                                        {field.label}
                                    </label>
                                    <input
                                        type={field.type || 'text'}
                                        value={data[field.key] ?? ''}
                                        onChange={(e) =>
                                            setData(field.key, e.target.value)
                                        }
                                        className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                    {errors[field.key] && (
                                        <p className="mt-1 text-xs text-red-500">
                                            {errors[field.key]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`rounded-lg px-4 py-2 font-medium text-white ${
                                processing
                                    ? 'cursor-not-allowed bg-gray-400'
                                    : 'bg-main hover:bg-main/90'
                            }`}
                        >
                            {processing ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Menyimpan...
                                </div>
                            ) : (
                                'Simpan Perubahan'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
