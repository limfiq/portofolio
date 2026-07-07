"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '../config/supabaseClient';

const EducationItem = ({ degree, major, institution, start_year, end_year }) => (
    <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800">{degree} {major}</h4>
        <p className="text-gray-600">{institution}</p>
        <p className="text-sm text-gray-500">{start_year} - {end_year || 'Sekarang'}</p>
    </div>
);

const AwardItem = ({ title, institution, year }) => (
    <div className="mb-6">
        <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
        <p className="text-gray-600">{institution}</p>
        <p className="text-sm text-gray-500">{year}</p>
    </div>
);

const SocialLink = ({ platform, url }) => (
    <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline capitalize"
    >
        {platform.replace('_', ' ')}
    </a>
);

/**
 * Mengubah ID file Google Drive menjadi URL gambar yang dapat ditampilkan.
 * Juga menangani kasus di mana input sudah menjadi URL lengkap atau path lokal.
 * @param {string} imageIdentifier - ID file Google Drive, URL gambar lengkap, atau path lokal.
 * @returns {string} URL gambar langsung atau URL placeholder jika ID tidak valid.
 */
const getGoogleDriveImageUrl = (imageIdentifier) => {
    if (!imageIdentifier) {
        return "/placeholder-profile.jpg";
    }
    // Jika sudah merupakan URL atau path lokal, kembalikan langsung.
    if (imageIdentifier.startsWith('http') || imageIdentifier.startsWith('/')) {
        return imageIdentifier;
    }
    // Jika bukan, anggap sebagai ID Google Drive dan buat URL-nya.
    return `https://drive.google.com/uc?export=view&id=${imageIdentifier}`;
};

