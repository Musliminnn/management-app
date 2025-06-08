import { ImgHTMLAttributes } from 'react';
import clsx from 'clsx';

export default function ApplicationLogo(props: ImgHTMLAttributes<HTMLImageElement>) {
    const { className, ...rest } = props;

    return (
        <img
            {...rest}
            src="/newlogo.png"
            alt="Application Logo"
            className={clsx('h-20 w-auto', className)}
        />
    );
}
