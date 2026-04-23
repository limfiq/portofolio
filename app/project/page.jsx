import RecentProject from "@/components/RecentProject"
import PageTracker from "@/components/PageTracker";


export default function Project() {
    return (
        <div className="bg-gray-50 text-gray-800">
            <PageTracker name="Proyek" />

            <main>
                <RecentProject />
            </main>
        </div>
    );
}
