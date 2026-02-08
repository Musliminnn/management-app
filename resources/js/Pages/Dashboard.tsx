import { useAuth } from '@/hooks';
import { ParentLayout } from '@/Layouts/MainLayout';
import { formatCurrency } from '@/helper/currency';
import { Link } from '@inertiajs/react';
import {
    Wallet,
    TrendingUp,
    PiggyBank,
    FileText,
    Receipt,
    ArrowRight,
    BarChart3,
    Clock,
} from 'lucide-react';

interface Stats {
    totalAnggaran: number;
    totalRealisasi: number;
    sisaAnggaran: number;
    persentaseRealisasi: number;
    jumlahItemAnggaran: number;
    jumlahTransaksiRealisasi: number;
}

interface ProgramData {
    kode: string;
    nama: string;
    anggaran: number;
    realisasi: number;
    sisa: number;
    persentase: number;
    jumlah_item: number;
}

interface RecentRealisasi {
    id: number;
    tanggal: string;
    kegiatan: string;
    sub_kegiatan: string;
    realisasi: number;
    user: string;
}

interface Props {
    stats: Stats;
    anggaranPerProgram: ProgramData[];
    recentRealisasi: RecentRealisasi[];
    topProgramAnggaran: ProgramData[];
}

export default function Dashboard({
    stats,
    anggaranPerProgram,
    recentRealisasi,
    topProgramAnggaran,
}: Props) {
    const { user } = useAuth();

    // Progress bar color based on percentage
    const getProgressColor = (percentage: number) => {
        if (percentage < 25) return 'bg-red-500';
        if (percentage < 50) return 'bg-orange-500';
        if (percentage < 75) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    return (
        <ParentLayout>
            <div className="space-y-6 p-1">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            Dashboard
                        </h1>
                        <p className="text-sm text-gray-500">
                            Selamat datang, {user?.name}! Berikut ringkasan
                            anggaran dan realisasi.
                        </p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                        {new Date().toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {/* Total Anggaran */}
                    <div className="rounded-lg border bg-gradient-to-br from-blue-500 to-blue-600 p-5 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-100">
                                    Total Anggaran
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    Rp {formatCurrency(stats.totalAnggaran)}
                                </p>
                                <p className="mt-1 text-xs text-blue-200">
                                    {stats.jumlahItemAnggaran.toLocaleString(
                                        'id-ID',
                                    )}{' '}
                                    item anggaran
                                </p>
                            </div>
                            <div className="rounded-full bg-white/20 p-3">
                                <Wallet className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    {/* Total Realisasi */}
                    <div className="rounded-lg border bg-gradient-to-br from-green-500 to-green-600 p-5 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-100">
                                    Total Realisasi
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    Rp {formatCurrency(stats.totalRealisasi)}
                                </p>
                                <p className="mt-1 text-xs text-green-200">
                                    {stats.jumlahTransaksiRealisasi.toLocaleString(
                                        'id-ID',
                                    )}{' '}
                                    transaksi
                                </p>
                            </div>
                            <div className="rounded-full bg-white/20 p-3">
                                <TrendingUp className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    {/* Sisa Anggaran */}
                    <div className="rounded-lg border bg-gradient-to-br from-orange-500 to-orange-600 p-5 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-100">
                                    Sisa Anggaran
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    Rp {formatCurrency(stats.sisaAnggaran)}
                                </p>
                                <p className="mt-1 text-xs text-orange-200">
                                    {(100 - stats.persentaseRealisasi).toFixed(
                                        2,
                                    )}
                                    % belum terealisasi
                                </p>
                            </div>
                            <div className="rounded-full bg-white/20 p-3">
                                <PiggyBank className="h-6 w-6" />
                            </div>
                        </div>
                    </div>

                    {/* Persentase Realisasi */}
                    <div className="rounded-lg border bg-gradient-to-br from-purple-500 to-purple-600 p-5 text-white shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-100">
                                    Persentase Realisasi
                                </p>
                                <p className="mt-1 text-2xl font-bold">
                                    {stats.persentaseRealisasi}%
                                </p>
                                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/30">
                                    <div
                                        className="h-full rounded-full bg-white transition-all duration-500"
                                        style={{
                                            width: `${Math.min(stats.persentaseRealisasi, 100)}%`,
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="rounded-full bg-white/20 p-3">
                                <BarChart3 className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Anggaran per Program - Takes 2 columns */}
                    <div className="rounded-lg border bg-white p-5 shadow-sm lg:col-span-2">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                                <FileText className="h-5 w-5 text-main" />
                                Anggaran & Realisasi per Program
                            </h2>
                            <Link
                                href="/laporan-realisasi-belanja"
                                className="flex items-center gap-1 text-sm text-main hover:underline"
                            >
                                Lihat Laporan
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {anggaranPerProgram.length === 0 ? (
                            <div className="flex h-40 items-center justify-center text-gray-500">
                                Belum ada data anggaran
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {anggaranPerProgram.map((program) => (
                                    <div
                                        key={program.kode}
                                        className="rounded-lg border bg-gray-50 p-4"
                                    >
                                        <div className="mb-2 flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-xs font-medium text-gray-500">
                                                    {program.kode}
                                                </p>
                                                <p
                                                    className="line-clamp-1 text-sm font-semibold text-gray-800"
                                                    title={program.nama}
                                                >
                                                    {program.nama}
                                                </p>
                                            </div>
                                            <span
                                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                                    program.persentase >= 50
                                                        ? 'bg-green-100 text-green-700'
                                                        : program.persentase >=
                                                            25
                                                          ? 'bg-yellow-100 text-yellow-700'
                                                          : 'bg-red-100 text-red-700'
                                                }`}
                                            >
                                                {program.persentase}%
                                            </span>
                                        </div>

                                        <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-gray-200">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(program.persentase)}`}
                                                style={{
                                                    width: `${Math.min(program.persentase, 100)}%`,
                                                }}
                                            />
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-xs">
                                            <div>
                                                <p className="text-gray-500">
                                                    Anggaran
                                                </p>
                                                <p className="font-medium text-gray-800">
                                                    Rp{' '}
                                                    {formatCurrency(
                                                        program.anggaran,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">
                                                    Realisasi
                                                </p>
                                                <p className="font-medium text-green-600">
                                                    Rp{' '}
                                                    {formatCurrency(
                                                        program.realisasi,
                                                    )}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">
                                                    Sisa
                                                </p>
                                                <p className="font-medium text-orange-600">
                                                    Rp{' '}
                                                    {formatCurrency(
                                                        program.sisa,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Recent Realisasi - Takes 1 column */}
                    <div className="rounded-lg border bg-white p-5 shadow-sm">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                                <Clock className="h-5 w-5 text-main" />
                                Realisasi Terbaru
                            </h2>
                            <Link
                                href="/realisasi-belanja"
                                className="flex items-center gap-1 text-sm text-main hover:underline"
                            >
                                Lihat Semua
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {recentRealisasi.length === 0 ? (
                            <div className="flex h-40 items-center justify-center text-gray-500">
                                Belum ada transaksi realisasi
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {recentRealisasi.map((item) => (
                                    <div
                                        key={item.id}
                                        className="rounded-lg border bg-gray-50 p-3"
                                    >
                                        <div className="mb-1 flex items-center justify-between">
                                            <span className="text-xs text-gray-500">
                                                {item.tanggal}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                oleh {item.user}
                                            </span>
                                        </div>
                                        <p
                                            className="line-clamp-1 text-sm font-medium text-gray-800"
                                            title={item.sub_kegiatan}
                                        >
                                            {item.sub_kegiatan}
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-green-600">
                                            Rp {formatCurrency(item.realisasi)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="rounded-lg border bg-white p-5 shadow-sm">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
                        <Receipt className="h-5 w-5 text-main" />
                        Aksi Cepat
                    </h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Link
                            href="/input-dpa"
                            className="flex items-center gap-3 rounded-lg border bg-blue-50 p-4 transition-colors hover:bg-blue-100"
                        >
                            <div className="rounded-full bg-blue-500 p-2 text-white">
                                <FileText className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">
                                    Input DPA
                                </p>
                                <p className="text-xs text-gray-500">
                                    Kelola data anggaran
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/realisasi-belanja/create"
                            className="flex items-center gap-3 rounded-lg border bg-green-50 p-4 transition-colors hover:bg-green-100"
                        >
                            <div className="rounded-full bg-green-500 p-2 text-white">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">
                                    Input Realisasi
                                </p>
                                <p className="text-xs text-gray-500">
                                    Tambah transaksi baru
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/realisasi-belanja"
                            className="flex items-center gap-3 rounded-lg border bg-orange-50 p-4 transition-colors hover:bg-orange-100"
                        >
                            <div className="rounded-full bg-orange-500 p-2 text-white">
                                <Receipt className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">
                                    Daftar Realisasi
                                </p>
                                <p className="text-xs text-gray-500">
                                    Lihat semua transaksi
                                </p>
                            </div>
                        </Link>

                        <Link
                            href="/laporan-realisasi-belanja"
                            className="flex items-center gap-3 rounded-lg border bg-purple-50 p-4 transition-colors hover:bg-purple-100"
                        >
                            <div className="rounded-full bg-purple-500 p-2 text-white">
                                <BarChart3 className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-medium text-gray-800">
                                    Laporan
                                </p>
                                <p className="text-xs text-gray-500">
                                    Lihat laporan realisasi
                                </p>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </ParentLayout>
    );
}
