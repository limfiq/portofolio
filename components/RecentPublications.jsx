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
                    .select('id, title, abstract, year, type, cover_image') // Pilih kolom yang relevan, termasuk cover_image
                    .order('year', { ascending: false }); // Urutkan berdasarkan tahun terbaru
                // .limit(3); // Ambil 3 publikasi terbaru

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
            {/* Banner Section - Full Width */}
            <div className="relative h-48 md:h-64 mb-12 overflow-hidden shadow-lg">
                <Image
                    src="/placeholder-banner-publications.jpg" // Ganti dengan gambar banner yang sesuai
                    alt="Publikasi Terbaru"
                    layout="fill"
                    objectFit="cover"
                    className="z-0"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-600 opacity-70 z-10"></div>
                {/* Title */}
                <div className="relative z-20 flex items-center justify-center h-full">
                    <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-4">Publikasi</h2>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-6 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {publications.map((item) => (
                        <PostCard
                            key={item.id}
                            title={item.title}
                            description={item.abstract}
                            slug={item.id.toString()}
                            year={item.year}
                            type={item.type}
                            imageUrl={getGoogleDriveImageUrl(item.cover_image)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentPublications;