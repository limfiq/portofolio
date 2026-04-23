"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

// --- KOMPONEN KECIL (Helper & UI) ---

const PostCard = ({ title, description, slug, imageUrl }) => (
    <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
        {/* Tambahkan relative wrapper untuk Image agar fill berfungsi baik */}
        <div className="relative w-full h-48">
             <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-xl font-semibold mb-2 line-clamp-2">{title}</h3>
            <p className="text-gray-600 mb-4 flex-grow line-clamp-3">{description}</p>
            <Link href={`/blog/${slug}`} className="font-semibold text-blue-600 hover:underline mt-auto">
                Baca Selengkapnya &rarr;
            </Link>
        </div>
    </div>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange, loading }) => {
    const hasPrev = currentPage > 1;
    const hasNext = currentPage < totalPages;

    // Style dasar tombol
    const btnBase = "px-4 py-2 rounded font-semibold transition-colors";
    const btnActive = "bg-blue-600 text-white hover:bg-blue-700";
    const btnDisabled = "bg-gray-200 text-gray-500 cursor-not-allowed";

    if (totalPages <= 1) return null; // Sembunyikan jika hanya 1 halaman

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
    if (!imageIdentifier) return "/banner1.png";
    if (imageIdentifier.startsWith('http')) return imageIdentifier;
    return `https://drive.google.com/uc?export=view&id=${imageIdentifier}`;
};

// --- KOMPONEN UTAMA ---

const RecentPostsSection = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State baru untuk paginasi
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const POSTS_PER_PAGE = 3;

    // Fungsi fetch data yang menerima parameter 'page'
    const fetchBlogs = async (page) => {
        setLoading(true);
        setError(null);
        try {
            // Hitung range untuk paginasi Supabase
            const from = (page - 1) * POSTS_PER_PAGE;
            const to = from + POSTS_PER_PAGE - 1;

            const { data, error, count } = await supabase
                .from('blogs')
                .select('id, title, slug, content, cover_image', { count: 'exact' }) // Minta total hitungan
                .eq('status', 'published')
                .order('created_at', { ascending: false })
                .range(from, to); // Terapkan range

            if (error) throw error;

            setBlogs(data);
            // Hitung total halaman dari 'count' yang didapat
            if (count) {
                setTotalPages(Math.ceil(count / POSTS_PER_PAGE));
            }
        } catch (err) {
            console.error("Error fetching blogs:", err.message);
            setError("Gagal memuat tulisan terbaru.");
        } finally {
            setLoading(false);
        }
    };

    // Panggil fetch saat komponen pertama kali dimuat ATAU saat currentPage berubah
    useEffect(() => {
        fetchBlogs(currentPage);
    }, [currentPage]);

    // Fungsi handler saat tombol paginasi diklik
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            // Opsional: Scroll ke atas grid saat pindah halaman
            document.getElementById('blog-grid')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const truncateContent = (content, maxLength = 100) => {
        if (!content) return '';
        // Hapus tag HTML
        const plainText = content.replace(/<[^>]+>/g, '');
        // Decode HTML entities (seperti &nbsp;)
        const entities = {
            '&nbsp;': ' ',
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#39;': "'",
        };
        const decodedText = plainText.replace(/&[a-z0-9#]+;/gi, (match) => entities[match] || match);
        
        if (decodedText.length <= maxLength) return decodedText;
        return decodedText.substring(0, maxLength) + '...';
    };

    return (
        <section className="bg-white py-16">
            {/* Banner Section */}
            <div className="relative h-24 md:h-64 mb-12 overflow-hidden shadow-lg">
                <Image
                    src="/banner5.png"
                    alt="Tulisan Terbaru"
                    fill
                    className="object-cover z-0"
                    priority // Banner penting untuk LCP
                />
                <div className="absolute inset-0 bg-gradient-to-r from-red-900 to-orange-600 opacity-70 z-10"></div>
                <div className="relative z-20 flex items-center justify-center h-full">
                    <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-4">Tulisan Terbaru</h2>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-8" id="blog-grid">
                {/* Tampilkan loading state atau error di dalam area konten */}
                {loading && blogs.length === 0 ? (
                    <p className="text-center py-16 text-gray-500">Memuat tulisan...</p>
                ) : error ? (
                    <p className="text-center py-16 text-red-500">{error}</p>
                ) : blogs.length === 0 ? (
                    <p className="text-center py-16 text-gray-500">Belum ada tulisan terbaru.</p>
                ) : (
                    <>
                        {/* Grid Postingan */}
                        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ${loading ? 'opacity-50 transition-opacity' : ''}`}>
                            {blogs.map((blog) => (
                                <PostCard
                                    key={blog.id}
                                    title={blog.title}
                                    description={truncateContent(blog.content)}
                                    slug={blog.slug}
                                    imageUrl={getGoogleDriveImageUrl(blog.cover_image)}
                                />
                            ))}
                        </div>

                        {/* Kontrol Paginasi */}
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                            loading={loading}
                        />
                    </>
                )}
            </div>
        </section>
    );
};

export default RecentPostsSection;