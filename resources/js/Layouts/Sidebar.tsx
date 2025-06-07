import { SidebarItem } from '@/Components/SidebarItem'

const menuItems = [
  { label: 'Dashboard', path: '/dashboard', },
  { label: 'Belanja Barang & Jasa', path: '/settings', },
  { label: 'Input DPA', path: '/profile',  },
  { label: 'Input Realisasi Belanja', path: '/settings', },
  { label: 'Laporan Realisasi Belanja', path: '/profile',  },
  { label: 'Belanja Pegawai', path: '/belanja', },
  { label: 'Upload & Verifikasi Gaji', path: '/settings', },
  { label: 'Slip Gaji', path: '/profile',  },
  { label: 'Laporan Pegawai', path: '/profile',  },
];

export const Sidebar = () => {
  return (
    <aside className="h-screen w-64 bg-white text-white flex flex-col">
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
  )
}
