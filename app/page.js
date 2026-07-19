import { Suspense } from "react";
import dynamic from "next/dynamic";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import TechStackSection from "@/components/TechStackSection";

// Dynamically import client components to reduce initial JS bundle size
const FeaturedTeachingSection = dynamic(() => import("@/components/FeaturedTeachingSection"));
const RecentPostsSection = dynamic(() => import("@/components/RecentPostsSection"));
const RecentActivity = dynamic(() => import("@/components/RecentActivity"));
const RecentProject = dynamic(() => import("@/components/RecentProject"));
import PageTracker from "@/components/PageTracker";

export default function Home() {
    return (
        <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-300 min-h-screen">
            <Suspense fallback={null}>
                <PageTracker name="Home" />
            </Suspense>
            
            {/* Hero & About Introduction */}
            <HeroSection />
            <AboutSection />
            
            {/* Developer Tech Stack */}
            <TechStackSection />
            
            {/* Academic Class Highlights */}
            <Suspense fallback={<div className="text-center py-12 text-slate-500">Memuat pengajaran...</div>}>
                <FeaturedTeachingSection />
            </Suspense>
            
            {/* Research & Developer Projects */}
            <Suspense fallback={<div className="text-center py-12 text-slate-500">Memuat proyek...</div>}>
                <RecentProject isHomepage={true} />
            </Suspense>
            
            {/* Community Service Activities */}
            <Suspense fallback={<div className="text-center py-12 text-slate-500">Memuat aktivitas...</div>}>
                <RecentActivity isHomepage={true} />
            </Suspense>
            
            {/* Developer Notes & Blog Insights */}
            <Suspense fallback={<div className="text-center py-12 text-slate-500">Memuat tulisan...</div>}>
                <RecentPostsSection isHomepage={true} />
            </Suspense>
        </div>
    );
}