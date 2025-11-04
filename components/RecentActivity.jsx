"use client";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient"; // Pastikan path ini benar

const PostCard = ({ title, description, slug, imageUrl }) => (
    <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <Image src={imageUrl} alt={title} width={400} height={250} className="w-full h-48 object-cover" />
        <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <Link href={`/activity/${slug}`} className="font-semibold text-blue-600 hover:underline">
                Baca Selengkapnya &rarr;
            </Link>
        </div>
    </div>
);

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
                    .select('id, title, description, link') // Pilih kolom yang relevan
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
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-8">Aktivitas Pengabdian Terbaru</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {activities.map((activity) => (
                        <PostCard
                            key={activity.id}
                            title={activity.title}
                            description={activity.description}
                            // Untuk slug, kita bisa menggunakan ID atau membuat slug dari title.
                            // Untuk saat ini, kita gunakan ID. Jika ingin slug yang lebih SEO-friendly,
                            // Anda bisa menambahkan kolom 'slug' di tabel atau membuat fungsi slugify.
                            slug={activity.id.toString()}
                            // Tabel community_services tidak memiliki kolom gambar.
                            // Kita gunakan placeholder atau tambahkan kolom 'image_url' di tabel.
                            imageUrl="/placeholder.jpg"
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentActivity;