"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";
import { CardSkeleton, DashboardSkeleton } from "./Skeleton";

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

const PostCard = ({ title, description, slug, imageUrl, location, year }) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 shadow-sm hover:shadow-xl rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 flex flex-col h-full group">
        <div className="relative h-48 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <Image 
                src={imageUrl} 
                alt={title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500" 
            />
        </div>
        <div className="p-6 flex flex-col flex-grow">
            <div className="flex justify-between items-center text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3">
                <span className="truncate pr-2">{location}</span>
                <span className="flex-shrink-0">{year}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 mb-2 line-clamp-2 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">{stripHtml(description)}</p>
            <div className="pt-4 border-t border-slate-50 dark:border-slate-800/50 mt-auto">
                <Link href={`/activity/${slug}`} className="font-bold text-xs text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                    Baca Selengkapnya <span>&rarr;</span>
                </Link>
            </div>
        </div>
    </div>
);

const getGoogleDriveImageUrl = (imageIdentifier) => {
    if (!imageIdentifier) {
        return "/placeholder.jpg";
    }
    if (imageIdentifier.startsWith('http')) {
        return imageIdentifier;
    }
    return `https://drive.google.com/uc?export=view&id=${imageIdentifier}`;
};

// SVG Line Chart Component for Location Distribution
const DistributionLineChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) {
        return (
            <div className="flex items-center justify-center h-32 w-full border border-slate-100 dark:border-slate-800/40 bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl">
                <span className="text-xs text-slate-400 italic">Tidak ada data</span>
            </div>
        );
    }

    const maxVal = Math.max(...data.map(d => d.value), 2);
    const width = 300;
    const height = 150;
    const paddingLeft = 30;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;

    const getX = (index) => {
        if (data.length <= 1) return paddingLeft + chartWidth / 2;
        return paddingLeft + (index / (data.length - 1)) * chartWidth;
    };
    const getY = (val) => height - paddingBottom - (val / maxVal) * chartHeight;

    const points = data.map((item, idx) => ({ 
        x: getX(idx), 
        y: getY(item.value), 
        val: item.value, 
        label: item.label, 
        color: item.color 
    }));
    
    const pathD = points.reduce((path, p, idx) => idx === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`, "");
    const areaPath = points.length > 0 && data.length > 1
        ? `${pathD} L ${getX(points.length - 1)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z` 
        : "";

    // Generate abbreviations or short names for locations (e.g. Surabaya -> SBY, Sidoarjo -> SDA, Gresik -> GSK)
    const getAbbreviation = (label) => {
        if (!label) return "-";
        if (label.toLowerCase() === "surabaya") return "SBY";
        if (label.toLowerCase() === "sidoarjo") return "SDA";
        if (label.toLowerCase() === "gresik") return "GSK";
        if (label.toLowerCase() === "lainnya") return "Lain";
        return label.substring(0, 3).toUpperCase();
    };

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                <defs>
                    <linearGradient id="gradDistAct" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                    </linearGradient>
                </defs>

                {/* Grid Lines */}
                {(() => {
                    const seen = new Set();
                    return [0, 0.5, 1].map((ratio) => {
                        const val = Math.round(ratio * maxVal);
                        if (seen.has(val)) return null;
                        seen.add(val);
                        const y = height - paddingBottom - ratio * chartHeight;
                        return (
                            <g key={ratio} className="opacity-40">
                                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800/60" />
                                <text x={paddingLeft - 6} y={y + 3} textAnchor="end" className="text-[9px] fill-slate-400 font-bold dark:fill-slate-500">{val}</text>
                            </g>
                        );
                    }).filter(Boolean);
                })()}

                {/* X Axis Labels */}
                {points.map((p, idx) => (
                    <text key={idx} x={p.x} y={height - paddingBottom + 16} textAnchor="middle" className="text-[9px] fill-slate-500 font-bold dark:fill-slate-400">
                        {getAbbreviation(p.label)}
                    </text>
                ))}

                {/* Area under path */}
                {areaPath && <path d={areaPath} fill="url(#gradDistAct)" />}

                {/* Path */}
                {pathD && data.length > 1 && <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

                {/* Data Points */}
                {points.map((p, idx) => (
                    <g key={idx}>
                        <circle cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke={p.color} strokeWidth="2.5" className="cursor-pointer" />
                        {p.val > 0 && (
                            <text x={p.x} y={p.y - 10} textAnchor="middle" className="text-[10px] font-bold fill-slate-700 dark:fill-slate-300">
                                {p.val}
                            </text>
                        )}
                    </g>
                ))}
            </svg>
        </div>
    );
};

// SVG Line Chart Component for Activity Trend
const LineChart = ({ data }) => {
    const maxVal = Math.max(...data.values, 2);
    
    const width = 500;
    const height = 220;
    const paddingLeft = 40;
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 40;
    
    const chartWidth = width - paddingLeft - paddingRight;
    const chartHeight = height - paddingTop - paddingBottom;
    
    const getX = (index) => paddingLeft + (index / (data.labels.length - 1)) * chartWidth;
    const getY = (val) => height - paddingBottom - (val / maxVal) * chartHeight;

    const points = data.values.map((val, idx) => ({ x: getX(idx), y: getY(val) }));
    const pathD = points.reduce((path, p, idx) => idx === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`, "");
    const areaPath = points.length > 0 
        ? `${pathD} L ${getX(points.length - 1)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z` 
        : "";

    return (
        <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <defs>
                    <linearGradient id="gradActivity" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                    </linearGradient>
                </defs>

                {/* Grid Lines */}
                {(() => {
                    const seen = new Set();
                    return [0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                        const val = Math.round(ratio * maxVal);
                        if (seen.has(val)) return null;
                        seen.add(val);
                        const y = height - paddingBottom - ratio * chartHeight;
                        return (
                            <g key={ratio} className="opacity-40">
                                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 4" />
                                <text x={paddingLeft - 8} y={y + 4} textAnchor="end" className="text-[10px] fill-slate-400 font-semibold">{val}</text>
                            </g>
                        );
                    }).filter(Boolean);
                })()}

                {/* X Axis Labels */}
                {data.labels.map((label, idx) => (
                    <text key={idx} x={getX(idx)} y={height - paddingBottom + 18} textAnchor="middle" className="text-[10px] fill-slate-400 font-semibold">
                        {label}
                    </text>
                ))}

                {/* Area under path */}
                {areaPath && <path d={areaPath} fill="url(#gradActivity)" />}

                {/* Path */}
                {pathD && <path d={pathD} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

                {/* Data Points */}
                {points.map((p, idx) => (
                    <circle key={idx} cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#3b82f6" strokeWidth="2.5" />
                ))}
            </svg>
        </div>
    );
};

