"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";

const PostCard = ({ title, description, slug, imageUrl }) => (
    <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <Image src={imageUrl} alt={title} width={400} height={250} className="w-full h-48 object-cover" />
        <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <Link href={`/blog/${slug}`} className="font-semibold text-blue-600 hover:underline">
                Baca Selengkapnya &rarr;
            </Link>
        </div>
    </div>
);

const RecentPostsSection = () => {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('blogs')
                    .select('id, title, slug, content, cover_image')
                    .eq('status', 'published') // Hanya ambil blog yang sudah dipublikasikan
                    .order('created_at', { ascending: false }) // Urutkan berdasarkan tanggal terbaru
                    .limit(3); // Ambil 3 tulisan terbaru

                if (error) throw error;
                setBlogs(data);
            } catch (err) {
                console.error("Error fetching blogs:", err.message);
                setError("Gagal memuat tulisan terbaru.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, []);

    const truncateContent = (content, maxLength = 100) => {
        if (!content) return '';
        if (content.length <= maxLength) return content;
        return content.substring(0, maxLength) + '...';
    };

    if (loading) return <p className="text-center py-16">Memuat tulisan terbaru...</p>;
    if (error) return <p className="text-center py-16 text-red-500">{error}</p>;
    if (blogs.length === 0) return <p className="text-center py-16">Belum ada tulisan terbaru.</p>;

    return (
        <section className="bg-white py-16">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-8">Tulisan Terbaru</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {blogs.map((blog) => (
                        <PostCard
                            key={blog.id}
                            title={blog.title}
                            description={truncateContent(blog.content)}
                            slug={blog.slug}
                            imageUrl={blog.cover_image || "/placeholder.jpg"}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentPostsSection;