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

    if (loading) return <p className="text-center py-20">Memuat CV...</p>;
    if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
    if (!profile) return <p className="text-center py-20">Profil tidak ditemukan.</p>;

    return (
        <section className="bg-gray-50 py-12 md:py-20">
            <div className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Kolom Kiri: Foto dan Info Kontak */}
                    <div className="md:col-span-1 text-center md:text-left">
                        <div className="relative w-40 h-40 md:w-48 md:h-48 mx-auto md:mx-0 mb-6">
                            <Image
                                src={getGoogleDriveImageUrl(profile.photo)}
                                alt={profile.name}
                                layout="fill"
                                objectFit="cover"
                                className="rounded-full shadow-md"
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">{profile.name}</h2>
                        <p className="text-lg text-blue-700 font-medium">{profile.title}</p>
                        <p className="text-md text-gray-600 mb-6">{profile.institution}</p>

                        {profile.social_links && (
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold border-b pb-2 mb-3">Tautan</h3>
                                {Object.entries(profile.social_links).map(([platform, url]) => (
                                    <div key={platform}>
                                        <SocialLink platform={platform} url={url} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Kolom Kanan: Detail Data */}
                    <div className="md:col-span-2">
                        {/* Biografi */}
                        <div className="mb-8">
                            <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-600 pb-2 mb-4">Profil</h3>
                            <p className="text-gray-700 leading-relaxed">{profile.biography}</p>
                        </div>

                        {/* Pendidikan */}
                        {educations.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-600 pb-2 mb-4">Pendidikan</h3>
                                {educations.map(edu => <EducationItem key={edu.id} {...edu} />)}
                            </div>
                        )}

                        {/* Penghargaan */}
                        {awards.length > 0 && (
                            <div>
                                <h3 className="text-2xl font-bold text-gray-800 border-b-2 border-blue-600 pb-2 mb-4">Penghargaan</h3>
                                {awards.map(award => <AwardItem key={award.id} {...award} />)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ProfessionalCV;
