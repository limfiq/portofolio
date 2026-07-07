"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";
import { CardSkeleton } from "./Skeleton";
import { Card, CardImage, CardContent, CardTitle, CardDescription, CardFooter, CardLink } from "./ui/Card";
import { Button } from "./ui/Button";
import { stripHtml, getGoogleDriveImageUrl, truncateText } from "../utils/formatters";

const PostCard = ({ title, description, slug, imageUrl }) => (
    <Card>
        <CardImage>
            <Image
                src={imageUrl}
                alt={title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
        </CardImage>
        <CardContent>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardContent>
        <CardFooter>
            <CardLink href={`/blog/${slug}`}>
                Baca Selengkapnya <span>&rarr;</span>
            </CardLink>
        </CardFooter>
    </Card>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange, loading }) => {
    const hasPrev = currentPage > 1;
    const hasNext = currentPage < totalPages;

    if (totalPages <= 1) return null;

    return (
        <div className="flex justify-center items-center gap-4 mt-12">
            <Button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPrev || loading}
                variant={hasPrev && !loading ? 'primary' : 'outline'}
                size="md"
            >
                &laquo; Sebelumnya
            </Button>
            <span className="text-slate-600 dark:text-slate-350 text-xs font-semibold">
                Halaman {currentPage} dari {totalPages}
            </span>
            <Button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNext || loading}
                variant={hasNext && !loading ? 'primary' : 'outline'}
                size="md"
            >
                Selanjutnya &raquo;
            </Button>
        </div>
    );
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
                                description={truncateText(stripHtml(blog.content), 100)}
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
                            description={truncateText(stripHtml(blog.content), 100)}
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