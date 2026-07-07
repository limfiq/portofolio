import React from 'react';

export const Badge = React.forwardRef(
    ({ className, variant = 'default', size = 'sm', ...props }, ref) => {
        const variantClasses = {
            default: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-800/40',
            secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700',
            outline: 'bg-transparent border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300',
            success: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-800/40',
            warning: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-800/40',
            error: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-100/50 dark:border-red-800/40',
            info: 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 border border-cyan-100/50 dark:border-cyan-800/40',
        };

        const sizeClasses = {
            sm: 'px-2.5 py-0.5 text-[10px]',
            md: 'px-3 py-1 text-xs',
        };

        return (
            <span
                ref={ref}
                className={`
                    font-bold rounded-md uppercase tracking-wide
                    inline-flex items-center gap-1
                    ${variantClasses[variant]}
                    ${sizeClasses[size]}
                    ${className || ''}
                `.replace(/\s+/g, ' ').trim()}
                {...props}
            />
        );
    }
);

Badge.displayName = 'Badge';
