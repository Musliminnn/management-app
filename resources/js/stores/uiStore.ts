import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface UIState {
    // Loading states
    isLoading: boolean;
    isPageLoading: boolean;
    loadingMessage: string;
    
    // Modal states
    modals: {
        [key: string]: boolean;
    };
    
    // Table states
    visibleColumns: string[];
    perPage: number;
    currentPage: number;
    
    // Actions
    setLoading: (loading: boolean, message?: string) => void;
    setPageLoading: (loading: boolean) => void;
    openModal: (modalKey: string) => void;
    closeModal: (modalKey: string) => void;
    toggleModal: (modalKey: string) => void;
    setVisibleColumns: (columns: string[]) => void;
    toggleColumn: (column: string) => void;
    setPerPage: (perPage: number) => void;
    setCurrentPage: (page: number) => void;
}

export const useUIStore = create<UIState>()(
    devtools(
        (set, get) => ({
            isLoading: false,
            isPageLoading: false,
            loadingMessage: '',
            modals: {},
            visibleColumns: [],
            perPage: 10,
            currentPage: 1,

            setLoading: (loading, message = '') => {
                set({
                    isLoading: loading,
                    loadingMessage: message,
                }, false, 'ui/setLoading');
            },

            setPageLoading: (loading) => {
                set({ isPageLoading: loading }, false, 'ui/setPageLoading');
            },

            openModal: (modalKey) => {
                set((state) => ({
                    modals: {
                        ...state.modals,
                        [modalKey]: true,
                    }
                }), false, `ui/openModal-${modalKey}`);
            },

            closeModal: (modalKey) => {
                set((state) => ({
                    modals: {
                        ...state.modals,
                        [modalKey]: false,
                    }
                }), false, `ui/closeModal-${modalKey}`);
            },

            toggleModal: (modalKey) => {
                set((state) => ({
                    modals: {
                        ...state.modals,
                        [modalKey]: !state.modals[modalKey],
                    }
                }), false, `ui/toggleModal-${modalKey}`);
            },

            setVisibleColumns: (columns) => {
                set({ visibleColumns: columns }, false, 'ui/setVisibleColumns');
            },

            toggleColumn: (column) => {
                set((state) => {
                    const visibleColumns = state.visibleColumns.includes(column)
                        ? state.visibleColumns.filter(col => col !== column)
                        : [...state.visibleColumns, column];
                    
                    return { visibleColumns };
                }, false, `ui/toggleColumn-${column}`);
            },

            setPerPage: (perPage) => {
                set({ perPage, currentPage: 1 }, false, 'ui/setPerPage');
            },

            setCurrentPage: (page) => {
                set({ currentPage: page }, false, 'ui/setCurrentPage');
            },
        }),
        {
            name: 'ui-store',
        }
    )
);
