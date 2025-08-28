import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { User } from '@/types/index.d';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    permissions: string[];
    
    // Actions
    setUser: (user: User | null) => void;
    logout: () => void;
    updateProfile: (userData: Partial<User>) => void;
    hasRole: (role: string) => boolean;
    hasPermission: (permission: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
    devtools(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            permissions: [],

            setUser: (user) => {
                set({
                    user,
                    isAuthenticated: !!user,
                    permissions: user?.role ? [user.role.name] : [],
                }, false, 'auth/setUser');
            },

            logout: () => {
                set({
                    user: null,
                    isAuthenticated: false,
                    permissions: [],
                }, false, 'auth/logout');
            },

            updateProfile: (userData) => {
                const currentUser = get().user;
                if (currentUser) {
                    set({
                        user: { ...currentUser, ...userData }
                    }, false, 'auth/updateProfile');
                }
            },

            hasRole: (role) => {
                const user = get().user;
                return user?.role?.name === role;
            },

            hasPermission: (permission) => {
                const permissions = get().permissions;
                return permissions.includes(permission);
            },
        }),
        {
            name: 'auth-store',
        }
    )
);
