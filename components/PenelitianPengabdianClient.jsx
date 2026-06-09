"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/config/supabaseClient";

// Helper to strip HTML tags for clean descriptions
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
        '&copy;': '©',
        '&reg;': '®'
    };
    return cleanTag.replace(/&[a-z0-9#]+;/gi, (match) => entities[match] || match);
};

// Helper for Google Drive images
const getGDriveDirectLink = (urlOrId) => {
    if (!urlOrId) return "/banner1.png";
    if (typeof urlOrId !== 'string') return "/banner1.png";
    
    if (urlOrId.includes("lh3.googleusercontent.com") || urlOrId.startsWith("/")) {
        return urlOrId;
    }

    const idMatch = urlOrId.match(/(?:id=|\/d\/|folders\/|file\/d\/)([a-zA-Z0-9-_]{25,})/);
    const id = idMatch ? idMatch[1] : urlOrId;

    if (id.length >= 25 && !id.includes("/") && !id.includes(".")) {
        return `https://lh3.googleusercontent.com/d/${id}`;
    }

    return urlOrId;
};

export default function PenelitianPengabdianClient() {
    const [researchList, setResearchList] = useState([]);
    const [communityList, setCommunityList] = useState([]);
    const [publicationsCount, setPublicationsCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Tab state: "penelitian" or "pengabdian"
    const [activeTab, setActiveTab] = useState("penelitian");

    // Search & Filter states
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedRole, setSelectedRole] = useState("");
    const [selectedFunding, setSelectedFunding] = useState("");
    const [selectedLocation, setSelectedLocation] = useState("");
    const [sortBy, setSortBy] = useState("year-desc");

    // Collapsed abstracts state (mapping ID to boolean)
    const [expandedCards, setExpandedCards] = useState({});

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Fetch Research Projects
                const { data: researchData, error: researchError } = await supabase
                    .from("research_projects")
                    .select("*")
                    .order("year_start", { ascending: false });

                if (researchError) throw researchError;

                // Fetch Community Services
                const { data: communityData, error: communityError } = await supabase
                    .from("community_services")
                    .select("*")
                    .order("year", { ascending: false });

                if (communityError) throw communityError;

                // Fetch Publications Count
                const { count: pubCount, error: pubError } = await supabase
                    .from("publications")
                    .select("id", { count: "exact", head: true });

                if (pubError) throw pubError;

                setResearchList(researchData || []);
                setCommunityList(communityData || []);
                setPublicationsCount(pubCount || 0);

            } catch (err) {
                console.error("Error fetching data:", err.message);
                setError("Gagal memuat data penelitian dan pengabdian.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Toggle description expand/collapse
    const toggleExpand = (id) => {
        setExpandedCards((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    // Extract dynamic filters options
    const filterOptions = useMemo(() => {
        const yearsResearch = researchList.map(r => r.year_start).filter(Boolean);
        const yearsCommunity = communityList.map(c => c.year).filter(Boolean);
        const allYears = Array.from(new Set([...yearsResearch, ...yearsCommunity])).sort((a, b) => b - a);

        const fundingSources = Array.from(new Set(researchList.map(r => r.funding_source).filter(Boolean)));
        const roles = Array.from(new Set(researchList.map(r => r.role).filter(Boolean)));
        const locations = Array.from(new Set(communityList.map(c => c.location).filter(Boolean)));

        return {
            years: allYears,
            fundingSources,
            roles,
            locations
        };
    }, [researchList, communityList]);

    // Trend Chart Data processing
    const chartData = useMemo(() => {
        const years = filterOptions.years.length > 0 
            ? [...filterOptions.years].reverse() 
            : [new Date().getFullYear() - 2, new Date().getFullYear() - 1, new Date().getFullYear()];

        return years.map(yr => {
            const researchCount = researchList.filter(r => r.year_start === yr).length;
            const communityCount = communityList.filter(c => c.year === yr).length;
            return {
                year: yr,
                research: researchCount,
                community: communityCount
            };
        });
    }, [researchList, communityList, filterOptions]);

    // Filter and sort items
    const filteredItems = useMemo(() => {
        if (activeTab === "penelitian") {
            let list = [...researchList];

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                list = list.filter(item => 
                    item.title?.toLowerCase().includes(query) || 
                    item.abstract?.toLowerCase().includes(query) ||
                    item.funding_source?.toLowerCase().includes(query)
                );
            }

            if (selectedYear) {
                list = list.filter(item => item.year_start === parseInt(selectedYear, 10));
            }

            if (selectedRole) {
                list = list.filter(item => item.role === selectedRole);
            }

            if (selectedFunding) {
                list = list.filter(item => item.funding_source === selectedFunding);
            }

            list.sort((a, b) => {
                if (sortBy === "year-desc") return (b.year_start || 0) - (a.year_start || 0);
                if (sortBy === "year-asc") return (a.year_start || 0) - (b.year_start || 0);
                if (sortBy === "title-asc") return (a.title || "").localeCompare(b.title || "");
                if (sortBy === "title-desc") return (b.title || "").localeCompare(a.title || "");
                return 0;
            });

            return list;
        } else {
            let list = [...communityList];

            if (searchQuery.trim()) {
                const query = searchQuery.toLowerCase();
                list = list.filter(item => 
                    item.title?.toLowerCase().includes(query) || 
                    item.description?.toLowerCase().includes(query) ||
                    item.location?.toLowerCase().includes(query)
                );
            }

            if (selectedYear) {
                list = list.filter(item => item.year === parseInt(selectedYear, 10));
            }

            if (selectedLocation) {
                list = list.filter(item => item.location === selectedLocation);
            }

            list.sort((a, b) => {
                if (sortBy === "year-desc") return (b.year || 0) - (a.year || 0);
                if (sortBy === "year-asc") return (a.year || 0) - (b.year || 0);
                if (sortBy === "title-asc") return (a.title || "").localeCompare(b.title || "");
                if (sortBy === "title-desc") return (b.title || "").localeCompare(a.title || "");
                return 0;
            });

            return list;
        }
    }, [activeTab, researchList, communityList, searchQuery, selectedYear, selectedRole, selectedFunding, selectedLocation, sortBy]);

    const maxVal = useMemo(() => {
        const vals = chartData.flatMap(d => [d.research, d.community]);
        return Math.max(...vals, 4);
    }, [chartData]);

    if (loading) {
        return (
            <div className="w-full py-24 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium text-sm">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full py-16 flex items-center justify-center">
                <div className="bg-white p-6 rounded-2xl shadow-md max-w-sm w-full text-center border border-red-500/10">
                    <p className="text-red-600 font-medium mb-4">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-md"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-center justify-between hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Penelitian</p>
                        <h3 className="text-3xl font-black text-slate-800">{researchList.length}</h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">Proyek Riset Aktif & Selesai</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-center justify-between hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Pengabdian</p>
                        <h3 className="text-3xl font-black text-slate-800">{communityList.length}</h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">Aktivitas di Masyarakat</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-center justify-between hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Publikasi Terkait</p>
                        <h3 className="text-3xl font-black text-slate-800">{publicationsCount}</h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">Jurnal, Prosiding & Buku</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-center justify-between hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Mitra / Pendanaan</p>
                        <h3 className="text-3xl font-black text-slate-800">{filterOptions.fundingSources.length}</h3>
                        <p className="text-[11px] text-slate-500 font-medium mt-1">Instansi & Skema Hibah</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Trend Chart Section */}
            {chartData.length > 0 && (
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-md border border-slate-100 mb-12">
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                                Tren Kegiatan Penelitian & Pengabdian
                            </h2>
                            <p className="text-xs text-slate-500 font-medium mt-1">Perbandingan jumlah proyek per tahun akademik</p>
                        </div>
                        
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 bg-blue-600 rounded-md"></span>
                                <span className="text-xs font-bold text-slate-600">Penelitian</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-3.5 h-3.5 bg-teal-500 rounded-md"></span>
                                <span className="text-xs font-bold text-slate-600">Pengabdian</span>
                            </div>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto">
                        <div className="min-w-[500px] h-64 relative">
                            <svg className="w-full h-full overflow-visible" viewBox={`0 0 500 200`}>
                                <line x1="0" y1="0" x2="500" y2="0" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                                <line x1="0" y1="50" x2="500" y2="50" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                                <line x1="0" y1="100" x2="500" y2="100" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                                <line x1="0" y1="150" x2="500" y2="150" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4" />
                                <line x1="0" y1="200" x2="500" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />

                                {chartData.map((d, i) => {
                                    const groupWidth = 500 / chartData.length;
                                    const xOffset = i * groupWidth + (groupWidth - 50) / 2;
                                    
                                    const resHeight = (d.research / maxVal) * 160;
                                    const commHeight = (d.community / maxVal) * 160;

                                    return (
                                        <g key={d.year}>
                                            <rect
                                                x={xOffset}
                                                y={200 - resHeight}
                                                width="22"
                                                height={resHeight}
                                                rx="4"
                                                fill="#2563eb"
                                                className="transition-all duration-500 hover:fill-blue-700 cursor-pointer"
                                            >
                                                <title>{`Penelitian ${d.year}: ${d.research} Proyek`}</title>
                                            </rect>
                                            {d.research > 0 && (
                                                <text 
                                                    x={xOffset + 11} 
                                                    y={192 - resHeight} 
                                                    textAnchor="middle" 
                                                    fill="#1e3a8a" 
                                                    className="text-[9px] font-bold"
                                                >
                                                    {d.research}
                                                </text>
                                            )}

                                            <rect
                                                x={xOffset + 26}
                                                y={200 - commHeight}
                                                width="22"
                                                height={commHeight}
                                                rx="4"
                                                fill="#14b8a6"
                                                className="transition-all duration-500 hover:fill-teal-600 cursor-pointer"
                                            >
                                                <title>{`Pengabdian ${d.year}: ${d.community} Proyek`}</title>
                                            </rect>
                                            {d.community > 0 && (
                                                <text 
                                                    x={xOffset + 37} 
                                                    y={192 - commHeight} 
                                                    textAnchor="middle" 
                                                    fill="#042f2e" 
                                                    className="text-[9px] font-bold"
                                                >
                                                    {d.community}
                                                </text>
                                            )}
                                        </g>
                                    );
                                })}
                            </svg>
                            
                            <div className="absolute inset-x-0 bottom-[-25px] flex justify-between text-[11px] font-bold text-slate-400">
                                {chartData.map((d) => (
                                    <span key={d.year} className="flex-1 text-center font-mono">
                                        {d.year}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Segmented Tab Control */}
            <div className="flex justify-center mb-8">
                <div className="bg-slate-200/60 p-1.5 rounded-2xl flex gap-1 shadow-inner max-w-md w-full">
                    <button
                        onClick={() => {
                            setActiveTab("penelitian");
                            setSearchQuery("");
                            setSelectedYear("");
                            setSelectedRole("");
                            setSelectedFunding("");
                            setSelectedLocation("");
                        }}
                        className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                            activeTab === "penelitian"
                                ? "bg-white text-blue-700 shadow-md transform scale-[1.02]"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/30"
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Penelitian
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("pengabdian");
                            setSearchQuery("");
                            setSelectedYear("");
                            setSelectedRole("");
                            setSelectedFunding("");
                            setSelectedLocation("");
                        }}
                        className={`flex-1 py-3 px-6 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${
                            activeTab === "pengabdian"
                                ? "bg-white text-teal-700 shadow-md transform scale-[1.02]"
                                : "text-slate-600 hover:text-slate-900 hover:bg-white/30"
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Pengabdian
                    </button>
                </div>
            </div>

            {/* Filter and Search Panel */}
            <div className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 mb-8 flex flex-col gap-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative md:col-span-2">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder={activeTab === "penelitian" ? "Cari judul, abstrak, atau instansi pendana..." : "Cari judul, lokasi, atau deskripsi kegiatan..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all"
                        />
                    </div>

                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="year-desc">Tahun Terbaru</option>
                            <option value="year-asc">Tahun Terlama</option>
                            <option value="title-asc">Judul A-Z</option>
                            <option value="title-desc">Judul Z-A</option>
                        </select>
                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
                    <div className="relative">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                        >
                            <option value="">Semua Tahun</option>
                            {filterOptions.years.map(yr => (
                                <option key={yr} value={yr}>{yr}</option>
                            ))}
                        </select>
                        <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </span>
                    </div>

                    {activeTab === "penelitian" && (
                        <>
                            <div className="relative">
                                <select
                                    value={selectedRole}
                                    onChange={(e) => setSelectedRole(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Semua Peran</option>
                                    {filterOptions.roles.map(role => (
                                        <option key={role} value={role}>{role}</option>
                                    ))}
                                </select>
                                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>

                            <div className="relative">
                                <select
                                    value={selectedFunding}
                                    onChange={(e) => setSelectedFunding(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Semua Sumber Dana</option>
                                    {filterOptions.fundingSources.map(f => (
                                        <option key={f} value={f}>{f}</option>
                                    ))}
                                </select>
                                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>
                        </>
                    )}

                    {activeTab === "pengabdian" && (
                        <>
                            <div className="relative">
                                <select
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Semua Lokasi</option>
                                    {filterOptions.locations.map(loc => (
                                        <option key={loc} value={loc}>{loc}</option>
                                    ))}
                                </select>
                                <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Showcase Grid */}
            {filteredItems.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 border border-slate-100 shadow-md text-center max-w-2xl mx-auto">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">Data Tidak Ditemukan</h3>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6">
                        Tidak ada data {activeTab} yang sesuai dengan kriteria pencarian atau penyaringan Anda.
                    </p>
                    <button
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedYear("");
                            setSelectedRole("");
                            setSelectedFunding("");
                            setSelectedLocation("");
                        }}
                        className="px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-sm font-bold transition-all shadow-md"
                    >
                        Reset Semua Filter
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map((item) => {
                        const isExpanded = !!expandedCards[item.id];
                        
                        if (activeTab === "penelitian") {
                            const cleanAbstract = stripHtml(item.abstract || "");
                            return (
                                <div 
                                    key={item.id}
                                    className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1.5"
                                >
                                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden group">
                                        <Image 
                                            src={getGDriveDirectLink(item.cover_image)} 
                                            alt={item.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                                            <span className="px-3 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">
                                                {item.role || "Ketua"}
                                            </span>
                                        </div>
                                        <div className="absolute bottom-4 right-4">
                                            <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full font-mono shadow-sm">
                                                {item.year_start}{item.year_end && item.year_end !== item.year_start ? ` - ${item.year_end}` : ''}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        {item.funding_source && (
                                            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-md w-fit mb-3 uppercase tracking-wider">
                                                {item.funding_source}
                                            </span>
                                        )}

                                        <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-snug mb-3 hover:text-blue-600 transition-colors">
                                            <Link href={`/project/${item.slug || item.id}`}>
                                                {item.title}
                                            </Link>
                                        </h3>

                                        <div className="text-slate-600 text-xs leading-relaxed mb-4 flex-grow">
                                            <p className={isExpanded ? "" : "line-clamp-3"}>
                                                {cleanAbstract}
                                            </p>
                                            {cleanAbstract.length > 130 && (
                                                <button
                                                    onClick={() => toggleExpand(item.id)}
                                                    className="text-blue-600 font-bold hover:underline mt-2 inline-flex items-center gap-1 focus:outline-none"
                                                >
                                                    {isExpanded ? "Sembunyikan" : "Baca Selengkapnya"}
                                                    <svg className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-auto">
                                            <Link 
                                                href={`/project/${item.slug || item.id}`}
                                                className="text-xs font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 group/link"
                                            >
                                                Detail Proyek
                                                <svg className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>

                                            {item.link && (
                                                <a 
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg hover:text-slate-900 transition-all border border-slate-100"
                                                    title="Buka Tautan Luar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        } else {
                            const cleanDesc = stripHtml(item.description || "");
                            return (
                                <div 
                                    key={item.id}
                                    className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col h-full transform hover:-translate-y-1.5"
                                >
                                    <div className="relative h-48 w-full bg-slate-100 overflow-hidden group">
                                        <Image 
                                            src={getGDriveDirectLink(item.cover_image)} 
                                            alt={item.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute bottom-4 right-4">
                                            <span className="px-3 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-full font-mono shadow-sm">
                                                Tahun {item.year}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6 flex flex-col flex-grow">
                                        {item.location && (
                                            <div className="flex items-center gap-1 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-md w-fit px-2.5 py-1 mb-3 uppercase tracking-wider">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span className="truncate max-w-[200px]">{item.location}</span>
                                            </div>
                                        )}

                                        <h3 className="text-lg font-bold text-slate-800 line-clamp-2 leading-snug mb-3 hover:text-teal-600 transition-colors">
                                            <Link href={`/activity/${item.slug || item.id}`}>
                                                {item.title}
                                            </Link>
                                        </h3>

                                        <div className="text-slate-600 text-xs leading-relaxed mb-4 flex-grow">
                                            <p className={isExpanded ? "" : "line-clamp-3"}>
                                                {cleanDesc}
                                            </p>
                                            {cleanDesc.length > 130 && (
                                                <button
                                                    onClick={() => toggleExpand(item.id)}
                                                    className="text-teal-600 font-bold hover:underline mt-2 inline-flex items-center gap-1 focus:outline-none"
                                                >
                                                    {isExpanded ? "Sembunyikan" : "Baca Selengkapnya"}
                                                    <svg className={`w-3 h-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-auto">
                                            <Link 
                                                href={`/activity/${item.slug || item.id}`}
                                                className="text-xs font-bold text-teal-600 hover:text-teal-800 inline-flex items-center gap-1.5 group/link"
                                            >
                                                Detail Kegiatan
                                                <svg className="w-3.5 h-3.5 group-hover/link:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>

                                            {item.link && (
                                                <a 
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg hover:text-slate-900 transition-all border border-slate-100"
                                                    title="Buka Tautan Luar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
            )}
        </div>
    );
}
