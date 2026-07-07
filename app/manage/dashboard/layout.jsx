"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { createBrowserClient } from '@supabase/ssr'

// --- Modern SVG Icons ---
const Icon = ({ path, className = "w-6 h-6" }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={path} />
    </svg>
);

const paths = {
    dashboard: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
    publication: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253",
    project: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
    activity: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
    blog: "M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z",
    logout: "M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1",
    search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
    notification: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
};

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function DashboardLayout({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [isProfileOpen, setProfileOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        let mounted = true;
        const getSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
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

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === "SIGNED_OUT" || !session) router.push("/manage");
            else setUser(session.user);
        });

        // Close dropdown when clicking outside
        const handleClickOutside = () => setProfileOpen(false);
        if (typeof window !== "undefined") {
            window.addEventListener("click", handleClickOutside);
        }

        return () => {
            mounted = false;
            subscription.unsubscribe();
            if (typeof window !== "undefined") {
                window.removeEventListener("click", handleClickOutside);
            }
        };
    }, [router]);

    const handleLogout = async (e) => {
        e.stopPropagation(); // Prevent closing dropdown from triggering window click
        await supabase.auth.signOut();
        router.push("/manage");
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const navItems = [
        { name: "Dashboard", href: "/manage/dashboard", icon: paths.dashboard, category: "Home" },
        { name: "Publikasi", href: "/manage/dashboard/publications", icon: paths.publication, category: "Pages" },
        { name: "Proyek Riset", href: "/manage/dashboard/projects", icon: paths.project, category: "Pages" },
        { name: "Aktivitas", href: "/manage/dashboard/activities", icon: paths.activity, category: "Pages" },
        { name: "Pengajaran", href: "/manage/dashboard/teaching", icon: paths.publication, category: "Pages" },
        { name: "Tulisan", href: "/manage/dashboard/blogs", icon: paths.blog, category: "Pages" },
        { name: "Loker", href: "/manage/dashboard/loker", icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", category: "Pages" },
        { name: "Penghargaan", href: "/manage/dashboard/awards", icon: "M12 8c-1.657 0-3 1.343-3 3 0 .584.166 1.127.45 1.585l-1.373.916A4.992 4.992 0 017 11c0-2.761 2.239-5 5-5s5 2.239 5 5c0 .991-.288 1.914-.784 2.69l-1.373-.916c.284-.458.45-1.001.45-1.585 0-1.657-1.343-3-3-3zm0 6c1.105 0 2 .895 2 2v2a2 2 0 11-4 0v-2c0-1.105.895-2 2-2z", category: "Pages" },
    ];

    const groupedNav = navItems.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div className="min-h-screen flex bg-[#f5f6fa] font-sans">
            {/* --- Sidebar --- */}
            <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col z-30`}>
                <div className="p-6 flex items-center justify-between">
                    <div className={`flex items-center gap-3 ${!isSidebarOpen && 'hidden'}`}>
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold italic">P</div>
                        <div>
                            <span className="text-lg font-black text-gray-800 block leading-tight">Portofolio</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Dashboard UI</span>
                        </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); setSidebarOpen(!isSidebarOpen); }} className="p-1 hover:bg-gray-100 rounded-lg">
                        <Icon path="M4 6h16M4 12h16M4 18h16" className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 custom-scrollbar">
                    {Object.entries(groupedNav).map(([category, items]) => (
                        <div key={category} className="mb-6">
                            <p className={`text-[10px] uppercase font-bold text-gray-400 mb-2 px-4 tracking-wider ${!isSidebarOpen && 'hidden'}`}>
                                {category}
                            </p>
                            <div className="space-y-1">
                                {items.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                                                isActive 
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                                                : 'text-gray-500 hover:bg-blue-50 hover:text-blue-600'
                                            }`}
                                        >
                                            <Icon path={item.icon} className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-blue-600'}`} />
                                            {isSidebarOpen && <span className="ml-4 font-medium text-sm">{item.name}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>

            {/* --- Main Area --- */}
            <div className="flex-1 flex flex-col relative overflow-hidden">
                {/* --- Top Navbar --- */}
                <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
                    <div className="flex-1 max-w-md relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Icon path={paths.search} className="w-5 h-5 text-gray-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Search..."
                            className="block w-full pl-10 pr-4 py-2 border border-gray-100 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors">
                            <Icon path={paths.notification} className="w-6 h-6" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        
                        {/* Profile Dropdown */}
                        <div className="relative">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setProfileOpen(!isProfileOpen); }}
                                className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors cursor-pointer"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold text-gray-800 truncate max-w-[150px]">
                                        {user?.email?.split('@')[0]}
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-tight">Administrator</p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center font-bold text-blue-600 overflow-hidden">
                                    {user?.email?.[0].toUpperCase()}
                                </div>
                                <Icon path="M19 9l-7 7-7-7" className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                                    <div className="px-4 py-2 border-b border-gray-50 mb-1">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</p>
                                        <p className="text-sm font-medium text-gray-800 truncate">{user?.email}</p>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        <Icon path={paths.logout} className="w-4 h-4 mr-3" />
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* --- Content --- */}
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {children}
                </main>
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}</style>
        </div>
    );
}