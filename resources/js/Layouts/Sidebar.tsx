import { SidebarItem } from '@/Components/SidebarItem';
import { RoleEnum } from '@/types/enums';
import { usePage } from '@inertiajs/react';

export const Sidebar = () => {
    const { auth } = usePage().props;
    const user = auth?.user;

    const menuItems = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Belanja Barang & Jasa', path: '/settings' },
        { label: 'Input DPA', path: '/input-dpa' },
        { label: 'Input Realisasi Belanja', path: '/realisasi-belanja' },
        { label: 'Laporan Realisasi Belanja', path: '/profile' },
        { label: 'Belanja Pegawai', path: '/belanja' },
        { label: 'Upload & Verifikasi Gaji', path: '/settings' },
        { label: 'Slip Gaji', path: '/profile' },
        { label: 'Laporan Pegawai', path: '/profile' },
        ...(user?.role?.name === RoleEnum.Superadmin
            ? [{ label: 'Tambah User', path: '/register' }]
            : []),
    ];

    return (
        <aside className="flex h-screen w-64 flex-col bg-white text-white">
            <nav className="flex flex-col gap-2">
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.path}
                        to={item.path}
                        label={item.label}
                    />
                ))}
            </nav>
        </aside>
    );
};
