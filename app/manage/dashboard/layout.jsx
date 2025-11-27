"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// --- Ikon SVG untuk Navigasi ---
const DashboardIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>;
const PublicationIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" /></svg>;
const ProjectIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const ActivityIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const ProfileIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const LogoutIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;
const BlogIcon = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" /></svg>;

const NavLink = ({ href, icon, children }) => (
    <Link href={href} className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200">
        {icon}
        <span className="ml-4 font-medium">{children}</span>
    </Link>
);

// buat single Supabase client di module scope (tidak dibuat ulang tiap render)
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardLayout({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        let mounted = true;

        const getSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.error("getSession error:", error);
                }
                if (!session) {
                    router.push("/manage");
                } else if (mounted) {
                    setUser(session.user);
                    setLoading(false);
                }
            } catch (e) {
                console.error(e);
            }
        };

        getSession();

        // subscribe auth changes and capture subscription to unsubscribe later
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
                if (event === "SIGNED_OUT" || !session) {
                    router.push("/manage");
                } else {
                    setUser(session.user);
                }
            }
        );

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [router]);

    const handleLogout = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.push("/manage");
        } catch (err) {
            console.error("Logout failed:", err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p>Memuat sesi...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-100">
            {/* --- Sidebar --- */}
            <aside className="w-64 bg-gray-800 text-white flex flex-col">
                <div className="px-6 py-4 border-b border-gray-700">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <p className="text-sm text-gray-400">Manajemen Konten</p>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    <Link href="/manage/dashboard" className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                        <DashboardIcon />
                        <span className="ml-4 font-medium">Ringkasan</span>
                    </Link>
                    <Link href="/manage/dashboard/publications" className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                        <PublicationIcon />
                        <span className="ml-4 font-medium">Publikasi</span>
                    </Link>
                    <Link href="/manage/dashboard/projects" className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                        <ProjectIcon />
                        <span className="ml-4 font-medium">Proyek Riset</span>
                    </Link>
                    <Link href="/manage/dashboard/activities" className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                        <ActivityIcon />
                        <span className="ml-4 font-medium">Aktivitas</span>
                    </Link>
                    <Link href="/manage/dashboard/blogs" className="flex items-center px-4 py-3 text-gray-200 hover:bg-gray-700 rounded-lg transition-colors duration-200">
                        <BlogIcon />
                        <span className="ml-4 font-medium">Tulisan</span>
                    </Link>
                </nav>

                {/* --- User Profile & Logout --- */}
                <div className="px-4 py-4 border-t border-gray-700">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                            {user?.email?.[0].toUpperCase()}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-white truncate max-w-[120px]">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200"
                    >
                        <LogoutIcon />
                        <span className="ml-2">Logout</span>
                    </button>
                </div>
            </aside>

            {/* --- Main Content --- */}
            <main className="flex-1 p-6 md:p-10">
                {children}
            </main>
        </div>
    );
}


// Placeholder pages untuk navigasi. Anda bisa membuat file-file ini nanti.
export const PublicationsPage = () => <div>Halaman Manajemen Publikasi</div>;
export const ProjectsPage = () => <div>Halaman Manajemen Proyek</div>;
export const ActivitiesPage = () => <div>Halaman Manajemen Aktivitas</div>;