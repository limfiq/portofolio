import React from 'react';

interface SectionHeaderProps {
    label?: string;
    title: string;
    subtitle?: string;
    centered?: boolean;
    className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
    label,
    title,
    subtitle,
    centered = true,
    className = '',
}) => {
    return (
        <div className={`${centered ? 'text-center max-w-3xl mx-auto' : ''} mb-16 md:mb-20 ${className}`}>
            {label && (
                <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider text-xs uppercase mb-3 block">
                    {label}
                </span>
            )}
            <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-slate-900 dark:text-white">
                {title}
            </h2>
            {subtitle && (
                <p className="text-slate-600 dark:text-slate-400 text-lg">
                    {subtitle}
                </p>
            )}
        </div>
    );
};
