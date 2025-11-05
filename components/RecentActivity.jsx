"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient"; // Pastikan path ini benar

const PostCard = ({ title, description, slug, imageUrl, location, year }) => (
    <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <Image src={imageUrl} alt={title} width={400} height={250} className="w-full h-48 object-cover" />
        <div className="p-6">
            <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                <span className="truncate pr-2">{location}</span>
                <span className="flex-shrink-0">{year}</span>
            </div>
            <h3 className="text-xl font-semibold mb-2 line-clamp-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <Link href={`/activity/${slug}`} className="font-semibold text-blue-600 hover:underline">
                Baca Selengkapnya &rarr;
            </Link>
        </div>
    </div>
);

/**
 * Mengubah ID file Google Drive menjadi URL gambar yang dapat ditampilkan.
 * Juga menangani kasus di mana input sudah menjadi URL lengkap.
 * @param {string} imageIdentifier - ID file Google Drive atau URL gambar lengkap.
 * @returns {string} URL gambar langsung atau URL placeholder jika ID tidak valid.
 */
const getGoogleDriveImageUrl = (imageIdentifier) => {
    if (!imageIdentifier) {
        return "/placeholder.jpg";
    }
    // Jika sudah merupakan URL, kembalikan langsung.
    if (imageIdentifier.startsWith('http')) {
        return imageIdentifier;
    }
    // Jika bukan, anggap sebagai ID Google Drive dan buat URL-nya.
    return `https://drive.google.com/uc?export=view&id=${imageIdentifier}`;
};

const RecentActivity = () => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCommunityServices = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('community_services')
                    .select('id, title, description, link, cover_image, location, year, slug') // Mengambil kembali 'cover_image'
                    .order('created_at', { ascending: false }); // Urutkan berdasarkan tanggal terbaru
                // .limit(3); // Ambil 3 aktivitas terbaru

                if (error) {
                    throw error;
                }

                setActivities(data);
            } catch (err) {
                console.error("Error fetching community services:", err.message);
                setError("Gagal memuat aktivitas terbaru.");
            } finally {
                setLoading(false);
            }
        };

        fetchCommunityServices();
    }, []);

    if (loading) return <p className="text-center py-16">Memuat aktivitas...</p>;
    if (error) return <p className="text-center py-16 text-red-500">{error}</p>;
    if (activities.length === 0) return <p className="text-center py-16">Belum ada aktivitas terbaru.</p>;

    return (
        <section className="bg-white py-16">
            {/* Banner Section - Full Width */}
            <div className="relative h-48 md:h-64 mb-12 overflow-hidden shadow-lg">
                {/* Background Image */}
                <Image
                    src="/banner2.png" // Ganti dengan gambar banner yang sesuai
                    alt="Aktivitas Pengabdian"
                    layout="fill"
                    objectFit="cover"
                    className="z-0"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-cyan-600 opacity-70 z-10"></div>
                {/* Title */}
                <div className="relative z-20 flex items-center justify-center h-full">
                    <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-4">Aktivitas Pengabdian</h2>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-6 mt-8"> {/* Konten aktivitas di dalam container */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {activities.map((activity) => (
                        <PostCard
                            key={activity.id}
                            title={activity.title}
                            description={activity.description}
                            // Untuk slug, kita bisa menggunakan ID atau membuat slug dari title.
                            // Untuk saat ini, kita gunakan ID. Jika ingin slug yang lebih SEO-friendly,
                            // Anda bisa menambahkan kolom 'slug' di tabel atau membuat fungsi slugify.
                            slug={activity.slug}
                            location={activity.location}
                            year={activity.year}
                            imageUrl={getGoogleDriveImageUrl(activity.cover_image)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentActivity;