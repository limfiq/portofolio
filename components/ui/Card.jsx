import React from 'react';

export const Card = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={`bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 
                     shadow-sm hover:shadow-xl rounded-2xl overflow-hidden 
                     hover:-translate-y-1 transition-all duration-300 
                     flex flex-col h-full group ${className || ''}`}
        {...props}
    />
));
Card.displayName = 'Card';

export const CardImage = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={`relative w-full h-48 overflow-hidden bg-slate-100 dark:bg-slate-800 ${className || ''}`}
        {...props}
    />
));
CardImage.displayName = 'CardImage';

export const CardContent = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={`p-6 flex flex-col flex-grow ${className || ''}`}
        {...props}
    />
));
CardContent.displayName = 'CardContent';

export const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
    <h3
        ref={ref}
        className={`text-lg font-bold text-slate-850 dark:text-slate-100 mb-2 line-clamp-2 
                     leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 
                     transition-colors ${className || ''}`}
        {...props}
    />
));
CardTitle.displayName = 'CardTitle';

export const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
    <p
        ref={ref}
        className={`text-slate-500 dark:text-slate-400 text-xs md:text-sm mb-6 
                     flex-grow line-clamp-3 leading-relaxed ${className || ''}`}
        {...props}
    />
));
CardDescription.displayName = 'CardDescription';

export const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
    <div
        ref={ref}
        className={`pt-4 border-t border-slate-50 dark:border-slate-800/50 mt-auto ${className || ''}`}
        {...props}
    />
));
CardFooter.displayName = 'CardFooter';

export const CardLink = React.forwardRef(({ className, ...props }, ref) => (
    <a
        ref={ref}
        className={`font-bold text-xs text-blue-600 dark:text-blue-400 
                     group-hover:translate-x-1 transition-transform 
                     inline-flex items-center gap-1.5 hover:underline ${className || ''}`}
        {...props}
    />
));
CardLink.displayName = 'CardLink';
