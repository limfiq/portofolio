import React from "react";

export const ShimmerLine = ({ className = "" }) => (
    <div className={`animate-shimmer rounded bg-slate-200 dark:bg-slate-800 ${className}`} />
);

export const CardSkeleton = ({ hasImage = true, count = 3 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: count }).map((_, idx) => (
                <div 
                    key={idx} 
                    className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full p-4"
                >
                    {hasImage && (
                        <div className="animate-shimmer w-full h-48 rounded-xl bg-slate-200 dark:bg-slate-800 mb-4" />
                    )}
                    <div className="flex-1 flex flex-col space-y-3">
                        {/* Meta Category/Year */}
                        <div className="flex justify-between items-center mb-2">
                            <ShimmerLine className="h-4 w-1/4" />
                            <ShimmerLine className="h-4 w-12" />
                        </div>
                        {/* Title */}
                        <div className="space-y-2">
                            <ShimmerLine className="h-5 w-full" />
                            <ShimmerLine className="h-5 w-3/4" />
                        </div>
                        {/* Description */}
                        <div className="space-y-2 flex-1 mt-2">
                            <ShimmerLine className="h-3 w-full" />
                            <ShimmerLine className="h-3 w-full" />
                            <ShimmerLine className="h-3 w-5/6" />
                        </div>
                        {/* Button/Action link */}
                        <div className="pt-4 border-t border-slate-50 dark:border-slate-800/30 flex items-center justify-between mt-auto">
                            <ShimmerLine className="h-4 w-24" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
    <div className="w-full overflow-hidden rounded-xl border border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/40">
                        {Array.from({ length: cols }).map((_, i) => (
                            <th key={i} className="py-4 px-6">
                                <ShimmerLine className="h-4 w-20" />
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {Array.from({ length: rows }).map((_, i) => (
                        <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                            {Array.from({ length: cols }).map((_, j) => (
                                <td key={j} className="py-4 px-6">
                                    <ShimmerLine 
                                        className={`h-4 ${
                                            j === 0 ? "w-8/12" : j === 1 ? "w-11/12" : j === 2 ? "w-16" : j === 3 ? "w-24" : "w-16"
                                        }`} 
                                    />
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);

export const DashboardSkeleton = () => (
    <div className="space-y-8">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
                <div 
                    key={i} 
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50 p-5 shadow-sm h-32 flex flex-col justify-between"
                >
                    <div className="flex justify-between items-start">
                        <ShimmerLine className="h-3 w-20" />
                        <ShimmerLine className="h-8 w-8 rounded-lg" />
                    </div>
                    <div className="mt-2 space-y-2">
                        <ShimmerLine className="h-7 w-12" />
                        <ShimmerLine className="h-3 w-24" />
                    </div>
                </div>
            ))}
        </div>

        {/* Dashboard Charts Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50 p-5 shadow-sm lg:col-span-2 h-72 flex flex-col justify-between">
                <div className="space-y-2">
                    <ShimmerLine className="h-4 w-40" />
                    <ShimmerLine className="h-3 w-28" />
                </div>
                <div className="animate-shimmer w-full h-40 rounded-xl bg-slate-200 dark:bg-slate-800 mt-4" />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50 p-5 shadow-sm lg:col-span-1 h-72 flex flex-col justify-between">
                <div className="space-y-2">
                    <ShimmerLine className="h-4 w-32" />
                    <ShimmerLine className="h-3 w-24" />
                </div>
                <div className="flex justify-center items-center py-4 w-full">
                    <div className="animate-shimmer w-full h-32 rounded-xl bg-slate-200 dark:bg-slate-800" />
                </div>
            </div>
        </div>

        {/* Search & Filter Controls placeholder */}
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800/50 p-4 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <ShimmerLine className="h-10 w-full md:max-w-md rounded-lg" />
            <div className="flex gap-2">
                <ShimmerLine className="h-10 w-24 rounded-lg" />
                <ShimmerLine className="h-10 w-24 rounded-lg" />
            </div>
        </div>

        {/* Table List View */}
        <TableSkeleton rows={4} cols={5} />
    </div>
);
