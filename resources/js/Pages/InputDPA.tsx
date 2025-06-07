import CustomButton from '@/Components/CustomButton';
import { FilterDropdown } from '@/Components/InputDPA/FilterDropdown';
import { ParentLayout } from '@/Layouts/MainLayout';
import { usePage } from '@inertiajs/react';
import { EyeIcon } from 'lucide-react';
import { useState } from 'react';

export default function InputDPA() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
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
    const data = (page.props as any).data as Record<string, any>[];
    const programs = (page.props as any).programList as {
        kode: string;
        nama: string;
    }[];
    const subKegiatanList = (page.props as any).subKegiatanList as {
        kode: string;
        nama: string;
    }[];
    const sumberDanaList = (page.props as any).sumberDanaList as {
        kode: string;
        nama: string;
    }[];

    const columns = data.length > 0 ? Object.keys(data[0]) : [];
    const [visibleColumns, setVisibleColumns] = useState<string[]>(columns);

    const hasActiveFilter =
        filters.program !== null ||
        filters.subKegiatan !== null ||
        filters.sumberDana !== null;

    return (
        <ParentLayout>
            <div className="max-w-full overflow-x-auto p-1">
                <div className="mb-10 rounded-lg border-2 border-dotted border-black/25 p-4">
                    <div className="flex flex-wrap items-center justify-center gap-6">
                        <CustomButton variant="primary">
                            Import Anggaran
                        </CustomButton>
                        <CustomButton variant="secondary">
                            Ubah Anggaran
                        </CustomButton>
                        <CustomButton variant="outlined">
                            Geser Anggaran
                        </CustomButton>
                    </div>
                </div>
                <div className="mb-5 flex flex-wrap gap-4">
                    <FilterDropdown
                        model={programs}
                        value={filters.program}
                        placeholder="Pilih Program"
                        onSelect={(kode) =>
                            setFilters((prev) => ({ ...prev, program: kode }))
                        }
                    />

                    <FilterDropdown
                        model={subKegiatanList}
                        value={filters.subKegiatan}
                        placeholder="Sub Kegiatan"
                        onSelect={(kode) =>
                            setFilters((prev) => ({
                                ...prev,
                                subKegiatan: kode,
                            }))
                        }
                    />

                    <FilterDropdown
                        model={sumberDanaList}
                        value={filters.sumberDana}
                        placeholder="Sumber Dana"
                        onSelect={(kode) =>
                            setFilters((prev) => ({
                                ...prev,
                                sumberDana: kode,
                            }))
                        }
                    />

                    <CustomButton
                        variant="shadow"
                        className="gap-4"
                        onClick={() => setIsDialogOpen(true)}
                    >
                        <span>Tampilkan</span>
                        <EyeIcon className="size-5" />
                    </CustomButton>

                    {hasActiveFilter && (
                        <CustomButton
                            variant="outlined"
                            className="border border-red-400 text-red-600"
                            onClick={() =>
                                setFilters({
                                    program: null,
                                    subKegiatan: null,
                                    sumberDana: null,
                                })
                            }
                        >
                            Reset Filter
                        </CustomButton>
                    )}
                </div>
                
                {isDialogOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                        <div className="w-full max-w-5xl rounded-lg bg-white p-6 shadow-lg">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-bold">
                                    Filter Tampilkan
                                </h2>
                                <button
                                    onClick={() => setIsDialogOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>
                            <div className="mb-4 flex max-w-full flex-wrap gap-4">
                                {columns.map((col) => (
                                    <CustomButton
                                        key={col}
                                        variant={
                                            visibleColumns.includes(col)
                                                ? 'secondary'
                                                : 'shadow'
                                        }
                                        className="text-sm"
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
                                        {col.replace(/_/g, ' ').toUpperCase()}
                                    </CustomButton>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto rounded border">
                    <table className="w-full min-w-[1500px] table-auto border border-gray-300 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                {visibleColumns.map((col) => (
                                    <th
                                        key={col}
                                        className="whitespace-nowrap border-b px-3 py-2 text-left"
                                    >
                                        {col.replace(/_/g, ' ').toUpperCase()}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((row, rowIndex) => (
                                <tr key={rowIndex} className="hover:bg-gray-50">
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
            </div>
        </ParentLayout>
    );
}
