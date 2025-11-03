import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import RecentPostsSection from "@/components/RecentPostsSection";
import RecentCommunity from "@/components/RecentCommunity";
import RecentActivity from "@/components/RecentActivity";
import RecentPublication from "@/components/RecentPublication";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="bg-gray-50 text-gray-800">
      <Header />
      <main>
        <HeroSection />
        <AboutSection />
        <RecentPublication />
        <RecentCommunity />
        <RecentActivity />
        <RecentPostsSection />
      </main>
      <Footer />
    </div>
  );
}
