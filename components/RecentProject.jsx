"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../config/supabaseClient";

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

const ProjectCard = ({ title, description, slug, imageUrl, role, fundingSource, yearStart, yearEnd }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-sm hover:shadow-xl rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
        <div className="relative w-full h-48 overflow-hidden bg-slate-100 dark:bg-slate-800">
            <Image 
                src={imageUrl} 
                alt={title} 
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            {/* Year Badge */}
            {yearStart && (
                <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md">
                    {yearStart === yearEnd ? yearStart : `${yearStart} - ${yearEnd || "Selesai"}`}
                </div>
            )}
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <div className="flex flex-wrap gap-2 mb-3">
                {role && (
                    <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border border-blue-100/50 dark:border-blue-800/40 text-[10px] font-bold rounded-md uppercase tracking-wide">
                        {role}
                    </span>
                )}
                {fundingSource && (
                    <span className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-md uppercase tracking-wide">
                        {fundingSource}
                    </span>
                )}
            </div>
            
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {title}
            </h3>
            
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">
                {stripHtml(description)}
            </p>
            
            <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50 mt-auto">
                <Link href={`/project/${slug}`} className="font-bold text-xs text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                    Detail Proyek <span>&rarr;</span>
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
    if (!imageIdentifier) {
        return "/placeholder.jpg";
    }
    if (imageIdentifier.startsWith('http')) {
        return imageIdentifier;
    }
    return `https://drive.google.com/uc?export=view&id=${imageIdentifier}`;
};

const RecentProject = ({ isHomepage = false }) => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const PER_PAGE = isHomepage ? 3 : 9;

    useEffect(() => {
        if (!isHomepage) {
            const param = parseInt(searchParams.get('page') || '', 10);
            if (param && param > 0) {
                setCurrentPage(param);
            }
        }
    }, [searchParams, isHomepage]);

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

                let query = supabase
                    .from('research_projects')
                    .select('id, title, abstract, cover_image, slug, role, funding_source, year_start, year_end', { count: 'exact' })
                    .order('created_at', { ascending: false });

                if (isHomepage) {
                    query = query.limit(3);
                } else {
                    query = query.range(from, to);
                }

                const { data, error, count } = await query;

                if (error) throw error;
                setProjects(data || []);
                if (!isHomepage && count) {
                    setTotalPages(Math.ceil(count / PER_PAGE));
                }
            } catch (err) {
                console.error("Error fetching research projects:", err.message);
                setError("Gagal memuat proyek riset terbaru.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [currentPage, isHomepage]);

    if (loading && projects.length === 0) return <p className="text-center py-16 text-slate-500">Memuat proyek riset...</p>;
    if (error) return <p className="text-center py-16 text-red-500">{error}</p>;
    if (!loading && projects.length === 0) return <p className="text-center py-16 text-slate-500">Belum ada proyek riset terbaru.</p>;

    // 1. Homepage Minimalist View
    if (isHomepage) {
        return (
            <section className="py-24 bg-white dark:bg-slate-950">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider text-xs uppercase mb-3 block">
                                Karya & Inovasi
                            </span>
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                Proyek Riset Unggulan
                            </h2>
                        </div>
                        <Link 
                            href="/project" 
                            className="text-sm font-semibold text-blue-600 dark:text-blue-450 hover:underline flex items-center gap-1 group"
                        >
                            Lihat Semua Proyek
                            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project.id}
                                title={project.title}
                                description={project.abstract}
                                slug={project.slug}
                                imageUrl={getGoogleDriveImageUrl(project.cover_image)}
                                role={project.role}
                                fundingSource={project.funding_source}
                                yearStart={project.year_start}
                                yearEnd={project.year_end}
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // 2. Full Listing View (For `/project` Page)
    return (
        <section className="bg-slate-50/30 dark:bg-slate-950/20 min-h-screen pb-16">
            {/* Banner Section - Full Width */}
            <div className="relative h-48 md:h-64 mb-12 overflow-hidden shadow-lg">
                <Image
                    src="/banner4.png"
                    alt="Proyek Riset Terbaru"
                    fill
                    priority
                    className="object-cover z-0"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-green-900 to-teal-600 opacity-70 z-10"></div>
                <div className="relative z-20 flex items-center justify-center h-full">
                    <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-4">Proyek Riset</h2>
                </div>
            </div>
            
            <div className="max-w-6xl mx-auto px-6 mt-8" id="project-grid">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <ProjectCard
                            key={project.id}
                            title={project.title}
                            description={project.abstract}
                            slug={project.slug}
                            imageUrl={getGoogleDriveImageUrl(project.cover_image)}
                            role={project.role}
                            fundingSource={project.funding_source}
                            yearStart={project.year_start}
                            yearEnd={project.year_end}
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