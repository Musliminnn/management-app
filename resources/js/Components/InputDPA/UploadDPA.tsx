import CustomButton from '@/Components/CustomButton';
import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';

interface ImportProgress {
    import_id: string;
    import_session: {
        filename: string;
        file_size: number;
        status: string;
        started_at: string;
        progress: number;
    };
    queue_status: {
        pending_jobs: number;
        failed_jobs: number;
        status: string;
    };
}

interface FileInfo {
    name: string;
    size: string;
    chunk_size: number;
}

export default function UploadDPA() {
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [importProgress, setImportProgress] = useState<ImportProgress | null>(
        null,
    );
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
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

    // Progress monitoring
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (importProgress?.import_id && isProcessing) {
            intervalId = setInterval(async () => {
                try {
                    const response = await fetch(
                        `/import/status?import_id=${importProgress.import_id}`,
                    );
                    const data = await response.json();

                    if (response.ok) {
                        setImportProgress(data);

                        // Stop polling if processing is complete
                        if (
                            data.queue_status.status === 'idle' &&
                            data.queue_status.pending_jobs === 0
                        ) {
                            setIsProcessing(false);
                            setTimeout(() => {
                                setImportProgress(null);
                                setFileInfo(null);
                            }, 3000);
                        }
                    }
                } catch (error) {
                    console.error('Error fetching import status:', error);
                }
            }, 2000);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [importProgress?.import_id, isProcessing]);

    const handleImportSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!importData.file) {
            alert('Pilih file terlebih dahulu!');
            return;
        }

        post(route('import.file'), {
            forceFormData: true,
            onSuccess: (response: any) => {
                const data = response.props?.flash?.data || response;

                if (data.success) {
                    setImportProgress({
                        import_id: data.import_id,
                        import_session: {
                            filename: data.file_info.name,
                            file_size: 0,
                            status: 'queued',
                            started_at: new Date().toISOString(),
                            progress: 0,
                        },
                        queue_status: {
                            pending_jobs: 1,
                            failed_jobs: 0,
                            status: 'processing',
                        },
                    });
                    setFileInfo(data.file_info);
                    setIsProcessing(true);
                }

                reset();
                setIsUploadOpen(false);
            },
            onError: (errors) => {
                console.error('Error saat upload:', errors);
                alert('Gagal mengunggah file. Silakan cek konsol.');
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
                alert('Hanya file Excel (.xlsx, .xls) yang diperbolehkan!');
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

    const getStatusColor = (status: string): string => {
        switch (status) {
            case 'processing':
                return 'text-blue-600';
            case 'completed':
                return 'text-green-600';
            case 'failed':
                return 'text-red-600';
            case 'idle':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

    const getStatusIcon = (status: string): string => {
        switch (status) {
            case 'processing':
                return '⏳';
            case 'completed':
                return '✅';
            case 'failed':
                return '❌';
            case 'idle':
                return '✅';
            default:
                return '⏸️';
        }
    };

    return (
        <div className="mb-10 rounded-lg border-2 border-dotted border-black/25 p-4">
            {/* Progress Monitor */}
            {importProgress && (
                <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-blue-800">
                            {getStatusIcon(importProgress.queue_status.status)}{' '}
                            Status Import
                        </h3>
                        <span
                            className={`text-sm font-medium ${getStatusColor(importProgress.queue_status.status)}`}
                        >
                            {importProgress.queue_status.status.toUpperCase()}
                        </span>
                    </div>

                    {fileInfo && (
                        <div className="mb-3 grid grid-cols-1 gap-4 md:grid-cols-3">
                            <div className="rounded bg-white p-3">
                                <div className="text-sm text-gray-600">
                                    File Name
                                </div>
                                <div className="truncate font-medium">
                                    {fileInfo.name}
                                </div>
                            </div>
                            <div className="rounded bg-white p-3">
                                <div className="text-sm text-gray-600">
                                    File Size
                                </div>
                                <div className="font-medium">
                                    {fileInfo.size}
                                </div>
                            </div>
                            <div className="rounded bg-white p-3">
                                <div className="text-sm text-gray-600">
                                    Chunk Size
                                </div>
                                <div className="font-medium">
                                    {fileInfo.chunk_size} rows
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="rounded bg-white p-3">
                            <div className="text-sm text-gray-600">
                                Antrian Jobs
                            </div>
                            <div className="text-lg font-medium">
                                {importProgress.queue_status.pending_jobs}
                            </div>
                        </div>
                        <div className="rounded bg-white p-3">
                            <div className="text-sm text-gray-600">
                                Failed Jobs
                            </div>
                            <div className="text-lg font-medium text-red-600">
                                {importProgress.queue_status.failed_jobs}
                            </div>
                        </div>
                    </div>

                    {isProcessing && (
                        <div className="mt-3">
                            <div className="flex items-center space-x-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"></div>
                                <span className="text-sm text-blue-600">
                                    Memproses data...
                                </span>
                            </div>
                            <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                                <div
                                    className="h-2 rounded-full bg-blue-600 transition-all duration-300"
                                    style={{
                                        width:
                                            importProgress.queue_status
                                                .pending_jobs > 0
                                                ? '50%'
                                                : '100%',
                                    }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-6">
                <CustomButton
                    variant="primary"
                    onClick={() => setIsUploadOpen(true)}
                    disabled={isProcessing}
                    className={
                        isProcessing ? 'cursor-not-allowed opacity-50' : ''
                    }
                >
                    {isProcessing
                        ? '⏳ Import Berjalan...'
                        : '📊 Import Anggaran'}
                </CustomButton>

                {isUploadOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="w-full max-w-md space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-2xl">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                                    📊 Import File Excel
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
                                    className={`relative rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
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
                                                        ✅{' '}
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
                                                        Drag & drop file Excel
                                                        di sini
                                                    </div>
                                                    <div className="text-sm">
                                                        atau klik untuk memilih
                                                        file
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-400">
                                                        Maksimal 50MB (.xlsx,
                                                        .xls)
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {errors.file && (
                                    <div className="mt-2 rounded bg-red-50 p-2 text-sm text-red-600">
                                        ❌ {errors.file}
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
                                        '🚀 Mulai Import'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                <CustomButton variant="secondary" disabled={isProcessing}>
                    📝 Ubah Anggaran
                </CustomButton>
                <CustomButton variant="outlined" disabled={isProcessing}>
                    🔄 Geser Anggaran
                </CustomButton>
            </div>
        </div>
    );
}
