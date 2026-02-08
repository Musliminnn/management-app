import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { MenuKey, MenuPermissions, PermissionKey, User } from '@/types/index.d';
import { MenuEnum, PermissionEnum } from '@/types/enums';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    menuPermissions: MenuPermissions;

    // Actions
    setUser: (user: User | null) => void;
    setMenuPermissions: (permissions: MenuPermissions) => void;
    logout: () => void;
    updateProfile: (userData: Partial<User>) => void;
    hasRole: (role: string) => boolean;

    // Menu permission checks
    hasMenuPermission: (menu: MenuKey | MenuEnum, permission: PermissionKey | PermissionEnum) => boolean;
    canView: (menu: MenuKey | MenuEnum) => boolean;
    canAdd: (menu: MenuKey | MenuEnum) => boolean;
    canEdit: (menu: MenuKey | MenuEnum) => boolean;
    canDelete: (menu: MenuKey | MenuEnum) => boolean;
    canValidate: (menu: MenuKey | MenuEnum) => boolean;
    canExport: (menu: MenuKey | MenuEnum) => boolean;
    getMenuPermissions: (menu: MenuKey | MenuEnum) => PermissionKey[];
}

export const useAuthStore = create<AuthState>()(
    devtools(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            menuPermissions: {},

            setUser: (user) => {
                set(
                    {
                        user,
                        isAuthenticated: !!user,
                    },
                    false,
                    'auth/setUser',
                );
            },

            setMenuPermissions: (permissions) => {
                set(
                    {
                        menuPermissions: permissions,
                    },
                    false,
                    'auth/setMenuPermissions',
                );
            },

            logout: () => {
                set(
                    {
                        user: null,
                        isAuthenticated: false,
                        menuPermissions: {},
                    },
                    false,
                    'auth/logout',
                );
            },

            updateProfile: (userData) => {
                const currentUser = get().user;
                if (currentUser) {
                    set(
                        {
                            user: { ...currentUser, ...userData },
                        },
                        false,
                        'auth/updateProfile',
                    );
                }
            },

            hasRole: (role) => {
                const user = get().user;
                return user?.role?.name === role;
            },

            hasMenuPermission: (menu, permission) => {
                const menuKey = (typeof menu === 'string' ? menu : menu) as MenuKey;
                const permKey = (typeof permission === 'string' ? permission : permission) as PermissionKey;
                const perms = get().menuPermissions[menuKey];
                return perms?.includes(permKey) ?? false;
            },

            canView: (menu) => get().hasMenuPermission(menu, PermissionEnum.View),
            canAdd: (menu) => get().hasMenuPermission(menu, PermissionEnum.Add),
            canEdit: (menu) => get().hasMenuPermission(menu, PermissionEnum.Edit),
            canDelete: (menu) => get().hasMenuPermission(menu, PermissionEnum.Delete),
            canValidate: (menu) => get().hasMenuPermission(menu, PermissionEnum.Validate),
            canExport: (menu) => get().hasMenuPermission(menu, PermissionEnum.Export),

            getMenuPermissions: (menu) => {
                const menuKey = (typeof menu === 'string' ? menu : menu) as MenuKey;
                return get().menuPermissions[menuKey] ?? [];
            },
        }),
        {
            name: 'auth-store',
        },
    ),
);
