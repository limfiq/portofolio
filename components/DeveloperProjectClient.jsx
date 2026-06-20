"use client";
import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";

const getGoogleDriveImageUrl = (urlOrId) => {
    if (!urlOrId) return "/placeholder.jpg";
    if (urlOrId.startsWith('http')) return urlOrId;
    const match = urlOrId.match(/(?:id=|\/d\/|folders\/)([a-zA-Z0-9-_]{25,})/);
    const id = match ? match[1] : urlOrId;
    if (id.length >= 25 && !id.includes("/")) {
        return `https://drive.google.com/uc?export=view&id=${id}`;
    }
    return urlOrId;
};

export default function DeveloperProjectClient() {
    const supabase = useMemo(() => {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
    }, []);

    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProjects = async () => {
            const { data, error } = await supabase
                .from("projects")
                .select("*")
                .order("created_at", { ascending: false });
            if (!error && data) {
                setProjects(data);
            }
            setLoading(false);
        };
        fetchProjects();
    }, [supabase]);

    if (loading) return <div className="text-center py-12">Memuat proyek pengembangan...</div>;
    if (projects.length === 0) return null;

    return (
        <section className="py-16 bg-white dark:bg-slate-950">
            <div className="max-w-6xl mx-auto px-6">
                <div className="mb-12">
                    <span className="text-teal-600 dark:text-teal-400 font-bold tracking-wider text-xs uppercase mb-3 block">
                        Karya & Inovasi
                    </span>
                    <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                        Proyek Pengembangan (Developer/Praktisi)
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map((project) => (
                        <div key={project.id} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group">
                            <div className="relative w-full h-48 bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                <Image 
                                    src={getGoogleDriveImageUrl(project.image)} 
                                    alt={project.title} 
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                                />
                            </div>
                            <div className="p-6 flex flex-col flex-grow">
                                {project.tech_stack && (
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        {project.tech_stack.split(',').map(tech => (
                                            <span key={tech} className="px-2 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border border-teal-100 dark:border-teal-800/50 text-[10px] font-bold rounded-md tracking-wider">
                                                {tech.trim()}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
                                    {project.title}
                                </h3>
                                <div className="text-slate-500 dark:text-slate-400 text-sm mb-6 flex-grow line-clamp-3" dangerouslySetInnerHTML={{ __html: project.description }}></div>
                                {project.link && (
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
                                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="font-bold text-xs text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1">
                                            Kunjungi Tautan <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
