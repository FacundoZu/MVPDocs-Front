import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    elevation?: 'sm' | 'md' | 'lg' | 'xl';
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> { }
export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> { }
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> { }

const Card = forwardRef<HTMLDivElement, CardProps>(
    (
        {
            children,
            elevation = 'md',
            padding = 'md',
            hover = false,
            className = '',
            ...props
        },
        ref
    ) => {
        const baseStyles = 'bg-white rounded-xl border border-gray-200 transition-all duration-200';

        const elevations = {
            sm: 'shadow-sm',
            md: 'shadow-md',
            lg: 'shadow-lg',
            xl: 'shadow-xl',
        };

        const paddings = {
            none: '',
            sm: 'p-4',
            md: 'p-6',
            lg: 'p-8',
        };

        const hoverStyles = hover ? 'hover:shadow-xl hover:-translate-y-1 cursor-pointer' : '';

        return (
            <div
                ref={ref}
                className={`${baseStyles} ${elevations[elevation]} ${paddings[padding]} ${hoverStyles} ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
    ({ children, className = '', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`mb-4 pb-4 border-b border-gray-200 ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardHeader.displayName = 'CardHeader';

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
    ({ children, className = '', ...props }, ref) => {
        return (
            <div ref={ref} className={`${className}`} {...props}>
                {children}
            </div>
        );
    }
);

CardBody.displayName = 'CardBody';

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
    ({ children, className = '', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={`mt-4 pt-4 border-t border-gray-200 ${className}`}
                {...props}
            >
                {children}
            </div>
        );
    }
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };
