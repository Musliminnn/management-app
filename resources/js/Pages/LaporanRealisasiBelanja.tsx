import CustomButton from '@/Components/CustomButton';
import { FilterDropdown } from '@/Components/InputDPA/FilterDropdown';
import { formatCurrency } from '@/helper/currency';
import { ParentLayout } from '@/Layouts/MainLayout';
import { router } from '@inertiajs/react';
import { Download, FileText, RefreshCw } from 'lucide-react';
import { useEffect, useState } from 'react';

type FilterData = {
    kode: string;
    nama: string;
};

type CascadingFilters = {
    program: string | null;
    kegiatan: string | null;
    subKegiatan: string | null;
};

type ReportRow = {
    kode_akun: string;
    nama_akun: string;
    nama_standar: string;
    spesifikasi: string;
    kelompok_belanja: string;
    sumber_dana: string;
    anggaran: number;
    realisasi: number;
    sisa_anggaran: number;
};

type HeaderInfo = {
    program: string;
    kegiatan: string;
    sub_kegiatan: string;
};

type Totals = {
    anggaran: number;
    realisasi: number;
    sisa_anggaran: number;
};

interface Props {
    cascadingFilters: CascadingFilters;
    programList: FilterData[];
    kegiatanList: FilterData[];
    subKegiatanList: FilterData[];
    reportData: ReportRow[] | null;
    headerInfo: HeaderInfo | null;
    totals: Totals | null;
}

