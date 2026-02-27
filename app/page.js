import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import RecentPostsSection from "@/components/RecentPostsSection";
import RecentActivity from "@/components/RecentActivity";
import RecentProject from "@/components/RecentProject";

export default function Home() {
    return (
        <div className="bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-100 transition-colors duration-300">
            <div className="container mx-auto px-4 md:px-0 space-y-24 pb-20">
                <HeroSection />
                <AboutSection />
                <RecentPostsSection />
                <RecentActivity />
                <RecentProject />
            </div>
        </div>
    );
}