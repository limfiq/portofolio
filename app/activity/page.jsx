import RecentActivity from "@/components/RecentActivity";
import PageTracker from "@/components/PageTracker";


export default function Activity() {
    return (
        <div className="bg-gray-50 text-gray-800">
            <PageTracker name="Aktivitas" />

            <main>
                <RecentActivity />
            </main>
        </div>
    );
}
