"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";
import { CardSkeleton } from "./Skeleton";

const PostCard = ({ title, description, slug, imageUrl }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-sm hover:shadow-xl rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
        <div className="relative w-full h-48 bg-slate-100 dark:bg-slate-800">
             <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {title}
            </h3>
            
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                {description}
            </p>
            
            <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50 mt-auto">
                <Link href={`/blog/${slug}`} className="font-bold text-xs text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                    Baca Selengkapnya <span>&rarr;</span>
                </Link>
            </div>
        </div>
    </div>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange, loading }) => {
    const hasPrev = currentPage > 1;
    const hasNext = currentPage < totalPages;
    const btnBase = "px-4 py-2 rounded-lg font-semibold text-xs transition-colors shadow-sm select-none active:scale-95";
    const btnActive = "bg-blue-600 text-white hover:bg-blue-700";
    const btnDisabled = "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed";

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
            <span className="text-slate-600 dark:text-slate-350 text-xs font-semibold">
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

const RecentPostsSection = ({ isHomepage = false }) => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const POSTS_PER_PAGE = isHomepage ? 3 : 9;

    const fetchBlogs = async (page) => {
        setLoading(true);
        setError(null);
        try {
            const from = (page - 1) * POSTS_PER_PAGE;
            const to = from + POSTS_PER_PAGE - 1;

            let query = supabase
                .from('blogs')
                .select('id, title, slug, content, cover_image', { count: 'exact' })
                .eq('status', 'published')
                .order('created_at', { ascending: false });

            if (isHomepage) {
                query = query.limit(3);
            } else {
                query = query.range(from, to);
            }

            const { data, error, count } = await query;

            if (error) throw error;
            setBlogs(data || []);
            if (!isHomepage && count) {
                setTotalPages(Math.ceil(count / POSTS_PER_PAGE));
            }
        } catch (err) {
            console.error("Error fetching blogs:", err.message);
            setError("Gagal memuat tulisan terbaru.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlogs(currentPage);
    }, [currentPage, isHomepage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            document.getElementById('blog-grid')?.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const truncateContent = (content, maxLength = 100) => {
        if (!content) return '';
        const plainText = content.replace(/<[^>]+>/g, '');
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

    if (loading && blogs.length === 0) return <p className="text-center py-16 text-slate-500">Memuat tulisan...</p>;
    if (error) return <p className="text-center py-16 text-red-500">{error}</p>;
    if (blogs.length === 0) return <p className="text-center py-16 text-slate-500">Belum ada tulisan terbaru.</p>;

    // 1. Homepage Minimalist View
    if (isHomepage) {
        return (
            <section className="py-24 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-850/50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider text-xs uppercase mb-3 block">
                                Artikel & Berita
                            </span>
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                Pemikiran & Catatan Terbaru
                            </h2>
                        </div>
                        <Link 
                            href="/blog" 
                            className="text-sm font-semibold text-blue-600 dark:text-blue-450 hover:underline flex items-center gap-1 group"
                        >
                            Lihat Semua Artikel
                            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                </div>
            </section>
        );
    }

    // 2. Full Listing View (For `/blog` Page)
    return (
        <section className="bg-slate-50/30 dark:bg-slate-950/20 min-h-screen pb-16">
            {/* Banner Section */}
            <div className="relative h-48 md:h-64 mb-12 overflow-hidden shadow-lg">
                <Image
                    src="/banner5.png"
                    alt="Tulisan Terbaru"
                    fill
                    priority
                    className="object-cover z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-red-900 to-orange-600 opacity-70 z-10"></div>
                <div className="relative z-20 flex items-center justify-center h-full">
                    <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-4">Tulisan Terbaru</h2>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 mt-8" id="blog-grid">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

export default RecentPostsSection;