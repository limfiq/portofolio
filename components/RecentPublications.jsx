"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient"; // Pastikan path ini benar

const PostCard = ({ title, description, slug, imageUrl, year, type }) => (
    <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <Image src={imageUrl} alt={title} width={400} height={250} className="w-full h-48 object-cover" />
        <div className="p-6">
            <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                <span>{type}</span>
                <span>{year}</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4 line-clamp-3">{description}</p>
            <Link href={`/publications/${slug}`} className="font-semibold text-blue-600 hover:underline">
                Baca Selengkapnya &rarr;
            </Link>
        </div>
    </div>
);

const RecentPublications = () => {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPublications = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('publications')
                    .select('id, title, abstract, year, type') // Pilih kolom yang relevan
                    .order('year', { ascending: false }) // Urutkan berdasarkan tahun terbaru
                    .limit(3); // Ambil 3 publikasi terbaru

                if (error) throw error;
                setPublications(data);
            } catch (err) {
                console.error("Error fetching publications:", err.message);
                setError("Gagal memuat publikasi terbaru.");
            } finally {
                setLoading(false);
            }
        };

        fetchPublications();
    }, []);

    if (loading) return <p className="text-center py-16">Memuat publikasi...</p>;
    if (error) return <p className="text-center py-16 text-red-500">{error}</p>;
    if (publications.length === 0) return <p className="text-center py-16">Belum ada publikasi terbaru.</p>;

    return (
        <section className="bg-white py-16">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-8">Publikasi Terbaru</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {publications.map((item) => (
                        <PostCard
                            key={item.id}
                            title={item.title}
                            description={item.abstract}
                            slug={item.id.toString()}
                            year={item.year}
                            type={item.type}
                            imageUrl="/placeholder.jpg" // Gunakan placeholder
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentPublications;