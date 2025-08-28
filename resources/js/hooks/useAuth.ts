import { useAuthStore } from '@/stores';
import { RoleEnum } from '@/types/enums';

/**
 * Hook for authentication-related operations
 */
export const useAuth = () => {
    const {
        user,
        isAuthenticated,
        permissions,
        setUser,
        logout,
        updateProfile,
        hasRole,
        hasPermission,
    } = useAuthStore();

    // Role check helpers
    const isSuperadmin = () => hasRole(RoleEnum.Superadmin);
    const isAdmin = () => hasRole(RoleEnum.Admin);
    const isBPP = () => hasRole(RoleEnum.BPP);
    const isPAKPA = () => hasRole(RoleEnum.PAKPA);

    // Permission helpers
    const canManageUsers = () => isSuperadmin() || isAdmin();
    const canImportData = () => isSuperadmin() || isAdmin() || isBPP();
    const canViewReports = () => isAuthenticated;

    return {
        // State
        user,
        isAuthenticated,
        permissions,
        
        // Actions
        setUser,
        logout,
        updateProfile,
        hasRole,
        hasPermission,
        
        // Role checks
        isSuperadmin,
        isAdmin,
        isBPP,
        isPAKPA,
        
        // Permission checks
        canManageUsers,
        canImportData,
        canViewReports,
    };
};
