"use client";

import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// --- Circular Progress Component ---
const CircularProgress = ({ percent, color }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;

    return (
        <div className="relative flex items-center justify-center w-16 h-16">
            <svg className="w-16 h-16 transform -rotate-90">
                <circle
                    className="text-gray-100"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="32"
                    cy="32"
                />
                <circle
                    className={color}
                    strokeWidth="4"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="32"
                    cy="32"
                />
            </svg>
            <div className="absolute text-[10px] font-bold text-gray-700">{percent}%</div>
        </div>
    );
};

const StatCard = ({ title, value, percent, color, textColor, loading }) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-50 flex items-center justify-between transition-transform hover:scale-[1.02]">
        <div className="flex items-center gap-4">
            <CircularProgress percent={percent} color={textColor} />
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{title}</p>
                {loading ? (
                    <div className="h-8 w-16 bg-gray-100 rounded animate-pulse mt-1"></div>
                ) : (
                    <p className="text-2xl font-black text-gray-800">{value}</p>
                )}
            </div>
        </div>
        <div className={`p-2 rounded-xl bg-opacity-10 ${color}`}>
            <svg className={`w-6 h-6 ${textColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        </div>
    </div>
);

export default function DashboardPage() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({ publications: 0, projects: 0, activities: 0, blogs: 0 });
    const [pageViews, setPageViews] = useState([]);
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
    );

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch User
                const { data: { user } } = await supabase.auth.getUser();
                setUser(user);

                // Fetch Counts
                const [pubCount, projCount, actCount, blogCount] = await Promise.all([
                    supabase.from('publications').select('id', { count: 'exact', head: true }),
                    supabase.from('research_projects').select('id', { count: 'exact', head: true }),
                    supabase.from('community_services').select('id', { count: 'exact', head: true }),
                    supabase.from('blogs').select('id', { count: 'exact', head: true }),
                ]);

                // Fetch Page Views
                const { data: viewsData } = await supabase
                    .from('page_views')
                    .select('page_name, view_count')
                    .order('page_name', { ascending: true });

                // Map data to ensure fixed order for the chart
                const orderedViews = ['Home', 'Publikasi', 'Proyek', 'Blog', 'Aktivitas'].map(name => {
                    const found = viewsData?.find(v => v.page_name === name);
                    return { page_name: name, view_count: found ? found.view_count : 0 };
                });
                setPageViews(orderedViews);

                // Fetch Recent Items
                const [pubItems, projItems, actItems, blogItems] = await Promise.all([
                    supabase.from('publications').select('title, created_at').order('created_at', { ascending: false }).limit(3),
                    supabase.from('research_projects').select('title, created_at').order('created_at', { ascending: false }).limit(3),
                    supabase.from('community_services').select('title, created_at').order('created_at', { ascending: false }).limit(3),
                    supabase.from('blogs').select('title, created_at').order('created_at', { ascending: false }).limit(3),
                ]);

                const combined = [
                    ...(pubItems.data?.map(i => ({ ...i, type: 'Publikasi' })) || []),
                    ...(projItems.data?.map(i => ({ ...i, type: 'Proyek' })) || []),
                    ...(actItems.data?.map(i => ({ ...i, type: 'Aktivitas' })) || []),
                    ...(blogItems.data?.map(i => ({ ...i, type: 'Blog' })) || []),
                ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 4);

                setRecentActivities(combined);
                setStats({
                    publications: pubCount.count ?? 0,
                    projects: projCount.count ?? 0,
                    activities: actCount.count ?? 0,
                    blogs: blogCount.count ?? 0,
                });
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const totalViews = pageViews.reduce((acc, curr) => acc + (parseInt(curr.view_count) || 0), 0);
    const maxView = Math.max(...pageViews.map(v => v.view_count), 1);
    const displayName = user?.email?.split('@')[0] || 'Administrator';

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* --- Banner --- */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 p-10 text-white shadow-2xl shadow-blue-200">
                <div className="relative z-10">
                    <h1 className="text-4xl font-black mb-3">Hello, {displayName}!</h1>
                    <p className="text-blue-100 max-w-xl font-medium leading-relaxed italic">
                        "Sesungguhnya Allah sangat mencintai seseorang yang jika mengerjakan suatu pekerjaan, maka ia melakukannya dengan tekun (itqan)."
                    </p>
                    <p className="text-blue-200 text-xs mt-2 font-bold">— HR. Thabrani</p>
                </div>
                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-400 opacity-20 rounded-full mb-10 mr-20"></div>

                <button className="absolute top-10 right-10 bg-white bg-opacity-20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-opacity-30 transition-all border border-white border-opacity-30">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" /></svg>
                    Announcements
                </button>
            </div>

            {/* --- Stats Grid --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Publications"
                    value={stats.publications}
                    percent={75}
                    color="bg-blue-500"
                    textColor="text-blue-600"
                    loading={loading}
                />
                <StatCard
                    title="Projects"
                    value={stats.projects}
                    percent={62}
                    color="bg-emerald-500"
                    textColor="text-emerald-600"
                    loading={loading}
                />
                <StatCard
                    title="Activities"
                    value={stats.activities}
                    percent={45}
                    color="bg-amber-500"
                    textColor="text-amber-600"
                    loading={loading}
                />
                <StatCard
                    title="Blog Posts"
                    value={stats.blogs}
                    percent={88}
                    color="bg-rose-500"
                    textColor="text-rose-600"
                    loading={loading}
                />
            </div>

            {/* --- Main Content Split --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Dimension Comparison Line Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-50">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-black text-gray-800">
                                {loading ? '...' : (totalViews > 1000 ? (totalViews / 1000).toFixed(1) + 'K' : totalViews)}
                            </h2>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Kunjungan Halaman</p>
                        </div>
                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-emerald-600 uppercase">Live Comparison</span>
                        </div>
                    </div>
                    
                    {/* SVG Line Chart */}
                    <div className="h-64 w-full relative group">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200">
                            {/* Grid Lines */}
                            <line x1="0" y1="0" x2="500" y2="0" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                            <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                            <line x1="0" y1="200" x2="500" y2="200" stroke="#e2e8f0" strokeWidth="2" />

                            {/* Data Lines (Mockup for comparison) */}
                            {/* Teal Line (Current) */}
                            <path
                                d={`M 0,${200 - (pageViews[0]?.view_count / maxView * 150 || 0)} 
                                   L 125,${200 - (pageViews[1]?.view_count / maxView * 150 || 0)} 
                                   L 250,${200 - (pageViews[2]?.view_count / maxView * 150 || 0)} 
                                   L 375,${200 - (pageViews[3]?.view_count / maxView * 150 || 0)} 
                                   L 500,${200 - (pageViews[4]?.view_count / maxView * 150 || 0)}`}
                                fill="none"
                                stroke="#06b6d4"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="transition-all duration-1000"
                            />
                            
                            {/* Orange Line (Previous - Mockup) */}
                            <path
                                d={`M 0,180 L 125,160 L 250,140 L 375,170 L 500,150`}
                                fill="none"
                                stroke="#f59e0b"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="opacity-50"
                            />

                            {/* Data Points (Teal) */}
                            {[0, 1, 2, 3, 4].map((i) => (
                                <circle 
                                    key={i}
                                    cx={i * 125} 
                                    cy={200 - (pageViews[i]?.view_count / maxView * 150 || 0)} 
                                    r="4" 
                                    fill="white" 
                                    stroke="#06b6d4" 
                                    strokeWidth="2" 
                                />
                            ))}
                        </svg>

                        {/* X-Axis Labels */}
                        <div className="absolute inset-x-0 bottom-[-30px] flex justify-between text-[10px] font-bold text-gray-400">
                            {pageViews.map((v) => (
                                <span key={v.page_name} className="flex-1 text-center truncate">{v.page_name}</span>
                            ))}
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-12 flex items-center justify-center gap-8 border-t border-gray-50 pt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#06b6d4] rounded-full"></div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Periode Sekarang</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-[#f59e0b] rounded-full"></div>
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Periode Sebelumnya</span>
                        </div>
                    </div>
                </div>

                {/* Right: Recent Posts / Activities */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-50 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-gray-800">Post Terakhir</h2>
                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md uppercase">Recent</span>
                    </div>

                    <div className="flex-1 space-y-6">
                        {loading ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4 animate-pulse">
                                        <div className="w-10 h-10 bg-gray-100 rounded-xl"></div>
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-50 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentActivities.length > 0 ? (
                            recentActivities.map((act, i) => (
                                <div key={i} className="flex gap-4 group cursor-default">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 ${act.type === 'Publikasi' ? 'bg-blue-50 text-blue-600' :
                                            act.type === 'Proyek' ? 'bg-emerald-50 text-emerald-600' :
                                                act.type === 'Aktivitas' ? 'bg-amber-50 text-amber-600' :
                                                    'bg-rose-50 text-rose-600'
                                        }`}>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-tight mb-0.5">{act.type}</p>
                                        <h3 className="text-sm font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">{act.title}</h3>
                                        <p className="text-[10px] text-gray-400 mt-1 font-medium">
                                            {formatDistanceToNow(new Date(act.created_at), { addSuffix: true, locale: id })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-400 text-center py-10">Belum ada aktivitas.</p>
                        )}
                    </div>

                    <button className="mt-8 w-full py-3 bg-gray-50 text-gray-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-gray-100 transition-colors">
                        Lihat Semua Aktivitas
                    </button>
                </div>
            </div>
        </div>
    );
}

