import CustomButton from '@/Components/CustomButton';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function UploadDPA() {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const {
        data: importData,
        setData: setImportData,
        post,
        processing,
        errors,
    } = useForm<{
        file: File | null;
    }>({
        file: null,
    });

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!importData.file) {
            alert('Pilih file terlebih dahulu!');
            return;
        }

        post(route('import.file'), {
            forceFormData: true,
            onSuccess: () => {
                alert(
                    'File berhasil dikirim. Proses import sedang berlangsung via queue.',
                );
                setImportData('file', null);
                setIsUploadOpen(false);
            },
            onError: (errors) => {
                console.error('Error saat upload:', errors);
                alert('Gagal mengunggah file. Silakan cek konsol.');
            },
        });
    };

    return (
        <div className="mb-10 rounded-lg border-2 border-dotted border-black/25 p-4">
            <div className="flex flex-wrap items-center justify-center gap-6">
                <CustomButton
                    variant="primary"
                    onClick={() => setIsUploadOpen(true)}
                >
                    Import Anggaran
                </CustomButton>

                {isUploadOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <form
                            onSubmit={handleImportSubmit}
                            encType="multipart/form-data"
                            className="w-full max-w-md space-y-4 rounded-lg bg-white p-6 shadow-lg"
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <h2 className="text-lg font-semibold">
                                    Import File Excel
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setIsUploadOpen(false)}
                                    className="text-gray-500 hover:text-gray-800"
                                >
                                    ✕
                                </button>
                            </div>

                            <div>
                                <input
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={(e) =>
                                        setImportData(
                                            'file',
                                            e.target.files?.[0] || null,
                                        )
                                    }
                                    className="w-full rounded border p-2"
                                />
                                {errors.file && (
                                    <div className="mt-1 text-sm text-red-600">
                                        {errors.file}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className={`w-full rounded px-4 py-2 ${
                                    processing
                                        ? 'bg-gray-400'
                                        : 'bg-main text-white hover:bg-main'
                                }`}
                            >
                                {processing
                                    ? 'Proses Import...'
                                    : 'Import'}
                            </button>
                        </form>
                    </div>
                )}

                <CustomButton variant="secondary">Ubah Anggaran</CustomButton>
                <CustomButton variant="outlined">Geser Anggaran</CustomButton>
            </div>
        </div>
    );
}