const RecentActivity = ({ isHomepage = false }) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search and Filter States (only used in full page view)
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedYear, setSelectedYear] = useState("All");

    useEffect(() => {
        const fetchCommunityServices = async () => {
            try {
                setLoading(true);
                let query = supabase
                    .from('community_services')
                    .select('id, title, description, link, cover_image, location, year, slug')
                    .order('created_at', { ascending: false });

                if (isHomepage) {
                    query = query.limit(3);
                }

                const { data, error } = await query;

                if (error) throw error;
                setActivities(data || []);
            } catch (err) {
                console.error("Error fetching community services:", err.message);
                setError("Gagal memuat aktivitas terbaru.");
            } finally {
                setLoading(false);
            }
        };

        fetchCommunityServices();
    }, [isHomepage]);

    // Years for filtering (only for full view)
    const uniqueYears = ["All", ...new Set(activities.map(a => a.year?.toString()).filter(Boolean))].sort((a, b) => b - a);

    // Filter Logic (only for full view)
    const filteredActivities = activities.filter((item) => {
        const matchesSearch = 
            (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.location || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesYear = selectedYear === "All" || item.year?.toString() === selectedYear;

        return matchesSearch && matchesYear;
    });

    // KPI Metrics calculation for Activity
    const totalActivities = activities.length;
    const uniqueLocations = new Set(activities.map(a => a.location).filter(Boolean)).size;
    const activeYearsCount = new Set(activities.map(a => a.year).filter(Boolean)).size;
    const activitiesThisYear = activities.filter(a => a.year === new Date().getFullYear()).length;

    // Line Chart Data for Activity (Last 5 Years)
    const currentYear = new Date().getFullYear();
    const last5Years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
    const lineChartData = {
        labels: last5Years.map(String),
        values: last5Years.map(yr => activities.filter(a => a.year === yr).length)
    };

    // Donut Chart Data (Locations Distribution)
    const locationCounts = {};
    activities.forEach(a => {
        if (a.location) {
            locationCounts[a.location] = (locationCounts[a.location] || 0) + 1;
        }
    });
    const sortedLocations = Object.entries(locationCounts)
        .map(([loc, count]) => ({ label: loc, value: count }))
        .sort((a, b) => b.value - a.value);

    const topLocations = sortedLocations.slice(0, 3);
    const otherLocationsCount = sortedLocations.slice(3).reduce((sum, item) => sum + item.value, 0);
    const colors = ["#3b82f6", "#10b981", "#6366f1", "#f59e0b"];

    const donutChartData = topLocations.map((item, idx) => ({
        label: item.label,
        value: item.value,
        color: colors[idx % colors.length]
    }));

    if (otherLocationsCount > 0) {
        donutChartData.push({
            label: "Lainnya",
            value: otherLocationsCount,
            color: "#94a3b8"
        });
    }

    if (loading) {
        if (isHomepage) {
            return (
                <section className="bg-white py-16 rounded-2xl shadow-sm border border-slate-100/50">
                    <div className="max-w-6xl mx-auto px-6">
                        <div className="flex justify-between items-end mb-10">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900">Aktivitas Pengabdian</h2>
                                <p className="text-slate-500 mt-2">Daftar kegiatan pengabdian masyarakat terbaru</p>
                            </div>
                            <div className="h-4 w-20 rounded bg-slate-200 dark:bg-slate-800 animate-shimmer"></div>
                        </div>
                        <CardSkeleton count={3} hasImage={true} />
                    </div>
                </section>
            );
        }
        return (
            <section className="bg-slate-50/30 dark:bg-slate-950/20 min-h-screen pb-16 pt-24">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <DashboardSkeleton />
                </div>
            </section>
        );
    }
    if (error) return <p className="text-center py-16 text-red-500">{error}</p>;

    // 1. Homepage Card Grid Layout
    if (isHomepage) {
        if (activities.length === 0) return null;
        return (
            <section className="py-24 bg-white dark:bg-slate-950 border-t border-slate-100 dark:border-slate-850/50">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider text-xs uppercase mb-3 block">
                                Kontribusi Sosial
                            </span>
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white leading-tight">
                                Aktivitas Pengabdian Masyarakat
                            </h2>
                        </div>
                        <Link href="/activity" className="text-sm font-semibold text-blue-600 dark:text-blue-450 hover:underline flex items-center gap-1 group">
                            Lihat Semua Kegiatan
                            <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {activities.map((activity) => (
                            <PostCard
                                key={activity.id}
                                title={activity.title}
                                description={activity.description}
                                slug={activity.slug || activity.id}
                                location={activity.location}
                                year={activity.year}
                                imageUrl={getGoogleDriveImageUrl(activity.cover_image)}
                            />
                        ))}
                    </div>
                </div>
            </section>
        );
    }

    // 2. Full Page Table Layout (matching Journal IGS)
    return (
        <section className="bg-slate-50/30 min-h-screen pb-16">
            {/* Banner Section - Full Width */}
            <div className="relative h-48 md:h-64 mb-12 overflow-hidden shadow-lg">
                <Image
                    src="/banner2.png"
                    alt="Aktivitas Pengabdian"
                    fill
                    className="object-cover z-0 parallax-banner-image"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-cyan-600 opacity-70 z-10"></div>
                <div className="relative z-20 flex items-center justify-center h-full">
                    <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-4">Aktivitas Pengabdian</h2>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6">

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Card 1: Total Activities */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Kegiatan</span>
                            <span className="p-1.5 bg-slate-50 rounded-lg text-slate-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-slate-800">{totalActivities}</span>
                            <p className="text-xs text-slate-400 mt-1">Kegiatan pengabdian terdaftar</p>
                        </div>
                    </div>

                    {/* Card 2: Unique Locations */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Lokasi Pengabdian</span>
                            <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-slate-800">{uniqueLocations}</span>
                            <p className="text-xs text-slate-400 mt-1">Lokasi/mitra yang dijangkau</p>
                        </div>
                    </div>

                    {/* Card 3: Active Years */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tahun Aktif</span>
                            <span className="p-1.5 bg-blue-50 rounded-lg text-blue-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-slate-800">{activeYearsCount}</span>
                            <p className="text-xs text-slate-400 mt-1">Tahun keikutsertaan aktif</p>
                        </div>
                    </div>

                    {/* Card 4: Added this year */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Kegiatan Tahun Ini</span>
                            <span className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-slate-800">{activitiesThisYear}</span>
                            <p className="text-xs text-slate-400 mt-1">Pengabdian di tahun {new Date().getFullYear()}</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Charts Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Activity Trend Line Chart */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm lg:col-span-2 hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">Trend Kegiatan Pengabdian</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Grafik aktivitas 5 tahun terakhir</p>
                        </div>
                        <div className="mt-4">
                            <LineChart data={lineChartData} />
                        </div>
                        <div className="flex justify-center gap-6 mt-3 text-xs font-semibold select-none">
                            <div className="flex items-center gap-1.5 text-slate-600">
                                <span className="w-3 h-1.5 bg-[#3b82f6] rounded-full inline-block"></span> Jumlah Pengabdian
                            </div>
                        </div>
                    </div>

                    {/* Donut Chart / Top Locations */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm lg:col-span-1 hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">Peta Lokasi Mitra</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Sebaran lokasi kegiatan pengabdian</p>
                        </div>
                        <div className="flex justify-center items-center py-4 w-full">
                            <DistributionLineChart data={donutChartData} />
                        </div>
                        
                        {/* Location details list */}
                        <div className="space-y-2 text-xs">
                            {donutChartData.map((item) => (
                                <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-2 max-w-[80%]">
                                        <span className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: item.color }}></span>
                                        <span className="text-slate-600 font-medium truncate">{item.label}</span>
                                    </div>
                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Search & Filter Controls */}
                <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* Search Input */}
                    <div className="relative flex-1 max-w-md">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Cari aktivitas, lokasi, deskripsi..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* Filter Year */}
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tahun:</label>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        >
                            {uniqueYears.map(y => (
                                <option key={y} value={y}>{y === "All" ? "Semua Tahun" : y}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table List View */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    {filteredActivities.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            Tidak ada aktivitas yang cocok dengan kriteria pencarian.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                                        <th className="py-4 px-6 w-16 text-center">No</th>
                                        <th className="py-4 px-6">Kegiatan / Pengabdian</th>
                                        <th className="py-4 px-6 w-32 text-center">Tahun</th>
                                        <th className="py-4 px-6 w-56">Lokasi</th>
                                        <th className="py-4 px-6 w-28 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                    {filteredActivities.map((activity, index) => (
                                        <tr 
                                            key={activity.id} 
                                            className="hover:bg-slate-50/70 transition-colors group"
                                        >
                                            {/* Number */}
                                            <td className="py-4 px-6 text-center text-slate-400 font-medium">
                                                {index + 1}
                                            </td>

                                            {/* Activity Info */}
                                            <td className="py-4 px-6">
                                                <div className="flex flex-col gap-1 max-w-2xl">
                                                    <Link 
                                                        href={`/activity/${activity.slug || activity.id}`}
                                                        className="font-semibold text-slate-800 hover:text-blue-600 transition-colors leading-snug text-[15px]"
                                                    >
                                                        {activity.title}
                                                    </Link>
                                                    <p className="text-slate-500 text-xs line-clamp-2 mt-0.5">
                                                        {stripHtml(activity.description)}
                                                    </p>
                                                </div>
                                            </td>

                                            {/* Year */}
                                            <td className="py-4 px-6 text-center text-slate-600 font-medium">
                                                {activity.year}
                                            </td>

                                            {/* Location */}
                                            <td className="py-4 px-6 text-slate-600">
                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100/60 border border-slate-200/55 px-2.5 py-1 rounded-md">
                                                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    {activity.location}
                                                </span>
                                            </td>

                                            {/* Action Button */}
                                            <td className="py-4 px-6 text-center">
                                                <Link 
                                                    href={`/activity/${activity.slug || activity.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-lg transition-all shadow-sm active:scale-95"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Detail
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </section>
    );
};

export default RecentActivity;