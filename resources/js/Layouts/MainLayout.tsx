import { ReactNode } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Appbar } from './Appbar';

interface ParentLayoutProps {
  children: ReactNode;
  userName?: string;
  onToggleSidebar?: () => void;
}

export const ParentLayout = ({
  children,
  onToggleSidebar,
}: ParentLayoutProps) => {
  return (
    <div className="flex flex-col h-screen w-full">
      <Appbar />

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 overflow-y-auto bg-white p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
