"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient"; // Pastikan path ini benar

const PostCard = ({ title, description, slug, imageUrl }) => (
    <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <Image src={imageUrl} alt={title} width={400} height={250} className="w-full h-48 object-cover" priority />
        <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <Link href={`/teaching/${slug}`} className="font-semibold text-blue-600 hover:underline" prefetch={false}>
                Baca Selengkapnya &rarr;
            </Link>
        </div>
    </div>
);

const RecentLecturer = () => {
    const [teachings, setTeachings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeaching = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('teaching')
                    .select('id, course_name, description') // Pilih kolom yang relevan
                    .order('created_at', { ascending: false }); // Urutkan berdasarkan data terbaru
                // .limit(3);  Ambil 3 data mengajar terbaru

                if (error) {
                    throw error;
                }

                setTeachings(data);
            } catch (err) {
                console.error("Error fetching teaching data:", err.message);
                setError("Gagal memuat data mengajar.");
            } finally {
                setLoading(false);
            }
        };

        fetchTeaching();
    }, []);

    if (loading) return <p className="text-center py-16">Memuat data mengajar...</p>;
    if (error) return <p className="text-center py-16 text-red-500">{error}</p>;
    if (teachings.length === 0) return <p className="text-center py-16">Belum ada data mengajar terbaru.</p>;

    return (
        <section className="bg-white py-16">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-8">Aktivitas Mengajar Terbaru</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {teachings.map((item) => (
                        <PostCard
                            key={item.id}
                            title={item.course_name}
                            description={item.description}
                            slug={item.id.toString()}
                            imageUrl="/placeholder.jpg" // Gunakan placeholder karena tidak ada gambar di tabel
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentLecturer;