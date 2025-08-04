import clsx from 'clsx';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outlined' | 'shadow';
}

export default function Button({
    className = '',
    disabled,
    children,
    variant = 'primary',
    ...props
}: ButtonProps) {
    const baseClass =
        'inline-flex items-center font-semibold transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';

    const variants = {
        primary:
            'bg-main text-white px-4 py-2 tracking-widest rounded-md border border-transparent focus:outline-none focus:ring-0 focus:ring-transparent',
        secondary:
            'bg-main/10 border border-main/20 text-main font-semibold px-4 py-2 rounded-md focus:outline-none focus:ring-0 focus:ring-transparent',
        outlined:
            'border border-custom-black/20 text-main font-semibold bg-white px-4 py-2 rounded-md focus:outline-none focus:ring-0 focus:ring-transparent',
        shadow: 'shadow-custom rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-0 focus:ring-custom-black/10',
    };

    return (
        <button
            {...props}
            disabled={disabled}
            className={clsx(
                baseClass,
                variants[variant],
                disabled && 'cursor-not-allowed opacity-25',
                className,
            )}
        >
            {children}
        </button>
    );
}
