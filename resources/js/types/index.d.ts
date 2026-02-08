export interface UserRole {
    id: number;
    name: 'superadmin' | 'admin' | 'bpp' | 'pa_kpa' | 'pptk';
    label: string;
    created_at?: string;
    updated_at?: string;
}

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    role: UserRole;
}

// Menu keys matching backend MenuEnum
export type MenuKey =
    | 'dashboard'
    | 'input_dpa'
    | 'input_realisasi_belanja'
    | 'riwayat_transaksi'
    | 'laporan_realisasi';

// Permission keys matching backend PermissionEnum
export type PermissionKey = 'view' | 'add' | 'edit' | 'delete' | 'validate' | 'export';

// Permissions object: menu -> array of permissions
export type MenuPermissions = Partial<Record<MenuKey, PermissionKey[]>>;

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
        permissions: MenuPermissions;
    };
};
