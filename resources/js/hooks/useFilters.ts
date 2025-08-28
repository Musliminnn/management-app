import { useCallback } from 'react';
import { router } from '@inertiajs/react';
import { useFilterStore, useUIStore } from '@/stores';

/**
 * Hook for filter operations
 */
export const useFilters = () => {
    const {
        cascadingFilters,
        legacyFilters,
        filterOptions,
        isFilterLoading,
        setCascadingFilter,
        setLegacyFilter,
        resetFilters,
        setFilterLoading,
        hasActiveFilter,
        getFilterKey,
    } = useFilterStore();

    const setLoading = useUIStore(state => state.setLoading);

    // Apply cascading filters via Inertia
    const applyCascadingFilters = useCallback((filters: Partial<typeof cascadingFilters>) => {
        setFilterLoading(true);
        setLoading(true, 'Applying filters...');

        // Update store first
        Object.entries(filters).forEach(([key, value]) => {
            setCascadingFilter(key as keyof typeof cascadingFilters, value);
        });

        // Send to backend
        router.post(route('inputdpa.cascading-filter'), filters, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
            onFinish: () => {
                setFilterLoading(false);
                setLoading(false);
            },
        });
    }, [setCascadingFilter, setFilterLoading, setLoading]);

    // Apply legacy filters via Inertia
    const applyLegacyFilters = useCallback((filters: Partial<typeof legacyFilters>) => {
        setFilterLoading(true);
        setLoading(true, 'Applying filters...');

        // Update store first
        Object.entries(filters).forEach(([key, value]) => {
            setLegacyFilter(key as keyof typeof legacyFilters, value);
        });

        // Send to backend
        router.post(route('inputdpa.filter'), filters, {
            preserveScroll: true,
            preserveState: false,
            replace: true,
            onFinish: () => {
                setFilterLoading(false);
                setLoading(false);
            },
        });
    }, [setLegacyFilter, setFilterLoading, setLoading]);

    // Reset all filters
    const clearAllFilters = useCallback(() => {
        resetFilters();
        
        // Navigate to page without filters
        router.visit(route('inputdpa.index'), {
            preserveScroll: true,
            replace: true,
        });
    }, [resetFilters]);

    return {
        // State
        cascadingFilters,
        legacyFilters,
        filterOptions,
        isFilterLoading,
        hasActiveFilter: hasActiveFilter(),
        filterKey: getFilterKey(),
        
        // Actions
        setCascadingFilter,
        setLegacyFilter,
        applyCascadingFilters,
        applyLegacyFilters,
        clearAllFilters,
        resetFilters,
    };
};
