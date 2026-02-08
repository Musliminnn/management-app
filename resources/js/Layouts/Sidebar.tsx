import { SidebarItem } from '@/Components/SidebarItem';
import { useAuth } from '@/hooks/useAuth';
import { MenuEnum } from '@/types/enums';
import { MenuKey } from '@/types/index.d';

interface MenuItem {
    label: string;
    path: string;
    menuKey: MenuKey;
}

export const Sidebar = () => {
    const { canView } = useAuth();

    const menuItems: MenuItem[] = [
        { label: 'Dashboard', path: '/dashboard', menuKey: MenuEnum.Dashboard },
        { label: 'Input DPA', path: '/input-dpa', menuKey: MenuEnum.InputDPA },
        {
            label: 'Input Realisasi Belanja',
            path: '/realisasi-belanja',
            menuKey: MenuEnum.InputRealisasiBelanja,
        },
        {
            label: 'Laporan Realisasi Belanja',
            path: '/laporan-realisasi-belanja',
            menuKey: MenuEnum.LaporanRealisasi,
        },
    ];

    // Filter menu items based on view permission
    const visibleMenuItems = menuItems.filter((item) => canView(item.menuKey));

    return (
        <aside className="flex h-screen w-64 flex-col bg-white text-white">
            <nav className="flex flex-col gap-2">
                {visibleMenuItems.map((item) => (
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
