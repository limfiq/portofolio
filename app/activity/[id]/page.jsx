import { supabase } from '@/config/supabaseClient';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';

// Fungsi untuk mengambil data untuk satu aktivitas
async function getActivity(id) {
    const { data, error } = await supabase
        .from('community_services')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !data) {
        notFound();
    }

    return data;
}

// Halaman detail aktivitas
export default async function ActivityDetailPage({ params }) {
    const activity = await getActivity(params.id);

    return (
        <div className="bg-gray-50 min-h-screen">
            <Header />
            <main className="py-12">
                <div className="max-w-4xl mx-auto px-6 bg-white rounded-lg shadow-lg p-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{activity.title}</h1>
                    
                    <div className="flex items-center text-gray-500 mb-6">
                        <span className="mr-4">
                            <strong>Lokasi:</strong> {activity.location || 'Tidak disebutkan'}
                        </span>
                        <span>
                            <strong>Tahun:</strong> {activity.year || 'Tidak disebutkan'}
                        </span>
                    </div>

                    <div className="prose prose-lg max-w-none text-gray-700">
                        <p>{activity.description}</p>
                    </div>

                    {activity.link && (
                        <div className="mt-8">
                            <Link href={activity.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                                Lihat Tautan Eksternal &rarr;
                            </Link>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    );
}
