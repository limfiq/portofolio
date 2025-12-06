import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import RecentPostsSection from "@/components/RecentPostsSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-gray-50 text-gray-800">
      <link rel="icon" href="/favicon.ico" />
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <RecentPostsSection />
      </main>
      <Footer />
    </div>
  );
}