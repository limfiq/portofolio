"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient"; // Pastikan path ini benar

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

    if (loading) return <p className="text-center py-16">Memuat data mengajar...</p>;
    if (error) return <p className="text-center py-16 text-red-500">{error}</p>;
    if (Object.keys(groupedTeachings).length === 0) return <p className="text-center py-16">Belum ada data mengajar terbaru.</p>;

    return (
        <section className="bg-white py-16">
            {/* Banner Section - Full Width */}
            <div className="relative h-48 md:h-64 mb-12 overflow-hidden shadow-lg">
                <Image
                    src="/placeholder-banner-teaching.jpg" // Ganti dengan gambar banner yang sesuai
                    alt="Aktivitas Mengajar"
                    layout="fill"
                    objectFit="cover"
                    className="z-0"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-slate-700 opacity-70 z-10"></div>
                {/* Title */}
                <div className="relative z-20 flex items-center justify-center h-full">
                    <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-4">Aktivitas Mengajar Terbaru</h2>
                </div>
            </div>
            <div className="max-w-6xl mx-auto px-6 mt-8">
                <div className="space-y-12">
                    {Object.entries(groupedTeachings).map(([year, courses]) => (
                        <div key={year}>
                            <h3 className="text-2xl font-bold mb-4 border-b-2 border-blue-600 pb-2">
                                Tahun Ajaran {year}
                            </h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white border border-gray-200">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">SKS</th>
                                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Silabus</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {courses.map((course) => (
                                            <tr key={course.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                                                    {course.course_name}
                                                    <p className="text-sm text-gray-500 font-normal">{course.description}</p>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-600">{course.semester}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600">{course.credits}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {course.syllabus_file ? (
                                                        <Link href={course.syllabus_file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                                                            Unduh
                                                        </Link>
                                                    ) : (
                                                        <span className="text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RecentLecturer;