import CustomButton from '@/Components/CustomButton';
import CascadingFilter from '@/Components/InputDPA/CascadingFilter';
import UploadDPA from '@/Components/InputDPA/UploadDPA';
import { ParentLayout } from '@/Layouts/MainLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { Download, EyeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function InputDPA() {
    const [isLoading, setIsLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Legacy filters (for backward compatibility)
    const [filters, setFilters] = useState<{
        program: string | null;
        subKegiatan: string | null;
        sumberDana: string | null;
    }>({
        program: null,
        subKegiatan: null,
        sumberDana: null,
    });

    const page = usePage();
    const props = usePage().props as any;

    // Use cascading filters if available, otherwise fall back to legacy filters
    const cascadingFilters = props.cascadingFilters || {
        program: null,
        kegiatan: null,
        subKegiatan: null,
        skpd: null,
        unitSkpd: null,
        sumberDana: null,
    };

    const filterKey = props.cascadingFilters
        ? `${cascadingFilters.program ?? ''}-${cascadingFilters.kegiatan ?? ''}-${cascadingFilters.subKegiatan ?? ''}-${cascadingFilters.skpd ?? ''}-${cascadingFilters.unitSkpd ?? ''}-${cascadingFilters.sumberDana ?? ''}`
        : `${props.filters?.program ?? ''}-${props.filters?.subKegiatan ?? ''}-${props.filters?.sumberDana ?? ''}`;

    const data = (page.props as any).data as Record<string, any>[];
    const pagination = (page.props as any).pagination;

    // Get filter lists - use cascading if available
    const programList = (page.props as any).programList || [];
    const kegiatanList = (page.props as any).kegiatanList || [];
    const subKegiatanList = (page.props as any).subKegiatanList || [];
    const skpdList = (page.props as any).skpdList || [];
    const unitSkpdList = (page.props as any).unitSkpdList || [];
    const sumberDanaList = (page.props as any).sumberDanaList || [];

    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    const [visibleColumns, setVisibleColumns] = useState<string[]>(columns);

    const hasActiveFilter = props.cascadingFilters
        ? Object.values(cascadingFilters).some((value: any) => value !== null)
        : filters.program !== null ||
          filters.subKegiatan !== null ||
          filters.sumberDana !== null;

    const handleFilterChange = (
        key: keyof typeof filters,
        value: string | null,
    ) => {
        const newFilters = {
            ...filters,
            [key]: value,
        };
        setFilters(newFilters);
        setIsLoading(true);

        router.post(route('inputdpa.filter'), newFilters, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
            onFinish: () => {
                setIsLoading(false);
            },
        });
    };

    const resetAllFilters = () => {
        setIsLoading(true);
        setFilters({
            program: null,
            subKegiatan: null,
            sumberDana: null,
        });

        router.post(
            route('inputdpa.reset'),
            {},
            {
                preserveScroll: true,
                preserveState: false,
                replace: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleExport = () => {
        setIsLoading(true);

        const params = new URLSearchParams();
        visibleColumns.forEach((col) => {
            params.append('visibleColumns[]', col);
        });

        const url = `${route('inputdpa.export')}?${params.toString()}`;
        window.open(url, '_blank');

        setTimeout(() => setIsLoading(false), 1000);
    };

    const onPageChange = (pageUrl: string) => {
        const urlObj = new URL(pageUrl);
        const page = urlObj.searchParams.get('page');

        setIsLoading(true);
        router.visit(route('inputdpa'), {
            data: { page },
            preserveScroll: true,
            preserveState: true,
            replace: true,
            only: [
                'data',
                'pagination',
                'programList',
                'subKegiatanList',
                'sumberDanaList',
            ],
            onFinish: () => setIsLoading(false),
        });
    };

    useEffect(() => {
        const initialFilters =
            (page.props as any).filters || (page.props as any).cascadingFilters;
        if ((page.props as any).filters) {
            setFilters(initialFilters);
        }
    }, [page.props]);

    return (
        <ParentLayout key={filterKey}>
            <div className="max-w-full overflow-x-auto p-1">
                <UploadDPA />
                {data.length !== 0 && (
                    <>
                        <CascadingFilter
                            initialFilters={cascadingFilters}
                            programList={programList}
                            kegiatanList={kegiatanList}
                            subKegiatanList={subKegiatanList}
                            skpdList={skpdList}
                            unitSkpdList={unitSkpdList}
                            sumberDanaList={sumberDanaList}
                        />

                        <div className="mb-5 flex flex-wrap gap-4">
                            <CustomButton
                                variant="shadow"
                                className="flex items-center justify-center gap-2"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <span>Tampilkan</span>
                                <EyeIcon className="size-4" />
                            </CustomButton>

                            <CustomButton
                                variant="primary"
                                className="flex items-center justify-center gap-2"
                                onClick={handleExport}
                                disabled={
                                    visibleColumns.length === 0 || isLoading
                                }
                            >
                                <span>
                                    {isLoading ? 'Mengunduh...' : 'Export CSV'}
                                </span>
                                <Download className="size-4" />
                            </CustomButton>
                        </div>
                    </>
                )}

                {isDialogOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-5xl rounded-lg bg-white p-6 shadow-lg">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold">
                                    Filter Tampilkan
                                </h2>
                                <div className="flex items-center gap-2">
                                    <CustomButton
                                        variant="outlined"
                                        className="text-sm"
                                        onClick={() =>
                                            setVisibleColumns(columns)
                                        }
                                    >
                                        Pilih Semua
                                    </CustomButton>
                                    <CustomButton
                                        variant="outlined"
                                        className="text-sm"
                                        onClick={() => setVisibleColumns([])}
                                    >
                                        Hapus Semua
                                    </CustomButton>
                                    <button
                                        onClick={() => setIsDialogOpen(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>
                            <div className="mb-4 grid max-w-full grid-cols-4 gap-2 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10">
                                {columns.map((col) => (
                                    <CustomButton
                                        key={col}
                                        variant={
                                            visibleColumns.includes(col)
                                                ? 'secondary'
                                                : 'outlined'
                                        }
                                        className="flex items-center justify-center text-xs"
                                        onClick={() => {
                                            const isVisible =
                                                visibleColumns.includes(col);
                                            if (isVisible) {
                                                setVisibleColumns(
                                                    visibleColumns.filter(
                                                        (c) => c !== col,
                                                    ),
                                                );
                                            } else {
                                                const newSet = new Set([
                                                    ...visibleColumns,
                                                    col,
                                                ]);
                                                const ordered = columns.filter(
                                                    (c) => newSet.has(c),
                                                );
                                                setVisibleColumns(ordered);
                                            }
                                        }}
                                    >
                                        <span>
                                            {col
                                                .replace(/_/g, ' ')
                                                .toUpperCase()}
                                        </span>
                                    </CustomButton>
                                ))}
                            </div>
                            <div className="flex justify-end gap-2">
                                <CustomButton
                                    variant="outlined"
                                    onClick={() => setIsDialogOpen(false)}
                                >
                                    Tutup
                                </CustomButton>
                                <CustomButton
                                    variant="primary"
                                    onClick={() => {
                                        setIsDialogOpen(false);
                                    }}
                                >
                                    Simpan
                                </CustomButton>
                            </div>
                        </div>
                    </div>
                )}

                {data.length === 0 ? (
                    <div className="flex h-40 items-center justify-center rounded border border-dashed border-gray-400 bg-gray-50 text-gray-500">
                        Silahkan Import Data Anggaran
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded border">
                        <table className="w-full min-w-[1500px] table-auto border border-gray-300 text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    {visibleColumns.map((col) => (
                                        <th
                                            key={col}
                                            className="whitespace-nowrap border-b px-3 py-2 text-left"
                                        >
                                            {col
                                                .replace(/_/g, ' ')
                                                .toUpperCase()}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className="hover:bg-gray-50"
                                    >
                                        {visibleColumns.map((col) => (
                                            <td
                                                key={col}
                                                className="whitespace-nowrap border-b px-3 py-2"
                                            >
                                                {row[col] ?? '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {data.length !== 0 && (
                    <div className="mt-4 flex justify-center gap-2">
                        {pagination.links.map((link: any, i: number) => {
                            return (
                                <Link
                                    key={i}
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (link.url) onPageChange(link.url);
                                    }}
                                    className={`rounded border px-3 py-1 text-sm ${
                                        link.active
                                            ? 'bg-main text-white'
                                            : link.url
                                              ? 'bg-white text-gray-700 hover:bg-gray-100'
                                              : 'cursor-not-allowed bg-gray-100 text-gray-400'
                                    }`}
                                    dangerouslySetInnerHTML={{
                                        __html: link.label,
                                    }}
                                />
                            );
                        })}
                    </div>
                )}
            </div>
        </ParentLayout>
    );
}
