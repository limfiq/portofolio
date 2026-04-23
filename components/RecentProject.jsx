"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../config/supabaseClient"; // Pastikan path ini benar

const stripHtml = (html) => {
    if (!html) return "";
    const cleanTag = html.replace(/<[^>]*>?/gm, '');
    const entities = {
        '&nbsp;': ' ',
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
    };
    return cleanTag.replace(/&[a-z0-9#]+;/gi, (match) => entities[match] || match);
};

const PostCard = ({ title, description, slug, imageUrl }) => (
    <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <Image src={imageUrl} alt={title} width={400} height={250} className="w-full h-48 object-cover" />
        <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{stripHtml(description)}</p>
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
// pagination controls (reused style from RecentPostsSection)
const PaginationControls = ({ currentPage, totalPages, onPageChange, loading }) => {
    const hasPrev = currentPage > 1;
    const hasNext = currentPage < totalPages;
    const btnBase = "px-4 py-2 rounded font-semibold transition-colors";
    const btnActive = "bg-blue-600 text-white hover:bg-blue-700";
    const btnDisabled = "bg-gray-200 text-gray-500 cursor-not-allowed";
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-center items-center gap-4 mt-12">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrev || loading}
                className={`${btnBase} ${hasPrev && !loading ? btnActive : btnDisabled}`}
            >
                &laquo; Sebelumnya
            </button>
            <span className="text-gray-700 font-medium">
                Halaman {currentPage} dari {totalPages}
            </span>
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNext || loading}
                className={`${btnBase} ${hasNext && !loading ? btnActive : btnDisabled}`}
            >
                Selanjutnya &raquo;
            </button>
        </div>
    );
};

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
    const router = useRouter();
    const searchParams = useSearchParams();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const PER_PAGE = 9;

    // initialize page from query param if present
    useEffect(() => {
        const param = parseInt(searchParams.get('page') || '', 10);
        if (param && param > 0) {
            setCurrentPage(param);
        }
    }, [searchParams]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            router.push(`?page=${newPage}`, { shallow: true });
            document.getElementById('project-grid')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const from = (currentPage - 1) * PER_PAGE;
                const to = from + PER_PAGE - 1;

                const { data, error, count } = await supabase
                    .from('research_projects')
                    .select('id, title, abstract, cover_image, slug', { count: 'exact' })
                    .order('created_at', { ascending: false })
                    .range(from, to);

                if (error) throw error;
                setProjects(data || []);
                setTotalPages(count ? Math.ceil(count / PER_PAGE) : 0);
            } catch (err) {
                console.error("Error fetching research projects:", err.message);
                setError("Gagal memuat proyek riset terbaru.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [currentPage]);

    if (loading && projects.length === 0) return <p className="text-center py-16">Memuat proyek riset...</p>;
    if (error) return <p className="text-center py-16 text-red-500">{error}</p>;
    if (!loading && projects.length === 0) return <p className="text-center py-16">Belum ada proyek riset terbaru.</p>;

    return (
        <section className="bg-white py-16">
            {/* Banner Section - Full Width */}
            <div className="relative h-48 md:h-64 mb-12 overflow-hidden shadow-lg">
                <Image
                    src="/banner4.png" // Ganti dengan gambar banner yang sesuai
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
            <div className="max-w-6xl mx-auto px-6 mt-8" id="project-grid">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <PostCard
                            key={project.id}
                            title={project.title}
                            description={project.abstract}
                            slug={project.slug}
                            imageUrl={getGoogleDriveImageUrl(project.cover_image)}
                        />
                    ))}
                </div>
                <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    loading={loading}
                />
            </div>
        </section>
    );
};

export default RecentProject;