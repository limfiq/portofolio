"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
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

const getCourseIcon = (courseName) => {
    const name = (courseName || "").toLowerCase();
    if (name.includes("web") || name.includes("pemrograman") || name.includes("code")) {
        return (
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        );
    }
    if (name.includes("rekayasa") || name.includes("sistem") || name.includes("software") || name.includes("desain")) {
        return (
            <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        );
    }
    if (name.includes("data") || name.includes("kecerdasan") || name.includes("ai") || name.includes("artificial") || name.includes("analisis")) {
        return (
            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364.364l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
        );
    }
    return (
        <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
    );
};

const FeaturedTeachingSection = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecentCourses = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('teaching')
                    .select('id, course_name, semester, credits, description, syllabus_file')
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (error) throw error;
                setCourses(data || []);
            } catch (err) {
                console.error("Error fetching homepage teaching courses:", err.message);
                setError("Gagal memuat data kelas terkini.");
            } finally {
                setLoading(false);
            }
        };

        fetchRecentCourses();
    }, []);

    if (loading) return null; // Let the Suspense fallback handle it or hide if loading silently
    if (error || courses.length === 0) return null; // Safe degradation

    return (
        <section className="py-24 bg-slate-50/50 dark:bg-slate-900/10 border-t border-slate-100 dark:border-slate-850/50">
            <div className="max-w-6xl mx-auto px-6">
                {/* Header */}
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider text-xs uppercase mb-3 block">
                            Aktivitas Akademik
                        </span>
                        <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                            Kelas & Pengajaran Terkini
                        </h2>
                    </div>
                    <Link 
                        href="/lecturer" 
                        className="text-sm font-semibold text-blue-600 dark:text-blue-450 hover:underline flex items-center gap-1 group"
                    >
                        Lihat Semua Kelas
                        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </Link>
                </div>

                {/* Course Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {courses.map((course) => (
                        <div 
                            key={course.id} 
                            className="bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-blue-500/20 dark:hover:border-blue-400/20 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between h-full group"
                        >
                            <div>
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-5">
                                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 group-hover:scale-110 transition-transform">
                                        {getCourseIcon(course.course_name)}
                                    </div>
                                    <span className="text-[10px] font-extrabold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md uppercase tracking-wide">
                                        {course.credits} SKS
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {course.course_name}
                                </h3>
                                
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-4">
                                    Semester {course.semester}
                                </span>

                                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed mb-6 line-clamp-3">
                                    {stripHtml(course.description)}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50">
                                <Link 
                                    href={`/teaching/${course.id}`}
                                    className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform"
                                >
                                    Silabus & Materi <span>&rarr;</span>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedTeachingSection;
