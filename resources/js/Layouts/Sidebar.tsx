import { SidebarItem } from '@/Components/SidebarItem';

export const Sidebar = () => {

    const menuItems = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Input DPA', path: '/input-dpa' },
        { label: 'Input Realisasi Belanja', path: '/realisasi-belanja' },
        { label: 'Laporan Realisasi Belanja', path: '/laporan-realisasi-belanja' },
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
