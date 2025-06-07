import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

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
  const baseClass = 'inline-flex items-center font-semibold transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variants = {
    primary: 'bg-main text-white text-xs px-4 py-2 uppercase tracking-widest rounded-md hover:bg-gray-700 focus:ring-indigo-500 active:bg-gray-900 border border-transparent',
    secondary: 'bg-main/10 text-main font-semibold text-2xl px-4 py-3 rounded-md focus:outline-none focus:ring-0 focus:ring-transparent',
    outlined: 'border border-gray-500 text-gray-700 bg-white px-4 py-2 rounded-md hover:bg-gray-100 focus:ring-gray-400',
    shadow: 'shadow-custom rounded-lg px-4 py-3 bg-white focus:outline-none focus:ring-0 focus:ring-custom-black/10',
  };

  return (
    <button
      {...props}
      disabled={disabled}
      className={clsx(
        baseClass,
        variants[variant],
        disabled && 'opacity-25 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  );
}
