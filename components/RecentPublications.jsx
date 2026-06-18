"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "../config/supabaseClient";
import { DashboardSkeleton } from "./Skeleton";

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

const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

// SVG Line Chart Component for Type Distribution
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

    // Generate abbreviations (e.g., Jurnal Internasional -> JI, Jurnal Nasional -> JN, Prosiding -> PR, Buku & Bab Buku -> BK)
    const getAbbreviation = (label) => {
        if (label.includes("Internasional")) return "JI";
        if (label.includes("Nasional")) return "JN";
        if (label.includes("Prosiding")) return "PR";
        if (label.includes("Buku")) return "BK";
        return label.split(" ").map(w => w[0]).join("").toUpperCase();
    };

    return (
        <div className="w-full">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
                <defs>
                    <linearGradient id="gradDistPub" x1="0" y1="0" x2="0" y2="1">
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
                {areaPath && <path d={areaPath} fill="url(#gradDistPub)" />}

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

// SVG Line Chart Component
const LineChart = ({ data }) => {
    const maxVal = Math.max(...data.datasets.journal, ...data.datasets.nonJournal, 2);
    
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

    // Build SVG paths
    const journalPoints = data.datasets.journal.map((val, idx) => ({ x: getX(idx), y: getY(val) }));
    const nonJournalPoints = data.datasets.nonJournal.map((val, idx) => ({ x: getX(idx), y: getY(val) }));

    const getPathD = (points) => {
        if (points.length === 0) return "";
        return points.reduce((path, p, idx) => idx === 0 ? `M ${p.x} ${p.y}` : `${path} L ${p.x} ${p.y}`, "");
    };

    const journalPath = getPathD(journalPoints);
    const nonJournalPath = getPathD(nonJournalPoints);

    // Area paths (for gradients)
    const journalAreaPath = journalPoints.length > 0 
        ? `${journalPath} L ${getX(journalPoints.length - 1)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z` 
        : "";
    const nonJournalAreaPath = nonJournalPoints.length > 0 
        ? `${nonJournalPath} L ${getX(nonJournalPoints.length - 1)} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z` 
        : "";

    return (
        <div className="w-full overflow-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
                <defs>
                    <linearGradient id="gradJournal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0"/>
                    </linearGradient>
                    <linearGradient id="gradNonJournal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0"/>
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

                {/* Area under paths */}
                {journalAreaPath && <path d={journalAreaPath} fill="url(#gradJournal)" />}
                {nonJournalAreaPath && <path d={nonJournalAreaPath} fill="url(#gradNonJournal)" />}

                {/* Paths */}
                {journalPath && <path d={journalPath} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}
                {nonJournalPath && <path d={nonJournalPath} fill="none" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

                {/* Data Points */}
                {journalPoints.map((p, idx) => (
                    <circle key={`j-${idx}`} cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" className="cursor-pointer" />
                ))}
                {nonJournalPoints.map((p, idx) => (
                    <circle key={`nj-${idx}`} cx={p.x} cy={p.y} r="4" fill="#ffffff" stroke="#f59e0b" strokeWidth="2.5" className="cursor-pointer" />
                ))}
            </svg>
        </div>
    );
};

const RecentPublications = () => {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search and Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedType, setSelectedType] = useState("All");
    const [selectedYear, setSelectedYear] = useState("All");

    // Sorting States
    const [sortField, setSortField] = useState("status_changed");
    const [sortDirection, setSortDirection] = useState("desc");

    useEffect(() => {
        const fetchPublications = async () => {
            try {
                setLoading(true);
                // Attempt to fetch with new columns (index, status, status_changed)
                const { data, error } = await supabase
                    .from('publications')
                    .select('id, title, abstract, year, type, cover_image, slug, authors, publisher, doi, link, created_at, index, status, status_changed')
                    .order('year', { ascending: false });

                if (error) {
                    // If columns do not exist yet (e.g. before migration), fallback to fetching standard columns
                    if (error.code === '42703' || error.message.includes('does not exist')) {
                        console.warn("Kolom baru belum ada di database Supabase. Menggunakan query fallback...");
                        const { data: fallbackData, error: fallbackError } = await supabase
                            .from('publications')
                            .select('id, title, abstract, year, type, cover_image, slug, authors, publisher, doi, link, created_at')
                            .order('year', { ascending: false });
                        
                        if (fallbackError) throw fallbackError;
                        
                        // Map standard fields to include defaults for new columns
                        const mappedData = (fallbackData || []).map(item => ({
                            ...item,
                            index: null,
                            status: 'Published',
                            status_changed: item.created_at
                        }));
                        setPublications(mappedData);
                        setError(null);
                        return;
                    }
                    throw error;
                }
                setPublications(data || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching publications:", err.message);
                setError("Gagal memuat publikasi terbaru.");
            } finally {
                setLoading(false);
            }
        };

        fetchPublications();
    }, []);

    // Get unique years and types for filters
    const uniqueYears = ["All", ...new Set(publications.map(p => p.year?.toString()).filter(Boolean))].sort((a, b) => b - a);
    const uniqueTypes = ["All", ...new Set(publications.map(p => p.type).filter(Boolean))];

    // Toggle Sorting Direction or Change Sort Field
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    // Filter Logic
    const filteredPublications = publications.filter((item) => {
        const matchesSearch = 
            (item.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.authors || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.publisher || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.index || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.abstract || "").toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesType = selectedType === "All" || item.type === selectedType;
        const matchesYear = selectedYear === "All" || item.year?.toString() === selectedYear;

        return matchesSearch && matchesType && matchesYear;
    });

    // Sort Logic
    const sortedPublications = [...filteredPublications].sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Fallbacks for sorting
        if (sortField === "status_changed") {
            valA = a.status_changed || a.created_at;
            valB = b.status_changed || b.created_at;
        }

        // Handle case sensitivity for strings
        if (typeof valA === "string") valA = valA.toLowerCase();
        if (typeof valB === "string") valB = valB.toLowerCase();

        // Handle empty values
        if (valA == null) return 1;
        if (valB == null) return -1;

        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
        return 0;
    });

    // KPI Metrics calculation
    const totalPublications = publications.length;
    const journalCount = publications.filter(p => p.type === "Journal").length;
    const conferenceCount = publications.filter(p => p.type === "Conference" || p.type === "Proceeding").length;
    const bookChapterCount = publications.filter(p => p.type === "Book Chapter").length;

    // Chart Data Generation (Last 5 Years)
    const currentYear = new Date().getFullYear();
    const last5Years = Array.from({ length: 5 }, (_, i) => currentYear - 4 + i);
    const lineChartData = {
        labels: last5Years.map(y => `${y}`),
        datasets: {
            journal: last5Years.map(yr => publications.filter(p => p.year === yr && p.type === "Journal").length),
            nonJournal: last5Years.map(yr => publications.filter(p => p.year === yr && p.type !== "Journal").length),
        }
    };

    // Donut Chart Distribution Data
    const donutChartData = [
        { label: "Journal", value: journalCount, color: "#10b981" }, // emerald-500
        { label: "Conference", value: publications.filter(p => p.type === "Conference").length, color: "#3b82f6" }, // blue-500
        { label: "Proceeding", value: publications.filter(p => p.type === "Proceeding").length, color: "#6366f1" }, // indigo-500
        { label: "Book Chapter", value: bookChapterCount, color: "#f59e0b" }, // amber-500
    ];

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "Published":
            case "Accepted":
                return "bg-emerald-50 text-emerald-700 border-emerald-200";
            case "Ready To Submit":
            case "Submitted":
                return "bg-blue-50 text-blue-600 border border-blue-200";
            case "Under Review":
            case "Revision Requested":
                return "bg-amber-50 text-amber-700 border-amber-200";
            case "Rejected":
                return "bg-rose-50 text-rose-700 border-rose-200";
            case "Draft":
            default:
                return "bg-slate-50 text-slate-500 border-slate-200";
        }
    };

    if (loading) {
        return (
            <section className="bg-slate-50/30 dark:bg-slate-950/20 min-h-screen pb-16">
                {/* Banner Section - Full Width */}
                <div className="relative h-48 md:h-64 mb-12 overflow-hidden shadow-lg">
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-600 opacity-70 z-10"></div>
                    <div className="relative z-20 flex items-center justify-center h-full">
                        <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-4">Publikasi</h2>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <DashboardSkeleton />
                </div>
            </section>
        );
    }
    if (error) return <p className="text-center py-16 text-red-500">{error}</p>;

    const SortIcon = ({ field }) => {
        if (sortField !== field) {
            return (
                <span className="inline-flex flex-col ml-1.5 text-slate-300">
                    <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 4l-8 8h16l-8-8z" />
                    </svg>
                    <svg className="w-2.5 h-2.5 -mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 20l8-8H4l8 8z" />
                    </svg>
                </span>
            );
        }
        return sortDirection === "asc" ? (
            <span className="inline-flex ml-1.5 text-blue-600">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 4l-8 8h16l-8-8z" />
                </svg>
            </span>
        ) : (
            <span className="inline-flex ml-1.5 text-blue-600">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 20l8-8H4l8 8z" />
                </svg>
            </span>
        );
    };

    return (
        <section className="bg-slate-50/30 min-h-screen pb-16">
            {/* Banner Section - Full Width */}
            <div className="relative h-48 md:h-64 mb-12 overflow-hidden shadow-lg">
                <Image
                    src="/banner1.png"
                    alt="Publikasi"
                    fill
                    className="object-cover z-0 parallax-banner-image"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-indigo-600 opacity-70 z-10"></div>
                <div className="relative z-20 flex items-center justify-center h-full">
                    <h2 className="text-4xl md:text-5xl font-bold text-white text-center px-4">Publikasi</h2>
                </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6">

                {/* KPI Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Card 1: Total Publications */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Publikasi</span>
                            <span className="p-1.5 bg-slate-50 rounded-lg text-slate-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-slate-800">{totalPublications}</span>
                            <p className="text-xs text-slate-400 mt-1">Seluruh karya ilmiah terdaftar</p>
                        </div>
                    </div>

                    {/* Card 2: Journal Papers */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Jurnal Ilmiah</span>
                            <span className="p-1.5 bg-emerald-50 rounded-lg text-emerald-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-slate-800">{journalCount}</span>
                            <p className="text-xs text-slate-400 mt-1">Artikel jurnal ilmiah</p>
                        </div>
                    </div>

                    {/* Card 3: Conferences & Proceedings */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Konferensi & Prosiding</span>
                            <span className="p-1.5 bg-blue-50 rounded-lg text-blue-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-slate-800">{conferenceCount}</span>
                            <p className="text-xs text-slate-400 mt-1">Conference & proceeding papers</p>
                        </div>
                    </div>

                    {/* Card 4: Book Chapters */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex flex-col justify-between h-32 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Buku & Bab Buku</span>
                            <span className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </span>
                        </div>
                        <div className="mt-2">
                            <span className="text-3xl font-bold text-slate-800">{bookChapterCount}</span>
                            <p className="text-xs text-slate-400 mt-1">Buku dan book chapter terbit</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Charts Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Publications Trend Line Chart */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm lg:col-span-2 hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">Trend Publikasi</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Grafik terbitan 5 tahun terakhir</p>
                        </div>
                        <div className="mt-4">
                            <LineChart data={lineChartData} />
                        </div>
                        <div className="flex justify-center gap-6 mt-3 text-xs font-semibold select-none">
                            <div className="flex items-center gap-1.5 text-slate-600">
                                <span className="w-3 h-1.5 bg-[#10b981] rounded-full inline-block"></span> Jurnal
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-600">
                                <span className="w-3 h-1.5 bg-[#f59e0b] rounded-full inline-block"></span> Non-Jurnal
                            </div>
                        </div>
                    </div>

                    {/* Donut Chart / Type Distribution */}
                    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm lg:col-span-1 hover:shadow-md transition-shadow flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-800">Distribusi Tipe</h3>
                            <p className="text-xs text-slate-400 mt-0.5">Komposisi tipe karya ilmiah</p>
                        </div>
                        <div className="flex justify-center items-center py-4 w-full">
                            <DistributionLineChart data={donutChartData} />
                        </div>
                        
                        {/* Type details list */}
                        <div className="space-y-2 text-xs">
                            {donutChartData.map((item) => (
                                <div key={item.label} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                                        <span className="text-slate-600 font-medium">{item.label}</span>
                                    </div>
                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                                        {item.value}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Search and Filters panel */}
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
                            placeholder="Cari judul, penulis, penerbit..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                        />
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Type Filter */}
                        <div className="flex items-center gap-2">
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipe:</label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                            >
                                {uniqueTypes.map(t => (
                                    <option key={t} value={t}>{t === "All" ? "Semua Tipe" : t}</option>
                                ))}
                            </select>
                        </div>

                        {/* Year Filter */}
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
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
                    {sortedPublications.length === 0 ? (
                        <div className="text-center py-12 text-slate-500">
                            Tidak ada publikasi yang cocok dengan pencarian atau filter.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider select-none">
                                        <th 
                                            className="py-4 px-6 cursor-pointer hover:bg-slate-100/50 hover:text-slate-800 transition-colors"
                                            onClick={() => handleSort("title")}
                                        >
                                            <div className="flex items-center">
                                                Title <SortIcon field="title" />
                                            </div>
                                        </th>
                                        <th 
                                            className="py-4 px-6 cursor-pointer hover:bg-slate-100/50 hover:text-slate-800 transition-colors"
                                            onClick={() => handleSort("link")}
                                        >
                                            <div className="flex items-center">
                                                Publication <SortIcon field="link" />
                                            </div>
                                        </th>
                                        <th className="py-4 px-6">Index</th>
                                        <th className="py-4 px-6">Contributors</th>
                                        <th className="py-4 px-6 text-center">Status</th>
                                        <th 
                                            className="py-4 px-6 text-center cursor-pointer hover:bg-slate-100/50 hover:text-slate-800 transition-colors w-48"
                                            onClick={() => handleSort("status_changed")}
                                        >
                                            <div className="flex items-center justify-center">
                                                Status changed <SortIcon field="status_changed" />
                                            </div>
                                        </th>
                                        <th className="py-4 px-6 text-center w-28">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                                    {sortedPublications.map((item) => (
                                        <tr 
                                            key={item.id} 
                                            className="hover:bg-slate-50/70 transition-colors group"
                                        >
                                            {/* Title */}
                                            <td className="py-4 px-6 font-medium text-slate-800 max-w-sm">
                                                <Link 
                                                    href={`/publications/${item.slug || item.id}`}
                                                    className="hover:text-blue-600 hover:underline transition-colors leading-snug text-[14px] font-semibold"
                                                >
                                                    {item.title}
                                                </Link>
                                            </td>

                                            {/* Publication */}
                                            <td className="py-4 px-6 text-xs text-slate-400 max-w-xs break-all">
                                                {item.link ? (
                                                    <a 
                                                        href={item.link} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="hover:text-blue-600 hover:underline"
                                                    >
                                                        {item.link}
                                                    </a>
                                                ) : (
                                                    <span className="italic text-slate-300">No link</span>
                                                )}
                                            </td>

                                            {/* Index */}
                                            <td className="py-4 px-6 text-xs text-slate-700 max-w-[200px]">
                                                {item.index ? (
                                                    <div className="font-semibold text-slate-800 uppercase tracking-wide">
                                                        {item.index}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <div className="font-semibold text-slate-800 uppercase tracking-wide">
                                                            {item.type}
                                                        </div>
                                                        {item.publisher && (
                                                            <div className="text-slate-400 mt-0.5">{item.publisher}</div>
                                                        )}
                                                    </>
                                                )}
                                            </td>

                                            {/* Contributors */}
                                            <td className="py-4 px-6 text-xs text-slate-500 max-w-[180px]">
                                                {item.authors || <span className="italic text-slate-300">Unknown</span>}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="py-4 px-6 text-center">
                                                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusBadgeClass(item.status)}`}>
                                                    {item.status || "Published"}
                                                </span>
                                            </td>

                                            {/* Status Changed (Date) */}
                                            <td className="py-4 px-6 text-center text-xs text-slate-500 font-medium">
                                                {formatDate(item.status_changed || item.created_at)}
                                            </td>

                                            {/* Action Button */}
                                            <td className="py-4 px-6 text-center">
                                                <Link 
                                                    href={`/publications/${item.slug || item.id}`}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all active:scale-95 shadow-sm"
                                                >
                                                    <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    Details
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

export default RecentPublications;