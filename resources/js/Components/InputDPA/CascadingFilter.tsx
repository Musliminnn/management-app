import CustomButton from '@/Components/CustomButton';
import { FilterDropdown } from '@/Components/InputDPA/FilterDropdown';
import { router } from '@inertiajs/react';
import { Download, EyeIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

type FilterData = {
    kode: string;
    nama: string;
};

type CascadingFilters = {
    program: string | null;
    kegiatan: string | null;
    subKegiatan: string | null;
    skpd: string | null;
    unitSkpd: string | null;
    sumberDana: string | null;
};

type Props = {
    initialFilters: CascadingFilters;
    programList: FilterData[];
    kegiatanList: FilterData[];
    subKegiatanList: FilterData[];
    skpdList: FilterData[];
    unitSkpdList: FilterData[];
    sumberDanaList: FilterData[];
    visibleColumns: string[];
    isLoading: boolean;
    onShowDialog: () => void;
    onExport: () => void;
};

export default function CascadingFilter({
    initialFilters,
    programList,
    kegiatanList,
    subKegiatanList,
    skpdList,
    unitSkpdList,
    sumberDanaList,
    visibleColumns,
    isLoading,
    onShowDialog,
    onExport,
}: Props) {
    const [filters, setFilters] = useState<CascadingFilters>(initialFilters);

    // Update local state when initialFilters change
    useEffect(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    const handleFilterChange = (
        key: keyof CascadingFilters,
        value: string | null,
    ) => {
        // Reset dependent filters when parent filter changes
        let newFilters = { ...filters, [key]: value };

        // Reset cascading dependencies
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
        } else if (key === 'skpd') {
            newFilters = {
                ...newFilters,
                unitSkpd: null,
            };
        }

        setFilters(newFilters);

        // Call parent's onFilterChange or make API call to get new dependent data
        router.post(route('inputdpa.cascading-filter'), newFilters, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
        });
    };

    const resetAllFilters = () => {
        const resetFilters: CascadingFilters = {
            program: null,
            kegiatan: null,
            subKegiatan: null,
            skpd: null,
            unitSkpd: null,
            sumberDana: null,
        };

        setFilters(resetFilters);

        router.post(
            route('inputdpa.reset'),
            {},
            {
                preserveScroll: true,
                preserveState: false,
                replace: true,
            },
        );
    };
    const hasActiveFilter = Object.values(filters).some(
        (value) => value !== null,
    );

    return (
        <div className="flex flex-wrap gap-4">
            {/* Program Filter - now independent (top level) */}
            <FilterDropdown
                model={programList}
                value={filters.program}
                placeholder="Program"
                onSelect={(kode) => handleFilterChange('program', kode)}
            />

            {/* Kegiatan Filter - enabled only when program is selected */}
            <div className="relative">
                <FilterDropdown
                    model={filters.program ? kegiatanList : []}
                    value={filters.kegiatan}
                    placeholder={'Kegiatan'}
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

            {/* Sub Kegiatan Filter - enabled only when kegiatan is selected */}
            <div className="relative">
                <FilterDropdown
                    model={filters.kegiatan ? subKegiatanList : []}
                    value={filters.subKegiatan}
                    placeholder={'Sub Kegiatan'}
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

            {/* SKPD Filter - independent of hierarchy */}
            <FilterDropdown
                model={skpdList}
                value={filters.skpd}
                placeholder="SKPD"
                onSelect={(kode) => handleFilterChange('skpd', kode)}
            />

            {/* Unit SKPD Filter - enabled only when SKPD is selected */}
            <div className="relative">
                <FilterDropdown
                    model={filters.skpd ? unitSkpdList : []}
                    value={filters.unitSkpd}
                    placeholder={'Unit SKPD'}
                    onSelect={
                        filters.skpd
                            ? (kode) => handleFilterChange('unitSkpd', kode)
                            : undefined
                    }
                />
                {!filters.skpd && (
                    <div className="absolute inset-0 cursor-not-allowed rounded bg-gray-100 bg-opacity-50" />
                )}
            </div>

            {/* Sumber Dana Filter - independent */}
            <FilterDropdown
                model={sumberDanaList}
                value={filters.sumberDana}
                placeholder="Sumber Dana"
                onSelect={(kode) => handleFilterChange('sumberDana', kode)}
                isWithCode={false}
            />

            {/* Action Buttons */}
            <CustomButton
                variant="shadow"
                className="flex items-center justify-center gap-2"
                onClick={onShowDialog}
            >
                <span>Tampilkan</span>
                <EyeIcon className="size-4" />
            </CustomButton>

            <CustomButton
                variant="secondary"
                className="flex items-center justify-center gap-2"
                onClick={onExport}
                disabled={visibleColumns.length === 0 || isLoading}
            >
                <span>{isLoading ? 'Mengunduh...' : 'Export Excel'}</span>
                <Download className="size-4" />
            </CustomButton>

            {/* Reset Button */}
            {hasActiveFilter && (
                <CustomButton
                    variant="outlined"
                    className="border border-red-400 text-red-600"
                    onClick={resetAllFilters}
                    disabled={isLoading}
                >
                    {isLoading ? 'Mereset...' : 'Reset Filter'}
                </CustomButton>
            )}
        </div>
    );
}
