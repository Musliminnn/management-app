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

    post(route('import.subkegiatan'), {
      forceFormData: true,
      onSuccess: () => {
        alert('Berhasil diimport!');
        setData('file', null);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <div>
        <input
          type="file"
          name="file"
          accept=".xlsx,.xls"
          onChange={(e) => setData('file', e.target.files?.[0] || null)}
          required
        />
        {errors.file && <div className="text-red-600">{errors.file}</div>}
      </div>

      <button type="submit" disabled={processing}>
        {processing ? 'Mengupload...' : 'Import'}
      </button>
    </form>
  );
}