const ProfessionalCV = () => {
    const [profile, setProfile] = useState(null);
    const [educations, setEducations] = useState([]);
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch the first user profile (assuming single-user portfolio)
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('id, name, photo, title, institution, biography, social_links')
                    .limit(1)
                    .maybeSingle();

                if (userError) throw userError;
                if (!userData) {
                    setLoading(false);
                    return;
                }

                setProfile(userData);

                // Fetch related data using the dynamic user ID
                const [educationsRes, awardsRes] = await Promise.all([
                    supabase.from('educations').select('*').eq('user_id', userData.id).order('end_year', { ascending: false }),
                    supabase.from('awards').select('*').eq('user_id', userData.id).order('year', { ascending: false })
                ]);

                if (educationsRes.error) throw educationsRes.error;
                if (awardsRes.error) throw awardsRes.error;

                setEducations(educationsRes.data || []);
                setAwards(awardsRes.data || []);

            } catch (err) {
                console.error("Error fetching CV data:", err.message);
                setError("Gagal memuat data CV. Silakan coba lagi nanti.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 md:py-12">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-0 shadow-2xl rounded-2xl overflow-hidden">
                        {/* Left Sidebar Skeleton */}
                        <div className="md:col-span-2 bg-slate-800 p-8 md:p-10 space-y-8">
                            <div className="flex justify-center md:justify-start">
                                <div className="w-40 h-40 md:w-44 md:h-44 rounded-full bg-slate-700 animate-pulse"></div>
                            </div>
                            <div className="space-y-3">
                                <div className="h-8 bg-slate-700 rounded animate-pulse"></div>
                                <div className="h-4 bg-slate-700 rounded w-2/3 animate-pulse"></div>
                            </div>
                        </div>

                        {/* Right Content Skeleton */}
                        <div className="md:col-span-3 bg-white dark:bg-slate-900 p-8 md:p-12 space-y-8">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="space-y-3">
                                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse"></div>
                                    <div className="space-y-2">
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                                        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                                        <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }
    if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
    if (!profile) return <p className="text-center py-20">Profil tidak ditemukan.</p>;

    return (
        <section className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-8 md:py-12 pb-32 md:pb-40">
            <div className="max-w-6xl mx-auto px-4 md:px-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-0 shadow-2xl rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                    {/* ===== LEFT SIDEBAR ===== */}
                    <div className="md:col-span-2 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white p-8 md:p-10 flex flex-col">
                        {/* Profile Photo - Circular Frame */}
                        <div className="mb-8 flex justify-center md:justify-start">
                            <div className="relative w-40 h-40 md:w-44 md:h-44">
                                {/* Decorative circle background */}
                                <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 opacity-20 blur-lg"></div>
                                {/* Main circle container */}
                                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-amber-400/30 shadow-2xl bg-slate-800">
                                    <Image
                                        src={getGoogleDriveImageUrl(profile.photo)}
                                        alt={profile.name}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Name & Title */}
                        <h1 className="text-3xl md:text-4xl font-black text-white mb-1 text-center md:text-left leading-tight">{profile.name}</h1>
                        <p className="text-amber-300 text-sm md:text-base font-semibold text-center md:text-left mb-6 italic">{profile.title}</p>

                        {/* DATA DIRI Section */}
                        <div className="mb-8">
                            <div className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-6 py-2 rounded-full font-bold text-sm mb-4">
                                DATA DIRI
                            </div>
                            <div className="space-y-4 text-sm text-slate-200">
                                {profile.institution && (
                                    <div>
                                        <p className="text-amber-300 font-semibold text-xs uppercase tracking-widest">Institusi</p>
                                        <p className="text-slate-100">{profile.institution}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-amber-300 font-semibold text-xs uppercase tracking-widest">Status</p>
                                    <p className="text-slate-100">Aktif</p>
                                </div>
                                <div>
                                    <p className="text-amber-300 font-semibold text-xs uppercase tracking-widest">Lokasi</p>
                                    <p className="text-slate-100">Indonesia</p>
                                </div>
                            </div>
                        </div>

                        {/* KONTAK Section */}
                        {profile.social_links && (
                            <div className="mb-8">
                                <div className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-6 py-2 rounded-full font-bold text-sm mb-4">
                                    KONTAK
                                </div>
                                <div className="space-y-3 text-sm">
                                    {profile.social_links.email && (
                                        <a
                                            href={`mailto:${profile.social_links.email}`}
                                            className="flex items-center gap-2 text-slate-200 hover:text-amber-300 transition"
                                        >
                                            <span className="text-lg">✉</span>
                                            <span className="truncate">{profile.social_links.email}</span>
                                        </a>
                                    )}
                                    {profile.social_links.phone && (
                                        <a
                                            href={`tel:${profile.social_links.phone}`}
                                            className="flex items-center gap-2 text-slate-200 hover:text-amber-300 transition"
                                        >
                                            <span className="text-lg">📞</span>
                                            <span>{profile.social_links.phone}</span>
                                        </a>
                                    )}
                                    {profile.social_links.location && (
                                        <p className="flex items-center gap-2 text-slate-200">
                                            <span className="text-lg">📍</span>
                                            <span>{profile.social_links.location}</span>
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* SOSIAL MEDIA Section */}
                        <div className="mt-auto">
                            <div className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-6 py-2 rounded-full font-bold text-sm mb-4">
                                SOSIAL MEDIA
                            </div>
                            <div className="space-y-2">
                                {profile.social_links && Object.entries(profile.social_links)
                                    .filter(([platform]) => !['email', 'phone', 'location'].includes(platform.toLowerCase()))
                                    .map(([platform, url]) => (
                                        <a
                                            key={platform}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block text-slate-300 hover:text-amber-300 text-sm font-medium transition capitalize"
                                        >
                                            @{platform.replace('_', ' ')}
                                        </a>
                                    ))}
                            </div>
                        </div>
                    </div>

                    {/* ===== RIGHT CONTENT ===== */}
                    <div className="md:col-span-3 p-8 md:p-12 space-y-8">
                        {/* TENTANG SAYA Section */}
                        {profile.biography && (
                            <div>
                                <div className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-6 py-2 rounded-full font-bold text-sm mb-4">
                                    TENTANG SAYA
                                </div>
                                <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-justify">
                                    {profile.biography}
                                </p>
                            </div>
                        )}

                        {/* PENDIDIKAN Section */}
                        {educations.length > 0 && (
                            <div>
                                <div className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-6 py-2 rounded-full font-bold text-sm mb-4">
                                    PENDIDIKAN
                                </div>
                                <div className="space-y-6">
                                    {educations.map(edu => (
                                        <div key={edu.id} className="flex justify-between items-start gap-4">
                                            <div className="flex-grow">
                                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                                                    {edu.degree} {edu.major}
                                                </h4>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm">{edu.institution}</p>
                                            </div>
                                            <div className="text-right whitespace-nowrap">
                                                <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                                                    {edu.start_year} - {edu.end_year || 'Sekarang'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* PENGALAMAN KERJA Section */}
                        {awards.length > 0 && (
                            <div>
                                <div className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-6 py-2 rounded-full font-bold text-sm mb-4">
                                    PENGALAMAN KERJA
                                </div>
                                <div className="space-y-6">
                                    {awards.map(award => (
                                        <div key={award.id}>
                                            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                                                {award.title}
                                            </h4>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2">{award.institution}</p>
                                            <ul className="space-y-1 ml-4 text-sm text-slate-700 dark:text-slate-300">
                                                <li className="flex items-start gap-2">
                                                    <span className="text-amber-500 font-bold mt-1">•</span>
                                                    <span>Pengalaman profesional di bidang ini</span>
                                                </li>
                                                <li className="flex items-start gap-2">
                                                    <span className="text-amber-500 font-bold mt-1">•</span>
                                                    <span>Menangani proyek dan tim dengan efektif</span>
                                                </li>
                                            </ul>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* KEMAMPUAN Section - Placeholder */}
                        <div>
                            <div className="inline-block bg-gradient-to-r from-amber-400 to-amber-500 text-slate-900 px-6 py-2 rounded-full font-bold text-sm mb-4">
                                KEMAMPUAN
                            </div>
                            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 font-bold">•</span>
                                    <span>Desain dan Arsitektur Profesional</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 font-bold">•</span>
                                    <span>Manajemen Proyek dan Tim</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-amber-500 font-bold">•</span>
                                    <span>Kemampuan Komunikasi dan Presentasi</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProfessionalCV;
