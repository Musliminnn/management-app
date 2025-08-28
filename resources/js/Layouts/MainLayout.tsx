import { useInertiaSync } from '@/hooks';
import { ReactNode } from 'react';
import { Appbar } from './Appbar';
import { Sidebar } from './Sidebar';

interface ParentLayoutProps {
    children: ReactNode;
    userName?: string;
    onToggleSidebar?: () => void;
}

export const ParentLayout = ({
    children,
    onToggleSidebar,
}: ParentLayoutProps) => {
    // Sync Inertia props with Zustand stores in the main layout
    useInertiaSync();

    return (
        <div className="flex h-screen w-full flex-col">
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
