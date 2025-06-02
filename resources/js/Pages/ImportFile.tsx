import { useForm } from '@inertiajs/react';
import React from 'react';

export default function ImportFile() {
    const { data, setData, post, processing, errors } = useForm<{
        file: File | null;
    }>({
        file: null,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!data.file) {
            alert('Pilih file terlebih dahulu!');
            return;
        }

        post(route('import.file'), {
            forceFormData: true,
            onSuccess: () => {
                alert('File berhasil dikirim. Proses import sedang berlangsung via queue.');
                setData('file', null);
            },
            onError: (errors) => {
                console.error('Error saat upload:', errors);
                alert('Gagal mengunggah file. Silakan cek konsol.');
            },
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            encType="multipart/form-data"
            className="max-w-lg mx-auto space-y-4 p-6 bg-white rounded shadow"
        >
            <div>
                <label className="block font-semibold mb-1">File Excel</label>
                <input
                    type="file"
                    name="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setData('file', e.target.files?.[0] || null)}
                    required
                    className="border rounded p-2 w-full"
                />
                {errors.file && <div className="text-red-600 mt-1">{errors.file}</div>}
            </div>

            <div>
                <button
                    type="submit"
                    disabled={processing}
                    className={`w-full px-4 py-2 rounded ${
                        processing ? 'bg-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                >
                    {processing ? 'Mengupload...' : 'Import Sekarang'}
                </button>
            </div>
        </form>
    );
}
