import RecentPublications from "@/components/RecentPublications";
import PageTracker from "@/components/PageTracker";


export default function PublicationsPage() {
    return (
        <div className="bg-gray-50 text-gray-800">
            <PageTracker name="Publikasi" />

            <main>
                <RecentPublications />
            </main>
        </div>
    );
}