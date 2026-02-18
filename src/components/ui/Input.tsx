import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    helperText?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
    (
        {
            label,
            helperText,
            error,
            leftIcon,
            rightIcon,
            className = '',
            disabled,
            ...props
        },
        ref
    ) => {
        const inputBaseStyles = 'w-full px-4 py-2 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 disabled:bg-gray-100 disabled:cursor-not-allowed';

        const inputStateStyles = error
            ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500';

        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        {label}
                    </label>
                )}

                <div className="relative">
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {leftIcon}
                        </div>
                    )}

                    <input
                        ref={ref}
                        disabled={disabled}
                        className={`
              ${inputBaseStyles}
              ${inputStateStyles}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
                        {...props}
                    />

                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {(helperText || error) && (
                    <p className={`mt-1.5 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
                        {error || helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

export default Input;
