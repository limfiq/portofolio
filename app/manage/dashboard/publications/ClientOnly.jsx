"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
    </div>
);

const ProfessionalCV = dynamic(() => import('../components/ProfessionalCV'), {
    loading: () => <LoadingSpinner />,
    ssr: false,
});

const RecentPostsSection = dynamic(() => import('../components/RecentPostsSection'), {
    loading: () => <LoadingSpinner />,
    ssr: false,
});

const ClientOnly = () => {
    return (
        <>
            <ProfessionalCV />
            <RecentPostsSection />
        </>
    );
};

export default ClientOnly;