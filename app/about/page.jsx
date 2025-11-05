import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProfessionalCV from "@/components/ProfessionalCV";

export default function About() {
    return (
        <div className="bg-gray-50 text-gray-800">
            <Header />
            <main>
                <ProfessionalCV />
            </main>
            <Footer />
        </div>
    );
}
