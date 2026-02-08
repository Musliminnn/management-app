import ConfirmationDialog from '@/Components/ConfirmationDialog';
import CustomButton from '@/Components/CustomButton';
import { formatCurrency } from '@/helper/currency';
import { useAuth } from '@/hooks/useAuth';
import { ParentLayout } from '@/Layouts/MainLayout';
import {
    MenuEnum,
    RealisasiStatusColor,
    RealisasiStatusEnum,
    RealisasiStatusLabel,
} from '@/types/enums';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle, Edit, Trash2, XCircle } from 'lucide-react';
import { useState } from 'react';

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
    koefisien: number;
    harga_satuan: number;
    realisasi: number;
    tujuan_pembayaran: string;
    user_id: number;
    status: RealisasiStatusEnum;
    validated_by: number | null;
    validated_at: string | null;
    created_at: string;
    updated_at: string;
    kegiatan?: { kode: string; nama: string };
    sub_kegiatan?: { kode: string; nama: string };
    akun?: { kode: string; nama: string };
    user?: { id: number; name: string };
    validator?: { id: number; name: string };
}

interface Props {
    realisasiBelanja: {
        data: RealisasiBelanjaData[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

type DialogAction = 'approve' | 'reject' | 'delete' | null;

export default function Index({ realisasiBelanja }: Props) {
    const { canAdd, canEdit, canDelete, canValidate } = useAuth();

    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogAction, setDialogAction] = useState<DialogAction>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [processing, setProcessing] = useState(false);

    const openDialog = (action: DialogAction, id: number) => {
        setDialogAction(action);
        setSelectedId(id);
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setDialogAction(null);
        setSelectedId(null);
    };

    const handleConfirm = () => {
        if (!selectedId || !dialogAction) return;

        setProcessing(true);

        const actions = {
            approve: () =>
                router.post(`/realisasi-belanja/${selectedId}/validate`, {}, {
                    onFinish: () => {
                        setProcessing(false);
                        closeDialog();
                    },
                }),
            reject: () =>
                router.post(`/realisasi-belanja/${selectedId}/reject`, {}, {
                    onFinish: () => {
                        setProcessing(false);
                        closeDialog();
                    },
                }),
            delete: () =>
                router.delete(`/realisasi-belanja/${selectedId}`, {
                    onFinish: () => {
                        setProcessing(false);
                        closeDialog();
                    },
                }),
        };

        actions[dialogAction]?.();
    };

    const getDialogConfig = () => {
        switch (dialogAction) {
            case 'approve':
                return {
                    title: 'Setujui Realisasi Belanja',
                    message:
                        'Apakah Anda yakin ingin menyetujui data realisasi belanja ini? Data yang sudah disetujui akan masuk ke laporan.',
                    type: 'approve' as const,
                    confirmText: 'Ya, Setujui',
                };
            case 'reject':
                return {
                    title: 'Tolak Realisasi Belanja',
                    message:
                        'Apakah Anda yakin ingin menolak data realisasi belanja ini? Data yang ditolak tidak akan masuk ke laporan.',
                    type: 'reject' as const,
                    confirmText: 'Ya, Tolak',
                };
            case 'delete':
                return {
                    title: 'Hapus Realisasi Belanja',
                    message:
                        'Apakah Anda yakin ingin menghapus data realisasi belanja ini? Tindakan ini tidak dapat dibatalkan.',
                    type: 'delete' as const,
                    confirmText: 'Ya, Hapus',
                };
            default:
                return {
                    title: '',
                    message: '',
                    type: 'confirm' as const,
                    confirmText: 'Ya',
                };
        }
    };

    const getStatusBadge = (status: RealisasiStatusEnum) => {
        const colors = RealisasiStatusColor[status] || {
            bg: 'bg-gray-100',
            text: 'text-gray-800',
        };
        const label = RealisasiStatusLabel[status] || status;

        return (
            <span
                className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${colors.bg} ${colors.text}`}
            >
                {label}
            </span>
        );
    };

    return (
        <ParentLayout>
            <Head title="Input Realisasi Belanja" />

            <div className="max-w-full overflow-x-auto p-1">
                <div className="rounded-lg border border-gray-100 bg-white shadow-md">
                    <div className="rounded-t-lg bg-gradient-to-r from-main to-main/90 p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-white">
                                    Input Realisasi Belanja
                                </h2>
                                <p className="mt-1 text-sm text-white/90">
                                    Kelola data realisasi belanja dan laporan
                                    keuangan
                                </p>
                            </div>
                            {canAdd(MenuEnum.InputRealisasiBelanja) && (
                                <Link href="/realisasi-belanja/create">
                                    <CustomButton
                                        variant="secondary"
                                        className="flex items-center gap-2 border-white/30 bg-white/10 px-4 py-2 text-white transition-all duration-200 hover:bg-white/20"
                                    >
                                        <svg
                                            className="h-4 w-4"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4v16m8-8H4"
                                            />
                                        </svg>
                                        Tambah Realisasi
                                    </CustomButton>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-main/5">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-main">
                                        No
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-main">
                                        Tanggal
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-main">
                                        Kegiatan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-main">
                                        Sub Kegiatan
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-main">
                                        Akun
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-main">
                                        Realisasi
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-main">
                                        Tujuan Pembayaran
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-main">
                                        Input Oleh
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-main">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-main">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {realisasiBelanja.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={10}
                                            className="px-6 py-12 text-center text-gray-500"
                                        >
                                            <div className="flex flex-col items-center">
                                                <svg
                                                    className="mb-4 h-12 w-12 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                                <p className="mb-2 text-lg font-medium text-gray-900">
                                                    Belum ada data realisasi
                                                    belanja
                                                </p>
                                                <p className="text-gray-500">
                                                    Mulai dengan menambah
                                                    realisasi belanja pertama
                                                    Anda
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    realisasiBelanja.data.map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className="cursor-pointer hover:bg-gray-50"
                                            onClick={() =>
                                                router.visit(
                                                    `/realisasi-belanja/${item.id}`,
                                                )
                                            }
                                        >
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {(realisasiBelanja.current_page -
                                                    1) *
                                                    realisasiBelanja.per_page +
                                                    index +
                                                    1}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {new Date(
                                                    item.tanggal,
                                                ).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div
                                                    className="max-w-xs truncate"
                                                    title={item.kegiatan?.nama}
                                                >
                                                    {item.kegiatan?.nama || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div
                                                    className="max-w-xs truncate"
                                                    title={
                                                        item.sub_kegiatan?.nama
                                                    }
                                                >
                                                    {item.sub_kegiatan?.nama ||
                                                        '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div
                                                    className="max-w-xs truncate"
                                                    title={item.akun?.nama}
                                                >
                                                    {item.akun?.nama || '-'}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                                                {formatCurrency(item.realisasi)}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div
                                                    className="max-w-xs truncate"
                                                    title={
                                                        item.tujuan_pembayaran
                                                    }
                                                >
                                                    {item.tujuan_pembayaran}
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                                                {item.user?.name || '-'}
                                            </td>
                                            <td className="whitespace-nowrap px-6 py-4 text-sm">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td
                                                className="whitespace-nowrap px-6 py-4 text-sm font-medium"
                                                onClick={(e) =>
                                                    e.stopPropagation()
                                                }
                                            >
                                                <div className="flex items-center gap-1">
                                                    {/* Edit Button - Only for Pending */}
                                                    {canEdit(
                                                        MenuEnum.InputRealisasiBelanja,
                                                    ) &&
                                                        item.status ===
                                                            RealisasiStatusEnum.Pending && (
                                                            <Link
                                                                href={`/realisasi-belanja/${item.id}/edit`}
                                                                className="inline-flex items-center justify-center rounded-lg border border-yellow-200 bg-yellow-50 p-2 text-yellow-600 transition-all hover:bg-yellow-100 hover:text-yellow-700"
                                                                title="Edit Data"
                                                            >
                                                                <Edit className="h-4 w-4" />
                                                            </Link>
                                                        )}

                                                    {/* Delete Button - Only for Pending */}
                                                    {canDelete(
                                                        MenuEnum.InputRealisasiBelanja,
                                                    ) &&
                                                        item.status ===
                                                            RealisasiStatusEnum.Pending && (
                                                            <button
                                                                className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition-all hover:bg-red-100 hover:text-red-700"
                                                                onClick={() =>
                                                                    openDialog(
                                                                        'delete',
                                                                        item.id,
                                                                    )
                                                                }
                                                                title="Hapus Data"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}

                                                    {/* Validation Buttons - Only for Pending and users with validate permission */}
                                                    {canValidate(
                                                        MenuEnum.InputRealisasiBelanja,
                                                    ) &&
                                                        item.status ===
                                                            RealisasiStatusEnum.Pending && (
                                                            <>
                                                                <button
                                                                    className="inline-flex items-center justify-center rounded-lg border border-green-200 bg-green-50 p-2 text-green-600 transition-all hover:bg-green-100 hover:text-green-700"
                                                                    onClick={() =>
                                                                        openDialog(
                                                                            'approve',
                                                                            item.id,
                                                                        )
                                                                    }
                                                                    title="Setujui / Validasi"
                                                                >
                                                                    <CheckCircle className="h-4 w-4" />
                                                                </button>
                                                                <button
                                                                    className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-red-50 p-2 text-red-600 transition-all hover:bg-red-100 hover:text-red-700"
                                                                    onClick={() =>
                                                                        openDialog(
                                                                            'reject',
                                                                            item.id,
                                                                        )
                                                                    }
                                                                    title="Tolak"
                                                                >
                                                                    <XCircle className="h-4 w-4" />
                                                                </button>
                                                            </>
                                                        )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {realisasiBelanja.last_page > 1 && (
                        <div className="rounded-b-lg border-t border-gray-200 bg-main/5 px-6 py-3">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700">
                                    Menampilkan{' '}
                                    {(realisasiBelanja.current_page - 1) *
                                        realisasiBelanja.per_page +
                                        1}{' '}
                                    -{' '}
                                    {Math.min(
                                        realisasiBelanja.current_page *
                                            realisasiBelanja.per_page,
                                        realisasiBelanja.total,
                                    )}{' '}
                                    dari {realisasiBelanja.total} data
                                </div>
                                <div className="flex space-x-1">
                                    {Array.from(
                                        { length: realisasiBelanja.last_page },
                                        (_, i) => i + 1,
                                    ).map((page) => (
                                        <Link
                                            key={page}
                                            href={`/realisasi-belanja?page=${page}`}
                                            className={`rounded px-3 py-1 text-sm font-medium transition-all duration-200 ${
                                                page ===
                                                realisasiBelanja.current_page
                                                    ? 'bg-main text-white shadow-sm'
                                                    : 'border border-gray-200 bg-white text-gray-700 hover:bg-main/10 hover:text-main'
                                            }`}
                                        >
                                            {page}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
                isOpen={dialogOpen}
                onClose={closeDialog}
                onConfirm={handleConfirm}
                processing={processing}
                {...getDialogConfig()}
            />
        </ParentLayout>
    );
}
