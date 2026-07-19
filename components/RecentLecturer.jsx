"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient"; // Pastikan path ini benar
import { CardSkeleton } from "./Skeleton";

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

const RecentLecturer = () => {
    const [groupedTeachings, setGroupedTeachings] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchTeaching = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('teaching')
                    .select('id, course_name, semester, credits, description, syllabus_file')
                    .order('created_at', { ascending: false }); // Urutkan berdasarkan data terbaru

                if (error) {
                    throw error;
                }

                // Mengelompokkan data berdasarkan tahun ajaran dari semester
                const grouped = data.reduce((acc, course) => {
                    const yearMatch = course.semester ? course.semester.match(/\d{4}\/\d{4}/) : null;
                    const academicYear = yearMatch ? yearMatch[0] : 'Lainnya';

                    if (!acc[academicYear]) {
                        acc[academicYear] = [];
                    }
                    acc[academicYear].push(course);
                    return acc;
                }, {});

                // Mengurutkan tahun ajaran dari yang terbaru
                const sortedGrouped = Object.keys(grouped)
                    .sort((a, b) => {
                        if (a === 'Lainnya') return 1;
                        if (b === 'Lainnya') return -1;
                        return b.localeCompare(a);
                    })
                    .reduce((obj, key) => {
                        obj[key] = grouped[key];
                        return obj;
                    }, {});

                setGroupedTeachings(sortedGrouped);
            } catch (err) {
                console.error("Error fetching teaching data:", err.message);
                setError("Gagal memuat data mengajar.");
            } finally {
                setLoading(false);
            }
        };

        fetchTeaching();
    }, []);

    if (loading) {
        return (
            <section className="bg-slate-50/30 dark:bg-slate-950/20 min-h-screen pb-16">
                {/* Banner Section - Full Width */}
                <div className="relative h-48 md:h-64 mb-12 overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-slate-700 opacity-70 z-10"></div>
                    <div className="relative z-20 flex items-center justify-center h-full">
                        <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-4">Aktivitas Mengajar</h2>
                    </div>
                </div>
                <div className="max-w-6xl mx-auto px-6 mt-8">
                    <CardSkeleton count={3} hasImage={false} />
                </div>
            </section>
        );
    }
    if (error) return <p className="text-center py-16 text-red-500">{error}</p>;
    if (Object.keys(groupedTeachings).length === 0) return <p className="text-center py-16">Belum ada data mengajar terbaru.</p>;

    return (
        <section className="bg-slate-50/30 dark:bg-slate-950/20 min-h-screen pb-16">
            {/* Banner Section - Full Width */}
            <div className="relative h-48 md:h-64 mb-12 overflow-hidden shadow-lg">
                <Image
                    src="/banner3.png" // Ganti dengan gambar banner yang sesuai
                    alt="Aktivitas Mengajar"
                    layout="fill"
                    objectFit="cover"
                    className="z-0 parallax-banner-image"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-slate-700 opacity-70 z-10"></div>
                {/* Title */}
                <div className="relative z-20 flex items-center justify-center h-full">
                    <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-4">Aktivitas Mengajar</h2>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-6 mt-8">
                <div className="space-y-12">
                    {Object.entries(groupedTeachings).map(([year, courses]) => (
                        <div key={year}>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 border-b-2 border-blue-600 pb-2">
                                Tahun Ajaran {year}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {courses.map((course) => (
                                    <Link 
                                        key={course.id} 
                                        href={`/teaching/${course.id}`}
                                        className="group bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-6 flex flex-col h-full"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                {course.semester}
                                            </span>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                                {course.credits} SKS
                                            </span>
                                        </div>
                                        
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-3 line-clamp-2 leading-tight">
                                            {course.course_name}
                                        </h4>
                                        
                                        <p className="text-sm text-gray-500 dark:text-slate-400 line-clamp-3 mb-6 flex-grow">
                                            {stripHtml(course.description)}
                                        </p>
                                        
                                        <div className="pt-4 border-t border-gray-50 dark:border-slate-800/60 flex items-center justify-between mt-auto">
                                            <span className="text-sm font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                                Materi & Silabus <span>&rarr;</span>
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentLecturer;