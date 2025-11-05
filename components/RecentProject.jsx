"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient"; // Pastikan path ini benar

const PostCard = ({ title, description, slug, imageUrl }) => (
    <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <Image src={imageUrl} alt={title} width={400} height={250} className="w-full h-48 object-cover" />
        <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <Link href={`/project/${slug}`} className="font-semibold text-blue-600 hover:underline">
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

const RecentProject = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('research_projects')
                    .select('id, title, abstract, cover_image') // Mengambil kolom cover_image
                    .order('created_at', { ascending: false }); // Urutkan berdasarkan data terbaru
                // .limit(3); // Ambil 3 proyek terbaru

                if (error) throw error;
                setProjects(data);
            } catch (err) {
                console.error("Error fetching research projects:", err.message);
                setError("Gagal memuat proyek riset terbaru.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) return <p className="text-center py-16">Memuat proyek riset...</p>;
    if (error) return <p className="text-center py-16 text-red-500">{error}</p>;
    if (projects.length === 0) return <p className="text-center py-16">Belum ada proyek riset terbaru.</p>;

    return (
        <section className="bg-white py-16">
            {/* Banner Section - Full Width */}
            <div className="relative h-48 md:h-64 mb-12 overflow-hidden shadow-lg">
                <Image
                    src="/placeholder-banner-projects.jpg" // Ganti dengan gambar banner yang sesuai
                    alt="Proyek Riset Terbaru"
                    layout="fill"
                    objectFit="cover"
                    className="z-0"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-teal-600 opacity-70 z-10"></div>
                {/* Title */}
                <div className="relative z-20 flex items-center justify-center h-full">
                    <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-4">Proyek Riset</h2>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-6 mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <PostCard
                            key={project.id}
                            title={project.title}
                            description={project.abstract}
                            slug={project.id.toString()}
                            imageUrl={getGoogleDriveImageUrl(project.cover_image)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentProject;