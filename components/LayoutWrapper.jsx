"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();
    // Check if the current path starts with /manage (Dashboard routes)
    const isDashboard = pathname?.startsWith("/manage");

    if (isDashboard) {
        // In dashboard, we only render children (which includes the dashboard's own layout/sidebar)
        return <>{children}</>;
    }

    // In public pages, render standard layout with Header and Footer
    return (
        <>
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
        </>
    );
}
