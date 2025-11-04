import Footer from "@/components/Footer";
import Header from "@/components/Header";
import RecentPublications from "@/components/RecentPublications";

export default function PublicationsPage() {
    return (
        <div className="bg-gray-50 text-gray-800">
            <Header />
            <main>
                <RecentPublications />
            </main>
            <Footer />
        </div>
    );
}