import type { HTMLAttributes } from 'react';

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    color?: 'primary' | 'secondary' | 'white' | 'gray';
    fullscreen?: boolean;
    text?: string;
}

export default function Spinner({
    size = 'md',
    color = 'primary',
    fullscreen = false,
    text,
    className = '',
    ...props
}: SpinnerProps) {
    const sizes = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12',
        xl: 'h-16 w-16',
    };

    const colors = {
        primary: 'border-blue-600',
        secondary: 'border-gray-700',
        white: 'border-white',
        gray: 'border-gray-600',
    };

    const spinner = (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`} {...props}>
            <div
                className={`
          ${sizes[size]}
          border-4
          border-gray-200
          ${colors[color]}
          border-t-transparent
          rounded-full
          animate-spin
        `}
            />
            {text && (
                <p className="text-sm font-medium text-gray-600 animate-pulse">
                    {text}
                </p>
            )}
        </div>
    );

    if (fullscreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
                {spinner}
            </div>
        );
    }

    return spinner;
}
