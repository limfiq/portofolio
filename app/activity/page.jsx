import Header from "@/components/Header";
import RecentActivity from "@/components/RecentActivity";
import Footer from "@/components/Footer";

export default function Activity() {
    return (
        <div className="bg-gray-50 text-gray-800">
            <Header />
            <main>
                <RecentActivity />
            </main>
            <Footer />
        </div>
    );
}
