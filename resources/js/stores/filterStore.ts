import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CascadingFilters {
    program: string | null;
    kegiatan: string | null;
    subKegiatan: string | null;
    skpd: string | null;
    unitSkpd: string | null;
}

interface FilterData {
    kode: string;
    nama: string;
}

interface FilterOptions {
    programList: FilterData[];
    kegiatanList: FilterData[];
    subKegiatanList: FilterData[];
    skpdList: FilterData[];
    unitSkpdList: FilterData[];
}

interface FilterState {
    // Cascading filters
    cascadingFilters: CascadingFilters;
    filterOptions: FilterOptions;
    isFilterLoading: boolean;
    
    // Legacy filters (for backward compatibility)
    legacyFilters: {
        program: string | null;
        subKegiatan: string | null;
        sumberDana: string | null;
    };
    
    // Actions
    setCascadingFilter: (key: keyof CascadingFilters, value: string | null) => void;
    setLegacyFilter: (key: keyof FilterState['legacyFilters'], value: string | null) => void;
    resetFilters: () => void;
    setFilterOptions: (options: Partial<FilterOptions>) => void;
    setFilterLoading: (loading: boolean) => void;
    hasActiveFilter: () => boolean;
    getFilterKey: () => string;
}

const initialCascadingFilters: CascadingFilters = {
    program: null,
    kegiatan: null,
    subKegiatan: null,
    skpd: null,
    unitSkpd: null,
};

const initialFilterOptions: FilterOptions = {
    programList: [],
    kegiatanList: [],
    subKegiatanList: [],
    skpdList: [],
    unitSkpdList: [],
};

export const useFilterStore = create<FilterState>()(
    devtools(
        (set, get) => ({
            cascadingFilters: initialCascadingFilters,
            filterOptions: initialFilterOptions,
            isFilterLoading: false,
            legacyFilters: {
                program: null,
                subKegiatan: null,
                sumberDana: null,
            },

            setCascadingFilter: (key, value) => {
                set((state) => {
                    const newFilters = { ...state.cascadingFilters, [key]: value };
                    
                    // Reset dependent filters when parent changes
                    if (key === 'program') {
                        newFilters.kegiatan = null;
                        newFilters.subKegiatan = null;
                    } else if (key === 'kegiatan') {
                        newFilters.subKegiatan = null;
                    } else if (key === 'skpd') {
                        newFilters.unitSkpd = null;
                    }
                    
                    return {
                        cascadingFilters: newFilters,
                    };
                }, false, `filter/setCascadingFilter-${key}`);
            },

            setLegacyFilter: (key, value) => {
                set((state) => ({
                    legacyFilters: {
                        ...state.legacyFilters,
                        [key]: value,
                    }
                }), false, `filter/setLegacyFilter-${key}`);
            },

            resetFilters: () => {
                set({
                    cascadingFilters: initialCascadingFilters,
                    legacyFilters: {
                        program: null,
                        subKegiatan: null,
                        sumberDana: null,
                    },
                }, false, 'filter/resetFilters');
            },

            setFilterOptions: (options) => {
                set((state) => ({
                    filterOptions: {
                        ...state.filterOptions,
                        ...options,
                    }
                }), false, 'filter/setFilterOptions');
            },

            setFilterLoading: (loading) => {
                set({ isFilterLoading: loading }, false, 'filter/setFilterLoading');
            },

            hasActiveFilter: () => {
                const { cascadingFilters, legacyFilters } = get();
                
                const hasCascadingFilter = Object.values(cascadingFilters).some(value => value !== null);
                const hasLegacyFilter = Object.values(legacyFilters).some(value => value !== null);
                
                return hasCascadingFilter || hasLegacyFilter;
            },

            getFilterKey: () => {
                const { cascadingFilters, legacyFilters } = get();
                
                // Use cascading filters if any are set
                const hasCascadingFilter = Object.values(cascadingFilters).some(value => value !== null);
                
                if (hasCascadingFilter) {
                    return `${cascadingFilters.program ?? ''}-${cascadingFilters.kegiatan ?? ''}-${cascadingFilters.subKegiatan ?? ''}-${cascadingFilters.skpd ?? ''}-${cascadingFilters.unitSkpd ?? ''}`;
                }
                
                // Fall back to legacy filters
                return `${legacyFilters.program ?? ''}-${legacyFilters.subKegiatan ?? ''}-${legacyFilters.sumberDana ?? ''}`;
            },
        }),
        {
            name: 'filter-store',
        }
    )
);
