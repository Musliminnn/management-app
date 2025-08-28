import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface DataTableState {
    // Data
    data: Record<string, any>[];
    originalData: Record<string, any>[];
    grandTotal: number;
    
    // Pagination - Support both Laravel format and our format
    pagination: {
        currentPage: number;
        totalPages: number;
        totalRecords: number;
        perPage: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        // Laravel format support
        current_page?: number;
        last_page?: number;
        total?: number;
        per_page?: number;
        links?: any[];
    };
    
    // Column management
    columns: string[];
    visibleColumns: string[];
    
    // Sorting
    sortColumn: string | null;
    sortDirection: 'asc' | 'desc';
    
    // Search
    searchTerm: string;
    searchableColumns: string[];
    
    // Selection
    selectedRows: string[];
    selectAll: boolean;
    
    // Actions
    setData: (data: Record<string, any>[], grandTotal?: number) => void;
    setPagination: (pagination: Partial<DataTableState['pagination']>) => void;
    setColumns: (columns: string[]) => void;
    setVisibleColumns: (columns: string[]) => void;
    toggleColumnVisibility: (column: string) => void;
    setSorting: (column: string | null, direction: 'asc' | 'desc') => void;
    setSearch: (term: string) => void;
    setSearchableColumns: (columns: string[]) => void;
    selectRow: (rowId: string) => void;
    selectRows: (rowIds: string[]) => void;
    deselectRow: (rowId: string) => void;
    toggleSelectAll: () => void;
    clearSelection: () => void;
    getFilteredData: () => Record<string, any>[];
    getSortedData: () => Record<string, any>[];
    getTotalValue: (column: string) => number;
}

const initialPagination = {
    currentPage: 1,
    totalPages: 1,
    totalRecords: 0,
    perPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
};

export const useDataTableStore = create<DataTableState>()(
    devtools(
        (set, get) => ({
            data: [],
            originalData: [],
            grandTotal: 0,
            pagination: initialPagination,
            columns: [],
            visibleColumns: [],
            sortColumn: null,
            sortDirection: 'asc',
            searchTerm: '',
            searchableColumns: [],
            selectedRows: [],
            selectAll: false,

            setData: (data, grandTotal = 0) => {
                const columns = data.length > 0 ? Object.keys(data[0]) : [];
                
                // Auto-calculate pagination if not set
                const totalRecords = data.length;
                const perPage = 10; // default per page
                const totalPages = Math.ceil(totalRecords / perPage);
                
                set((state) => ({
                    data,
                    originalData: [...data],
                    grandTotal,
                    columns,
                    visibleColumns: columns,
                    // Update pagination with calculated values if not already set
                    pagination: {
                        ...state.pagination,
                        totalRecords,
                        totalPages,
                        hasNextPage: state.pagination.currentPage < totalPages,
                        hasPreviousPage: state.pagination.currentPage > 1,
                        perPage: state.pagination.perPage || perPage,
                    }
                }), false, 'dataTable/setData');
            },

            setPagination: (paginationUpdate) => {
                set((state) => {
                    // Map Laravel format to our format if needed
                    const mapped = {
                        currentPage: paginationUpdate.current_page || paginationUpdate.currentPage || state.pagination.currentPage,
                        totalPages: paginationUpdate.last_page || paginationUpdate.totalPages || state.pagination.totalPages,
                        totalRecords: paginationUpdate.total || paginationUpdate.totalRecords || state.pagination.totalRecords,
                        perPage: paginationUpdate.per_page || paginationUpdate.perPage || state.pagination.perPage,
                        hasNextPage: false, // Will be calculated below
                        hasPreviousPage: false, // Will be calculated below
                        // Keep Laravel format for compatibility
                        ...paginationUpdate
                    };
                    
                    // Calculate navigation flags
                    mapped.hasNextPage = mapped.currentPage < mapped.totalPages;
                    mapped.hasPreviousPage = mapped.currentPage > 1;
                    
                    return {
                        pagination: mapped
                    };
                }, false, 'dataTable/setPagination');
            },

            setColumns: (columns) => {
                set({ columns }, false, 'dataTable/setColumns');
            },

            setVisibleColumns: (columns) => {
                set({ visibleColumns: columns }, false, 'dataTable/setVisibleColumns');
            },

            toggleColumnVisibility: (column) => {
                set((state) => {
                    const visibleColumns = state.visibleColumns.includes(column)
                        ? state.visibleColumns.filter(col => col !== column)
                        : [...state.visibleColumns, column];
                    
                    return { visibleColumns };
                }, false, `dataTable/toggleColumn-${column}`);
            },

            setSorting: (column, direction) => {
                set({
                    sortColumn: column,
                    sortDirection: direction,
                }, false, 'dataTable/setSorting');
            },

            setSearch: (term) => {
                set({ searchTerm: term }, false, 'dataTable/setSearch');
            },

            setSearchableColumns: (columns) => {
                set({ searchableColumns: columns }, false, 'dataTable/setSearchableColumns');
            },

            selectRow: (rowId) => {
                set((state) => ({
                    selectedRows: [...state.selectedRows, rowId]
                }), false, 'dataTable/selectRow');
            },

            selectRows: (rowIds) => {
                set({ selectedRows: rowIds }, false, 'dataTable/selectRows');
            },

            deselectRow: (rowId) => {
                set((state) => ({
                    selectedRows: state.selectedRows.filter(id => id !== rowId)
                }), false, 'dataTable/deselectRow');
            },

            toggleSelectAll: () => {
                set((state) => {
                    const allRowIds = state.data.map((row, index) => index.toString());
                    const allSelected = state.selectedRows.length === allRowIds.length;
                    
                    return {
                        selectedRows: allSelected ? [] : allRowIds,
                        selectAll: !allSelected,
                    };
                }, false, 'dataTable/toggleSelectAll');
            },

            clearSelection: () => {
                set({
                    selectedRows: [],
                    selectAll: false,
                }, false, 'dataTable/clearSelection');
            },

            getFilteredData: () => {
                const { data, searchTerm, searchableColumns } = get();
                
                if (!searchTerm || searchableColumns.length === 0) {
                    return data;
                }
                
                return data.filter(row => {
                    return searchableColumns.some(column => {
                        const value = row[column];
                        return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
                    });
                });
            },

            getSortedData: () => {
                const { sortColumn, sortDirection } = get();
                const filteredData = get().getFilteredData();
                
                if (!sortColumn) {
                    return filteredData;
                }
                
                return [...filteredData].sort((a, b) => {
                    const aValue = a[sortColumn];
                    const bValue = b[sortColumn];
                    
                    if (aValue === bValue) return 0;
                    
                    const comparison = aValue < bValue ? -1 : 1;
                    return sortDirection === 'asc' ? comparison : -comparison;
                });
            },

            getTotalValue: (column) => {
                const data = get().data;
                return data.reduce((total, row) => {
                    const value = parseFloat(row[column] || 0);
                    return total + (isNaN(value) ? 0 : value);
                }, 0);
            },
        }),
        {
            name: 'data-table-store',
        }
    )
);
