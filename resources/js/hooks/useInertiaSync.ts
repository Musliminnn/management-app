import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { useAuthStore, useFilterStore, useDataTableStore } from '@/stores';

/**
 * Hook to sync Inertia page props with Zustand stores
 */
export const useInertiaSync = () => {
    const page = usePage();
    const props = page.props as any;
    
    const setUser = useAuthStore(state => state.setUser);
    const setFilterOptions = useFilterStore(state => state.setFilterOptions);
    const setCascadingFilter = useFilterStore(state => state.setCascadingFilter);
    const setLegacyFilter = useFilterStore(state => state.setLegacyFilter);
    const setData = useDataTableStore(state => state.setData);
    const setPagination = useDataTableStore(state => state.setPagination);

    // Sync auth data
    useEffect(() => {
        if (props.auth?.user) {
            setUser(props.auth.user);
        }
    }, [props.auth?.user, setUser]);

    // Sync filter options
    useEffect(() => {
        const filterOptions: any = {};
        
        if (props.programList) filterOptions.programList = props.programList;
        if (props.kegiatanList) filterOptions.kegiatanList = props.kegiatanList;
        if (props.subKegiatanList) filterOptions.subKegiatanList = props.subKegiatanList;
        if (props.skpdList) filterOptions.skpdList = props.skpdList;
        if (props.unitSkpdList) filterOptions.unitSkpdList = props.unitSkpdList;
        
        if (Object.keys(filterOptions).length > 0) {
            setFilterOptions(filterOptions);
        }
    }, [
        props.programList,
        props.kegiatanList,
        props.subKegiatanList,
        props.skpdList,
        props.unitSkpdList,
        setFilterOptions
    ]);

    // Sync cascading filters
    useEffect(() => {
        if (props.cascadingFilters) {
            Object.entries(props.cascadingFilters).forEach(([key, value]) => {
                setCascadingFilter(key as any, value as string | null);
            });
        }
    }, [props.cascadingFilters, setCascadingFilter]);

    // Sync legacy filters
    useEffect(() => {
        if (props.filters) {
            Object.entries(props.filters).forEach(([key, value]) => {
                setLegacyFilter(key as any, value as string | null);
            });
        }
    }, [props.filters, setLegacyFilter]);

    // Sync table data
    useEffect(() => {
        if (props.data) {
            setData(props.data, props.grandTotal || 0);
        }
    }, [props.data, props.grandTotal, setData]);

    // Sync pagination
    useEffect(() => {
        if (props.pagination) {
            // Map Laravel pagination format to our store format
            const paginationData = props.pagination;
            const mappedPagination = {
                currentPage: paginationData.current_page || paginationData.currentPage || 1,
                totalPages: paginationData.last_page || paginationData.totalPages || 1,
                totalRecords: paginationData.total || paginationData.totalRecords || 0,
                perPage: paginationData.per_page || paginationData.perPage || 10,
                hasNextPage: (paginationData.current_page || paginationData.currentPage || 1) < (paginationData.last_page || paginationData.totalPages || 1),
                hasPreviousPage: (paginationData.current_page || paginationData.currentPage || 1) > 1,
                // Keep Laravel pagination links for UI
                links: paginationData.links,
                // Keep original Laravel fields for compatibility
                ...paginationData
            };
            
            setPagination(mappedPagination);
        } else if (props.data && props.data.length > 0) {
            // Create pagination from data if backend doesn't provide it
            const totalRecords = props.data.length;
            const perPage = 10;
            const totalPages = Math.ceil(totalRecords / perPage);
            
            setPagination({
                currentPage: 1,
                totalPages,
                totalRecords,
                perPage,
                hasNextPage: totalPages > 1,
                hasPreviousPage: false,
            });
        }
    }, [props.pagination, props.data, setPagination]);

    return {
        props,
        auth: props.auth,
        user: props.auth?.user,
    };
};
