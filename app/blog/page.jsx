import PageTracker from "@/components/PageTracker";
import RecentPostsSection from "@/components/RecentPostsSection";

export default function BlogPage() {
    return (
        <div className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen">
            <PageTracker name="Tulisan" />
            <main>
                <RecentPostsSection />
            </main>
        </div>
    );
}
