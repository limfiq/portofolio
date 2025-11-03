import Header from "@/components/Header";
import RecentProject from "@/components/RecentProject"
import Footer from "@/components/Footer";

export default function Project() {
    return (
        <div className="bg-gray-50 text-gray-800">
            <Header />
            <main>
                <RecentProject />
            </main>
            <Footer />
        </div>
    );
}