export default function LaporanRealisasiBelanja({
    cascadingFilters: initialFilters,
    programList,
    kegiatanList,
    subKegiatanList,
    reportData,
    headerInfo,
    totals,
}: Props) {

    const [filters, setFilters] = useState<CascadingFilters>(initialFilters);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    const handleFilterChange = (
        key: keyof CascadingFilters,
        value: string | null,
    ) => {
        let newFilters = { ...filters, [key]: value };

        // Reset dependent filters when parent filter changes
        if (key === 'program') {
            newFilters = {
                ...newFilters,
                kegiatan: null,
                subKegiatan: null,
            };
        } else if (key === 'kegiatan') {
            newFilters = {
                ...newFilters,
                subKegiatan: null,
            };
        }

        setFilters(newFilters);
        setIsLoading(true);

        router.post(route('laporan-realisasi-belanja.cascading-filter'), newFilters, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
            onFinish: () => setIsLoading(false),
        });
    };

    const resetAllFilters = () => {
        setIsLoading(true);
        router.post(
            route('laporan-realisasi-belanja.reset'),
            {},
            {
                preserveScroll: true,
                preserveState: false,
                replace: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleExportPdf = () => {
        setIsLoading(true);
        window.open(route('laporan-realisasi-belanja.export-pdf'), '_blank');
        setTimeout(() => setIsLoading(false), 1000);
    };

    const hasActiveFilter = Object.values(filters).some((value) => value !== null);

    return (
        <ParentLayout>
            <div className="max-w-full overflow-x-auto p-1">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">
                        Laporan Realisasi Belanja
                    </h1>
                    <p className="text-sm text-gray-500">
                        Pilih Program, Kegiatan, dan Sub Kegiatan untuk melihat laporan
                    </p>
                </div>

                {/* Filter Section */}
                <div className="mb-6 space-y-4">
                    <div className="flex flex-wrap gap-4">
                        {/* Program Filter */}
                        <FilterDropdown
                            model={programList}
                            value={filters.program}
                            placeholder="Program"
                            onSelect={(kode) => handleFilterChange('program', kode)}
                        />

                        {/* Kegiatan Filter */}
                        <div className="relative">
                            <FilterDropdown
                                model={filters.program ? kegiatanList : []}
                                value={filters.kegiatan}
                                placeholder="Kegiatan"
                                onSelect={
                                    filters.program
                                        ? (kode) => handleFilterChange('kegiatan', kode)
                                        : undefined
                                }
                            />
                            {!filters.program && (
                                <div className="absolute inset-0 cursor-not-allowed rounded bg-gray-100 bg-opacity-50" />
                            )}
                        </div>

                        {/* Sub Kegiatan Filter */}
                        <div className="relative">
                            <FilterDropdown
                                model={filters.kegiatan ? subKegiatanList : []}
                                value={filters.subKegiatan}
                                placeholder="Sub Kegiatan"
                                onSelect={
                                    filters.kegiatan
                                        ? (kode) => handleFilterChange('subKegiatan', kode)
                                        : undefined
                                }
                            />
                            {!filters.kegiatan && (
                                <div className="absolute inset-0 cursor-not-allowed rounded bg-gray-100 bg-opacity-50" />
                            )}
                        </div>

                        {/* Export PDF Button */}
                        {reportData && reportData.length > 0 && (
                            <CustomButton
                                variant="secondary"
                                className="flex items-center justify-center gap-2"
                                onClick={handleExportPdf}
                                disabled={isLoading}
                            >
                                <span>{isLoading ? 'Mengunduh...' : 'Export PDF'}</span>
                                <Download className="size-4" />
                            </CustomButton>
                        )}

                        {/* Reset Button */}
                        {hasActiveFilter && (
                            <CustomButton
                                variant="outlined"
                                className="flex items-center gap-2 border border-red-400 text-red-600"
                                onClick={resetAllFilters}
                                disabled={isLoading}
                            >
                                <RefreshCw className="size-4" />
                                <span>{isLoading ? 'Mereset...' : 'Reset Filter'}</span>
                            </CustomButton>
                        )}
                    </div>
                </div>

                {/* Report Content */}
                {!filters.subKegiatan ? (
                    <div className="flex h-60 flex-col items-center justify-center rounded border border-dashed border-gray-400 bg-gray-50 text-gray-500">
                        <FileText className="mb-2 size-12 text-gray-300" />
                        <p>Silahkan pilih Program, Kegiatan, dan Sub Kegiatan</p>
                        <p className="text-sm">untuk menampilkan laporan realisasi belanja</p>
                    </div>
                ) : reportData && reportData.length > 0 ? (
                    <>
                        {/* Header Info */}
                        {headerInfo && (
                            <div className="mb-4 rounded border bg-blue-50 p-4">
                                <h2 className="mb-2 font-semibold text-blue-800">
                                    Informasi Laporan
                                </h2>
                                <div className="grid gap-2 text-sm">
                                    <div className="flex">
                                        <span className="w-32 font-medium text-gray-600">
                                            Program
                                        </span>
                                        <span className="text-gray-800">
                                            : {headerInfo.program}
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-32 font-medium text-gray-600">
                                            Kegiatan
                                        </span>
                                        <span className="text-gray-800">
                                            : {headerInfo.kegiatan}
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <span className="w-32 font-medium text-gray-600">
                                            Sub Kegiatan
                                        </span>
                                        <span className="text-gray-800">
                                            : {headerInfo.sub_kegiatan}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Report Table */}
                        <div className="overflow-x-auto rounded border">
                            <table className="w-full min-w-[1200px] table-auto border border-gray-300 text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="whitespace-nowrap border-b px-3 py-2 text-center">
                                            No
                                        </th>
                                        <th className="whitespace-nowrap border-b px-3 py-2 text-center">
                                            Kode Akun
                                        </th>
                                        <th className="whitespace-nowrap border-b px-3 py-2 text-center">
                                            Nama Akun
                                        </th>
                                        <th className="whitespace-nowrap border-b px-3 py-2 text-center">
                                            Nama Standar
                                        </th>
                                        <th className="whitespace-nowrap border-b px-3 py-2 text-center">
                                            Spesifikasi
                                        </th>
                                        <th className="whitespace-nowrap border-b px-3 py-2 text-center">
                                            Anggaran
                                        </th>
                                        <th className="whitespace-nowrap border-b px-3 py-2 text-center">
                                            Realisasi
                                        </th>
                                        <th className="whitespace-nowrap border-b px-3 py-2 text-center">
                                            Sisa Anggaran
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {reportData.map((row, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="whitespace-nowrap border-b px-3 py-2 text-center">
                                                {index + 1}
                                            </td>
                                            <td className="whitespace-nowrap border-b px-3 py-2 text-center">
                                                {row.kode_akun}
                                            </td>
                                            <td className="border-b px-3 py-2">
                                                {row.nama_akun}
                                            </td>
                                            <td className="border-b px-3 py-2">
                                                {row.nama_standar || '-'}
                                            </td>
                                            <td className="border-b px-3 py-2">
                                                {row.spesifikasi || '-'}
                                            </td>
                                            <td className="whitespace-nowrap border-b px-3 py-2 text-right">
                                                Rp {formatCurrency(row.anggaran)}
                                            </td>
                                            <td className="whitespace-nowrap border-b px-3 py-2 text-right">
                                                Rp {formatCurrency(row.realisasi)}
                                            </td>
                                            <td
                                                className={`whitespace-nowrap border-b px-3 py-2 text-right ${
                                                    row.sisa_anggaran < 0
                                                        ? 'text-red-600'
                                                        : 'text-green-600'
                                                }`}
                                            >
                                                Rp {formatCurrency(row.sisa_anggaran)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                {totals && (
                                    <tfoot className="bg-gray-100 font-semibold">
                                        <tr>
                                            <td
                                                colSpan={5}
                                                className="border-t px-3 py-2 text-right"
                                            >
                                                TOTAL
                                            </td>
                                            <td className="whitespace-nowrap border-t px-3 py-2 text-right">
                                                Rp {formatCurrency(totals.anggaran)}
                                            </td>
                                            <td className="whitespace-nowrap border-t px-3 py-2 text-right">
                                                Rp {formatCurrency(totals.realisasi)}
                                            </td>
                                            <td
                                                className={`whitespace-nowrap border-t px-3 py-2 text-right ${
                                                    totals.sisa_anggaran < 0
                                                        ? 'text-red-600'
                                                        : 'text-green-600'
                                                }`}
                                            >
                                                Rp {formatCurrency(totals.sisa_anggaran)}
                                            </td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>

                        {/* Summary Cards */}
                        {totals && (
                            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded border bg-blue-50 p-4">
                                    <div className="text-sm text-blue-600">Total Anggaran</div>
                                    <div className="text-xl font-bold text-blue-800">
                                        Rp {formatCurrency(totals.anggaran)}
                                    </div>
                                </div>
                                <div className="rounded border bg-orange-50 p-4">
                                    <div className="text-sm text-orange-600">Total Realisasi</div>
                                    <div className="text-xl font-bold text-orange-800">
                                        Rp {formatCurrency(totals.realisasi)}
                                    </div>
                                </div>
                                <div
                                    className={`rounded border p-4 ${
                                        totals.sisa_anggaran < 0
                                            ? 'bg-red-50'
                                            : 'bg-green-50'
                                    }`}
                                >
                                    <div
                                        className={`text-sm ${
                                            totals.sisa_anggaran < 0
                                                ? 'text-red-600'
                                                : 'text-green-600'
                                        }`}
                                    >
                                        Sisa Anggaran
                                    </div>
                                    <div
                                        className={`text-xl font-bold ${
                                            totals.sisa_anggaran < 0
                                                ? 'text-red-800'
                                                : 'text-green-800'
                                        }`}
                                    >
                                        Rp {formatCurrency(totals.sisa_anggaran)}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex h-40 flex-col items-center justify-center rounded border border-dashed border-gray-400 bg-gray-50 text-gray-500">
                        <FileText className="mb-2 size-8 text-gray-300" />
                        <p>Tidak ada data realisasi belanja untuk sub kegiatan ini</p>
                    </div>
                )}
            </div>
        </ParentLayout>
    );
}
