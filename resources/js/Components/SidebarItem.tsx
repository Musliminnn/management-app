// src/components/atom/SidebarItem.tsx
import { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import clsx from 'clsx';

interface SidebarItemProps {
    to: string;
    label: string;
}

export const SidebarItem = ({ to, label }: SidebarItemProps) => {
    const { url } = usePage<PageProps>();

    const isActive = url.startsWith(to); // atau pakai === kalau exact match

    return (
        <Link
            href={to}
            className={clsx(
                'flex items-center gap-3 rounded-r-lg px-4 py-2 transition-colors',
                isActive
                    ? 'bg-main text-white'
                    : 'text-main hover:bg-main/10',
            )}
        >
            <span>{label}</span>
        </Link>
    );
};
