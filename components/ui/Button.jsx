import React from 'react';

export const Button = React.forwardRef(
    ({ 
        className, 
        variant = 'primary', 
        size = 'md', 
        isLoading = false,
        disabled,
        children,
        ...props 
    }, ref) => {
        const variantClasses = {
            primary: `bg-blue-600 text-white hover:bg-blue-700 
                     active:bg-blue-800 dark:bg-blue-700 dark:hover:bg-blue-800`,
            secondary: `bg-slate-100 text-slate-900 hover:bg-slate-200 
                       dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700`,
            outline: `border border-slate-300 text-slate-900 hover:bg-slate-50 
                     dark:border-slate-600 dark:text-slate-100 dark:hover:bg-slate-900`,
            ghost: `text-slate-700 hover:bg-slate-100 
                   dark:text-slate-300 dark:hover:bg-slate-800`,
            link: `text-blue-600 hover:text-blue-700 hover:underline 
                  dark:text-blue-400 dark:hover:text-blue-300`,
        };

        const sizeClasses = {
            sm: 'px-3 py-1.5 text-xs',
            md: 'px-4 py-2 text-sm',
            lg: 'px-6 py-3 text-base',
        };

        const disabledClasses = disabled || isLoading
            ? 'opacity-50 cursor-not-allowed'
            : '';

        return (
            <button
                ref={ref}
                className={`
                    font-semibold rounded-lg transition-all duration-200
                    active:scale-95 select-none
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    dark:focus:ring-offset-slate-900
                    ${variantClasses[variant]}
                    ${sizeClasses[size]}
                    ${disabledClasses}
                    ${className || ''}
                `.replace(/\s+/g, ' ').trim()}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        {children}
                    </span>
                ) : (
                    children
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';

export const IconButton = React.forwardRef(
    ({ className, variant = 'ghost', size = 'md', ...props }, ref) => (
        <Button
            ref={ref}
            variant={variant}
            size={size}
            className={`p-2 inline-flex items-center justify-center ${className || ''}`}
            {...props}
        />
    )
);

IconButton.displayName = 'IconButton';
