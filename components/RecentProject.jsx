"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "../config/supabaseClient";
import { Card, CardImage, CardContent, CardTitle, CardDescription, CardFooter, CardLink } from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { stripHtml, getGoogleDriveImageUrl, formatYearRange, truncateText } from "../utils/formatters";

const ProjectCard = ({ title, description, slug, imageUrl, role, fundingSource, yearStart, yearEnd }) => (
    <Card>
        <CardImage className="relative">
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
                    {formatYearRange(yearStart, yearEnd)}
                </div>
            )}
        </CardImage>
        <CardContent>
            <div className="flex flex-wrap gap-2 mb-3">
                {role && (
                    <Badge variant="default" size="sm">
                        {role}
                    </Badge>
                )}
                {fundingSource && (
                    <Badge variant="secondary" size="sm">
                        {fundingSource}
                    </Badge>
                )}
            </div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{stripHtml(description)}</CardDescription>
        </CardContent>
        <CardFooter>
            <CardLink href={`/project/${slug}`}>
                Detail Proyek <span>&rarr;</span>
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