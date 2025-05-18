export interface UserRole {
    id: number;
    name: 'superadmin' | 'admin' | 'bpp' | 'pa_kpa';
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

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};
