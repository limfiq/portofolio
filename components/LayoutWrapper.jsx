"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const AIChatbot = dynamic(() => import("@/components/AIChatbot"), { ssr: false });
const PageHitCounter = dynamic(() => import("@/components/PageHitCounter"), { ssr: false });

export default function LayoutWrapper({ children }) {
    const pathname = usePathname();

    useEffect(() => {
        try {
            localStorage.removeItem("theme");
        } catch (_) {}

        const updateThemeByTime = () => {
            const hour = new Date().getHours();
            const isNight = hour >= 18 || hour < 6;
            if (isNight) {
                document.documentElement.classList.add("dark");
            } else {
                document.documentElement.classList.remove("dark");
            }
        };

        updateThemeByTime();
        const interval = setInterval(updateThemeByTime, 60000);
        return () => clearInterval(interval);
    }, []);

    // Check if the current path starts with /manage (Dashboard routes)
    const isDashboard = pathname?.startsWith("/manage");

    if (isDashboard) {
        // In dashboard, we only render children (which includes the dashboard's own layout/sidebar)
        return <>{children}</>;
    }

    // In public pages, render standard layout with Header, Footer and floating AIChatbot
    return (
        <>
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <PageHitCounter />
            <AIChatbot />
            <Footer />
        </>
    );
}
