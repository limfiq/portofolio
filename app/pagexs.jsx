import dynamic from 'next/dynamic';
import HeroSection from '../components/HeroSection'; // Asumsi Anda punya komponen Hero

// Komponen Loading sederhana untuk ditampilkan saat komponen lain sedang dimuat
const LoadingSpinner = () => (
    <div className="text-center py-20">
        <p className="text-lg text-gray-500">Memuat konten...</p>
    </div>
);

// --- Implementasi Lazy Loading dengan next/dynamic ---
// Setiap komponen akan dimuat hanya ketika akan ditampilkan di viewport.
const ProfessionalCV = dynamic(() => import('../components/ProfessionalCV'), {
    loading: () => <LoadingSpinner />,
    ssr: false // Nonaktifkan SSR jika komponen sangat bergantung pada API client-side
});

const RecentPostsSection = dynamic(() => import('../components/RecentPostsSection'), {
    loading: () => <LoadingSpinner />
});

const RecentPublications = dynamic(() => import('../components/RecentPublications'), {
    loading: () => <LoadingSpinner />
});

const RecentProject = dynamic(() => import('../components/RecentProject'), {
    loading: () => <LoadingSpinner />
});

const RecentActivity = dynamic(() => import('../components/RecentActivity'), {
    loading: () => <LoadingSpinner />
});

export default function HomePage() {
    return (
        <main>
            {/* <HeroSection /> */}
            <ProfessionalCV userId={1} />
            <RecentPostsSection />
            <RecentPublications />
            <RecentProject />
            <RecentActivity />
        </main>
    );
}