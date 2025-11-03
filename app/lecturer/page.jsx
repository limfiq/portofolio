import Header from "@/components/Header";
import RecentLecturer from "@/components/RecentLecturer";
import Footer from "@/components/Footer";


export default function Lecturer() {
    return (
        <div className="bg-gray-50 text-gray-800">
            <Header />
            <main>
                <RecentLecturer />
            </main>
            <Footer />
        </div>
    );
}
