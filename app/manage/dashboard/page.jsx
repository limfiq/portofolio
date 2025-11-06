"use client";

import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const StatCard = ({ title, value, icon, color, loading }) => (
    <div className={`bg-white p-6 rounded-lg shadow-md flex items-center justify-between border-l-4 ${color}`}>
        <div>
            <p className="text-sm font-medium text-gray-500 uppercase">{title}</p>
            {loading ? (
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mt-1"></div>
            ) : (
                <p className="text-3xl font-bold text-gray-800">{value}</p>
            )}
        </div>
        <div className="text-gray-400">{icon}</div>
    </div>
);

const PublicationIcon = () => <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v11.494m-9-5.747h18" /></svg>;
const ProjectIcon = () => <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
const ActivityIcon = () => <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const BlogIcon = () => <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" /></svg>;

const TimelineItem = ({ type, title, time, icon, color }) => (
    <li className="mb-6 ml-6">
        <span className={`absolute flex items-center justify-center w-8 h-8 rounded-full -left-4 ring-4 ring-white ${color}`}>
            {icon}
        </span>
        <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
            {type}
        </h3>
        <time className="block mb-2 text-sm font-normal leading-none text-gray-500">
            {time}
        </time>
        <p className="text-base font-normal text-gray-600">{title}</p>
    </li>
);

export default function DashboardPage() {
    const [stats, setStats] = useState({ publications: 0, projects: 0, activities: 0, blogs: 0 });
    const [recentActivities, setRecentActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // --- Fetch Counts for Stat Cards ---
                const [pubCount, projCount, actCount, blogCount] = await Promise.all([
                    supabase.from('publications').select('id', { count: 'exact', head: true }),
                    supabase.from('research_projects').select('id', { count: 'exact', head: true }),
                    supabase.from('community_services').select('id', { count: 'exact', head: true }),
                    supabase.from('blogs').select('id', { count: 'exact', head: true }),
                ]);

                // --- Fetch Recent Items for Timeline ---
                const [pubItems, projItems, actItems, blogItems] = await Promise.all([
                    supabase.from('publications').select('title, created_at').order('created_at', { ascending: false }).limit(5),
                    supabase.from('research_projects').select('title, created_at').order('created_at', { ascending: false }).limit(5),
                    supabase.from('community_services').select('title, created_at').order('created_at', { ascending: false }).limit(5),
                    supabase.from('blogs').select('title, created_at').order('created_at', { ascending: false }).limit(5),
                ]);

                // --- Process and Combine Data ---
                const publications = pubItems.data?.map(item => ({ ...item, type: 'Publikasi Baru' })) || [];
                const projects = projItems.data?.map(item => ({ ...item, type: 'Proyek Riset Baru' })) || [];
                const activities = actItems.data?.map(item => ({ ...item, type: 'Aktivitas Baru' })) || [];
                const blogs = blogItems.data?.map(item => ({ ...item, type: 'Blog Baru' })) || [];

                const combinedActivities = [...publications, ...projects, ...activities, ...blogs]
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                    .slice(0, 5); // Ambil 5 aktivitas paling baru dari semua jenis

                setRecentActivities(combinedActivities);

                setStats({
                    publications: pubCount.count ?? 0,
                    projects: projCount.count ?? 0,
                    activities: actCount.count ?? 0,
                    blogs: blogCount.count ?? 0,
                });

            } catch (error) {
                console.error("Gagal mengambil data statistik:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Ringkasan</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Publikasi"
                    value={stats.publications}
                    icon={<PublicationIcon />}
                    color="border-blue-500"
                    loading={loading}
                />
                <StatCard
                    title="Total Proyek Riset"
                    value={stats.projects}
                    icon={<ProjectIcon />}
                    color="border-green-500"
                    loading={loading}
                />
                <StatCard
                    title="Total Aktivitas"
                    value={stats.activities}
                    icon={<ActivityIcon />}
                    color="border-purple-500"
                    loading={loading}
                />
                <StatCard
                    title="Total Tulisan Blog"
                    value={stats.blogs}
                    icon={<BlogIcon />}
                    color="border-red-500"
                    loading={loading}
                />
            </div>

            <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700">Aktivitas Terbaru</h2>
                <ol className="relative border-l border-gray-200 mt-6">
                    {loading ? (
                        <p className="text-gray-500">Memuat aktivitas...</p>
                    ) : recentActivities.length > 0 ? (
                        recentActivities.map((activity, index) => {
                            const activityConfig = {
                                'Publikasi Baru': { icon: <PublicationIcon />, color: 'bg-blue-200 text-blue-800' },
                                'Proyek Riset Baru': { icon: <ProjectIcon />, color: 'bg-green-200 text-green-800' },
                                'Aktivitas Baru': { icon: <ActivityIcon />, color: 'bg-purple-200 text-purple-800' },
                                'Blog Baru': { icon: <BlogIcon />, color: 'bg-red-200 text-red-800' },
                            }[activity.type];

                            return (
                                <TimelineItem
                                    key={index}
                                    type={activity.type}
                                    title={activity.title}
                                    time={formatDistanceToNow(new Date(activity.created_at), { addSuffix: true, locale: id })}
                                    icon={activityConfig.icon}
                                    color={activityConfig.color}
                                />
                            );
                        })
                    ) : (
                        <p className="text-gray-500">Tidak ada aktivitas terbaru.</p>
                    )}
                </ol>
            </div>
        </div>
    );
}