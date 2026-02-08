import CustomButton from '@/Components/CustomButton';
import CascadingFilter from '@/Components/InputDPA/CascadingFilter';
import EditDPAModal from '@/Components/InputDPA/EditDPAModal';
import UploadDPA from '@/Components/InputDPA/UploadDPA';
import { formatCurrency } from '@/helper/currency';
import { useFilters } from '@/hooks';
import { ParentLayout } from '@/Layouts/MainLayout';
import { useDataTableStore, useUIStore } from '@/stores';
import { router } from '@inertiajs/react';
import { useState } from 'react';

export default function InputDPA() {
    // State untuk edit modal
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<Record<string, any> | null>(
        null,
    );

    // Use Zustand stores
    const { isLoading, modals, openModal, closeModal, setLoading } =
        useUIStore();
    const {
        data,
        grandTotal,
        pagination,
        visibleColumns,
        setVisibleColumns,
        getTotalValue,
    } = useDataTableStore();

    const {
        cascadingFilters,
        legacyFilters,
        filterOptions,
        hasActiveFilter,
        filterKey,
        applyCascadingFilters,
        applyLegacyFilters,
        clearAllFilters,
    } = useFilters();

    const isDialogOpen = modals.uploadDialog || false;

    // Function to calculate total harga from all data (not just current page)
    const calculateTotalHarga = () => {
        // If backend provides grand total, use it
        if (grandTotal) {
            return grandTotal;
        }

        // Otherwise, calculate from current page data (fallback)
        return data.reduce((total, row) => {
            const totalHarga = parseFloat(
                row.total_harga || row['total harga'] || 0,
            );
            return total + (isNaN(totalHarga) ? 0 : totalHarga);
        }, 0);
    };

    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    const handleFilterChange = (key: string, value: string | null) => {
        const newFilters = {
            [key]: value,
        };
        applyLegacyFilters(newFilters);
    };

    const resetAllFilters = () => {
        clearAllFilters();
    };

    const handleExport = () => {
        setLoading(true, 'Exporting data...');

        const params = new URLSearchParams();
        visibleColumns.forEach((col) => {
            params.append('visibleColumns[]', col);
        });

        const url = `${route('inputdpa.export')}?${params.toString()}`;
        window.open(url, '_blank');

        setTimeout(() => setLoading(false), 1000);
    };

    const onPageChange = (pageUrl: string) => {
        setLoading(true, 'Loading page...');

        // Use Inertia router for navigation
        router.visit(pageUrl, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
            onFinish: () => {
                setLoading(false);
            },
            onError: (errors) => {
                console.error('Navigation error:', errors);
                setLoading(false);
            },
        });
    };

    const handleRowClick = (row: Record<string, any>) => {
        setSelectedRow(row);
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedRow(null);
    };

    return (
        <ParentLayout key={filterKey}>
            <div className="max-w-full overflow-x-auto p-1">
                <UploadDPA />
                {data.length !== 0 && (
                    <div className="mb-5">
                        <CascadingFilter
                            initialFilters={cascadingFilters}
                            programList={filterOptions.programList}
                            kegiatanList={filterOptions.kegiatanList}
                            subKegiatanList={filterOptions.subKegiatanList}
                            skpdList={filterOptions.skpdList}
                            unitSkpdList={filterOptions.unitSkpdList}
                            visibleColumns={visibleColumns}
                            isLoading={isLoading}
                            perPage={pagination.perPage}
                            onShowDialog={() => openModal('uploadDialog')}
                            onExport={handleExport}
                            onPerPageChange={() => {}} // Disabled for now
                        />
                    </div>
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
                                    variant="primary"
                                    onClick={() => {
                                        closeModal('uploadDialog');
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
                    <>
                        <div className="overflow-x-auto rounded border">
                            <table className="w-full min-w-[1500px] table-auto border border-gray-300 text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {visibleColumns.map((col) => (
                                            <th
                                                key={col}
                                                className="whitespace-nowrap border-b px-3 py-2 text-center"
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
                                            className="cursor-pointer hover:bg-blue-50"
                                            onClick={() => handleRowClick(row)}
                                            title="Klik untuk mengubah data"
                                        >
                                            {visibleColumns.map((col) => {
                                                let cellValue = row[col] ?? '-';

                                                // Format currency for price columns
                                                if (
                                                    (col
                                                        .toLowerCase()
                                                        .includes('harga') ||
                                                        col
                                                            .toLowerCase()
                                                            .includes(
                                                                'satuan',
                                                            ) ||
                                                        col
                                                            .toLowerCase()
                                                            .includes(
                                                                'total',
                                                            )) &&
                                                    !col
                                                        .toLowerCase()
                                                        .includes('kode')
                                                ) {
                                                    if (
                                                        typeof cellValue ===
                                                            'number' ||
                                                        (typeof cellValue ===
                                                            'string' &&
                                                            !isNaN(
                                                                parseFloat(
                                                                    cellValue,
                                                                ),
                                                            ))
                                                    ) {
                                                        cellValue =
                                                            formatCurrency(
                                                                cellValue,
                                                            );
                                                    }
                                                }

                                                return (
                                                    <td
                                                        key={col}
                                                        className="whitespace-nowrap border-b px-3 py-2 text-center"
                                                    >
                                                        {cellValue}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="mt-1 flex justify-end">
                            <div className="rounded border bg-main/10 px-3 py-2 shadow-sm">
                                <div className="text-sm font-semibold text-main">
                                    Jumlah Total Harga: Rp{' '}
                                    {formatCurrency(calculateTotalHarga())}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Laravel Pagination */}
                {data.length !== 0 && pagination.links && (
                    <div className="mt-4 flex justify-center gap-2">
                        {pagination.links.map((link: any, i: number) => {
                            return (
                                <button
                                    key={i}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (link.url) {
                                            onPageChange(link.url);
                                        }
                                    }}
                                    disabled={!link.url}
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

                {/* Edit DPA Modal */}
                <EditDPAModal
                    isOpen={isEditModalOpen}
                    onClose={handleCloseEditModal}
                    rowData={selectedRow}
                />
            </div>
        </ParentLayout>
    );
}
