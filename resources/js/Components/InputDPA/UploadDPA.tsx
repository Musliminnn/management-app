import CustomButton from '@/Components/CustomButton';
import { useAuth } from '@/hooks/useAuth';
import { MenuEnum } from '@/types/enums';
import { useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function UploadDPA() {
    const { canAdd } = useAuth();
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const {
        data: importData,
        setData: setImportData,
        post,
        processing,
        errors,
        reset,
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
                // Close dialog and reset form
                setIsUploadOpen(false);
                reset();
                alert('File berhasil diunggah dan sedang diproses!');
            },
            onError: (errors) => {
                console.error('Error saat upload:', errors);
                if (errors.file) {
                    alert('' + errors.file);
                } else {
                    alert('Gagal mengunggah file. Silakan coba lagi.');
                }
            },
        });
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (
                file.type ===
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                file.type === 'application/vnd.ms-excel'
            ) {
                setImportData('file', file);
            } else {
                alert('Hanya file Excel (.xlsx, .xls) yang dapat diunggah!');
            }
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Don't render if user doesn't have add permission
    if (!canAdd(MenuEnum.InputDPA)) {
        return null;
    }

    return (
        <div className="mb-10 rounded-lg border-2 border-dotted border-black/25 p-4">
            <div className="flex flex-wrap items-center justify-center gap-6">
                <CustomButton
                    variant="primary"
                    onClick={() => setIsUploadOpen(true)}
                    disabled={processing}
                    className={
                        processing ? 'cursor-not-allowed opacity-50' : ''
                    }
                >
                    {processing ? 'Sedang Mengupload...' : 'Import Data DPA'}
                </CustomButton>

                {isUploadOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-md space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                                    Import File Data DPA
                                </h2>
                                <button
                                    type="button"
                                    onClick={() => setIsUploadOpen(false)}
                                    className="text-xl font-bold text-gray-400 hover:text-gray-600"
                                >
                                    ✕
                                </button>
                            </div>

                            <form
                                onSubmit={handleImportSubmit}
                                encType="multipart/form-data"
                            >
                                <div
                                    className={`relative my-2 rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
                                        dragActive
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                >
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        onChange={(e) =>
                                            setImportData(
                                                'file',
                                                e.target.files?.[0] || null,
                                            )
                                        }
                                        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                                    />

                                    <div className="space-y-2">
                                        <div className="text-4xl">📄</div>
                                        <div className="text-gray-600">
                                            {importData.file ? (
                                                <div className="space-y-1">
                                                    <div className="font-medium text-green-600">
                                                        {' '}
                                                        {importData.file.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {formatFileSize(
                                                            importData.file
                                                                .size,
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="font-medium">
                                                        Tarik dan lepas file
                                                        Excel di sini
                                                    </div>
                                                    <div className="text-sm">
                                                        atau klik untuk memilih
                                                        file
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-400">
                                                        Maksimal 5MB (.xlsx,
                                                        .xls)
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {errors.file && (
                                    <div className="my-2 rounded bg-red-50 p-2 text-sm text-red-600">
                                        {errors.file}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={processing || !importData.file}
                                    className={`w-full rounded-lg px-4 py-3 font-medium transition-all ${
                                        processing || !importData.file
                                            ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:from-blue-700 hover:to-blue-800'
                                    }`}
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center gap-2">
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                            Mengupload...
                                        </div>
                                    ) : (
                                        'Mulai Import Data'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
