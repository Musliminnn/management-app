import { useAuthStore } from '@/stores';
import { MenuEnum, RoleEnum } from '@/types/enums';

/**
 * Hook for authentication-related operations
 */
export const useAuth = () => {
    const {
        user,
        isAuthenticated,
        menuPermissions,
        setUser,
        setMenuPermissions,
        logout,
        updateProfile,
        hasRole,
        hasMenuPermission,
        canView,
        canAdd,
        canEdit,
        canDelete,
        canValidate,
        canExport,
        getMenuPermissions,
    } = useAuthStore();

    // Role check helpers
    const isSuperadmin = () => hasRole(RoleEnum.Superadmin);
    const isAdmin = () => hasRole(RoleEnum.Admin);
    const isBPP = () => hasRole(RoleEnum.BPP);
    const isPAKPA = () => hasRole(RoleEnum.PAKPA);
    const isPPTK = () => hasRole(RoleEnum.PPTK);

    // Legacy permission helpers (for backward compatibility)
    const canManageUsers = () => isSuperadmin() || isAdmin();
    const canImportData = () => canAdd(MenuEnum.InputDPA) || isSuperadmin();
    const canViewReports = () => canView(MenuEnum.LaporanRealisasi);

    return {
        // State
        user,
        isAuthenticated,
        menuPermissions,

        // Actions
        setUser,
        setMenuPermissions,
        logout,
        updateProfile,
        hasRole,

        // Role checks
        isSuperadmin,
        isAdmin,
        isBPP,
        isPAKPA,
        isPPTK,

        // Menu permission checks
        hasMenuPermission,
        canView,
        canAdd,
        canEdit,
        canDelete,
        canValidate,
        canExport,
        getMenuPermissions,

        // Legacy permission checks
        canManageUsers,
        canImportData,
        canViewReports,
    };
};
