"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";

const ITEMS_PER_PAGE = 9;

// Helper function to clean HTML descriptions for frontend display
function cleanHtmlClient(rawHtml) {
    if (!rawHtml) return "";
    let clean = rawHtml;
    // Strip style, class, id, and data-* attributes
    clean = clean.replace(/\s+data-[a-zA-Z0-9\-]+=(["']).*?\1/gi, "");
    clean = clean.replace(/\s+data-[a-zA-Z0-9\-]+=[^\s>]+/gi, "");
    clean = clean.replace(/\s+(style|class|id)=(["']).*?\2/gi, "");
    // Unwrap span and font tags
    clean = clean.replace(/<\/?(span|font)[^>]*>/gi, "");
    // Remove Arbeitnow promo footers
    clean = clean.replace(/<p[^>]*>.*?Find more.*?on Arbeitnow.*?<\/p>/gi, "");
    clean = clean.replace(/Find more.*?on Arbeitnow/gi, "");
    // Remove empty paragraphs / non-breaking space lines
    clean = clean.replace(/<p[^>]*>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, "");
    clean = clean.replace(/(<br\s*\/?>\s*){3,}/gi, "<br><br>");
    return clean.trim();
}

// Helper function to clean gender indicators from job titles
function cleanJobTitle(title) {
    if (!title) return "";
    
    let clean = title;
    
    // Normalize parenthesized levels: "(Senior)" -> "Senior", "(Junior)" -> "Junior", "(Lead)" -> "Lead"
    clean = clean.replace(/\((Senior|Junior|Lead|Mid|Entry|Principal|Intern|Staff)\)/gi, "$1");
    
    // Pattern to match gender indicator suffixes like (m/w/d), (f/m/x), (all genders), (gn), (m/f/*)
    const patterns = [
        /\s*[\(\[-]\s*(m\/w\/d|f\/m\/d|m\/f\/d|w\/m\/d|m\/f\/x|w\/m\/x|m\/w\/x|f\/m\/x|m\/f\/o|gn|all genders|m\/w\/d\/x|m\/w\/x\/d|all|f\/m\/div)\s*[\)\]-]?/gi,
        /\s*[\(\[-]\s*[mwdfx](\/[mwdfx]){1,3}\s*[\)\]]/gi,
        /\s*-\s*all genders\b/gi,
        /\s*\|\s*all genders\b/gi,
        /\s*-\s*Remote\b/gi,
    ];
    
    patterns.forEach(pattern => {
        clean = clean.replace(pattern, "");
    });
    
    // Clean up trailing dashes, vertical bars, slashes, or whitespace
    clean = clean.replace(/\s*[-|/]\s*$/g, "");
    clean = clean.replace(/\s{2,}/g, " ");
    clean = clean.trim();
    
    return clean;
}

// Helper function to detect Location Scope (Dalam Negeri / Luar Negeri / Remote)
export function getLocationScope(job) {
    if (!job) return { scope: "Luar Negeri", isRemote: false, badge: "🌐 Luar Negeri", color: "bg-blue-50 text-blue-700 border-blue-200" };
    
    const loc = (job.location || "").toLowerCase();
    const src = (job.source || "").toLowerCase();
    const comp = (job.company || "").toLowerCase();
    const title = (job.title || "").toLowerCase();
    
    const isRemote = loc.includes("remote") || loc.includes("anywhere") || loc.includes("wfh") || title.includes("remote");
    
    // Indonesia location indicators
    const indoKeywords = [
        "indonesia", "jakarta", "bandung", "surabaya", "yogyakarta", "jogja", 
        "bali", "semarang", "medan", "makassar", "malang", "tangerang", 
        "bekasi", "depok", "bogor", "batam", "palembang", "pekanbaru", 
        "denpasar", "solo", "surakarta", "dalam negeri", "lokernas", "projects.co.id", "glints", "jobstreet.co.id"
    ];
    
    const isIndo = indoKeywords.some(kw => loc.includes(kw) || src.includes(kw) || comp.includes(kw));
    
    if (isIndo) {
        return {
            scope: "Dalam Negeri",
            isRemote,
            badge: "🇮🇩 Dalam Negeri",
            color: "bg-emerald-50 text-emerald-700 border-emerald-200"
        };
    }
    
    return {
        scope: "Luar Negeri",
        isRemote,
        badge: "🌐 Luar Negeri",
        color: "bg-blue-50 text-blue-700 border-blue-200"
    };
}

// Helper function to detect Job Category
export function getJobCategory(job) {
    if (!job) return { id: "general-it", name: "IT & Lainnya", icon: "🛠️", color: "bg-slate-50 text-slate-700 border-slate-200" };
    
    const title = (job.title || "").toLowerCase();
    const desc = (job.description || "").toLowerCase().slice(0, 500);
    const combined = `${title} ${desc}`;
    
    if (/ai|artificial intelligence|machine learning|genai|llm|deep learning|data scientist|data engineer|data analyst|nlp|computer vision|big data|business intelligence|bi analyst/.test(combined)) {
        return {
            id: "ai-data",
            name: "AI & Data",
            icon: "🤖",
            color: "bg-purple-50 text-purple-700 border-purple-200"
        };
    }
    
    if (/devops|cloud|aws|gcp|azure|kubernetes|docker|sre|site reliability|cyber|security|infrastructure|sysadmin|system administrator|network/.test(combined)) {
        return {
            id: "cloud-devops",
            name: "Cloud & DevOps",
            icon: "☁️",
            color: "bg-sky-50 text-sky-700 border-sky-200"
        };
    }
    
    if (/mobile|android|ios|flutter|react native|swift|kotlin/.test(combined)) {
        return {
            id: "mobile",
            name: "Mobile Dev",
            icon: "📱",
            color: "bg-pink-50 text-pink-700 border-pink-200"
        };
    }
    
    if (/ui|ux|user experience|user interface|product designer|graphic designer|figma|web designer/.test(combined)) {
        return {
            id: "ui-ux",
            name: "UI/UX & Design",
            icon: "🎨",
            color: "bg-amber-50 text-amber-700 border-amber-200"
        };
    }
    
    if (/product manager|project manager|scrum master|tech lead|engineering manager|agile coach/.test(combined)) {
        return {
            id: "management",
            name: "Product & Project",
            icon: "📊",
            color: "bg-indigo-50 text-indigo-700 border-indigo-200"
        };
    }
    
    if (/qa|quality assurance|tester|automation tester|sdet|test engineer/.test(combined)) {
        return {
            id: "qa",
            name: "QA & Testing",
            icon: "🔍",
            color: "bg-teal-50 text-teal-700 border-teal-200"
        };
    }
    
    if (/developer|engineer|programmer|frontend|backend|full stack|fullstack|software|web|react|next|node|java|python|golang|go|rust|c\+\+|c#|\.net|php|laravel|vue|angular|typescript|javascript/.test(combined)) {
        return {
            id: "software-web",
            name: "Software & Web",
            icon: "💻",
            color: "bg-blue-50 text-blue-700 border-blue-200"
        };
    }
    
    return {
        id: "general-it",
        name: "IT & Lainnya",
        icon: "🛠️",
        color: "bg-slate-50 text-slate-700 border-slate-200"
    };
}

const CATEGORIES = [
    { id: "all", name: "Semua Kategori", icon: "✨" },
    { id: "software-web", name: "Software & Web", icon: "💻" },
    { id: "ai-data", name: "AI & Data", icon: "🤖" },
    { id: "cloud-devops", name: "Cloud & DevOps", icon: "☁️" },
    { id: "mobile", name: "Mobile Dev", icon: "📱" },
    { id: "ui-ux", name: "UI/UX & Design", icon: "🎨" },
    { id: "management", name: "Product & Project", icon: "📊" },
    { id: "qa", name: "QA & Testing", icon: "🔍" },
    { id: "general-it", name: "IT & Lainnya", icon: "🛠️" },
];

export default function LokerPublicPage() {
    const supabase = useMemo(() => {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
        );
    }, []);

    const [allJobs, setAllJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [scopeFilter, setScopeFilter] = useState("all"); // 'all', 'dalam-negeri', 'luar-negeri', 'remote'
    const [categoryFilter, setCategoryFilter] = useState("all"); // 'all' or category id

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    // Translate state (untuk loker luar negeri)
    const [translating, setTranslating] = useState(false);
    const [translatedData, setTranslatedData] = useState(null); // { title, description } hasil translate
    const [translateError, setTranslateError] = useState(null);

    // Fetch all active jobs (up to 300) for instant filtering
    const fetchAllJobs = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("job_vacancies")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(300);

        if (!error && data) {
            setAllJobs(data);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchAllJobs();
    }, [fetchAllJobs]);

    // Reset pagination when filter changes
    useEffect(() => {
        setPage(0);
    }, [searchQuery, scopeFilter, categoryFilter]);

    // Filter & Search Logic
    const filteredJobs = useMemo(() => {
        return allJobs.filter(job => {
            const scopeInfo = getLocationScope(job);
            const catInfo = getJobCategory(job);
            
            // Scope filter
            if (scopeFilter === "dalam-negeri" && scopeInfo.scope !== "Dalam Negeri") return false;
            if (scopeFilter === "luar-negeri" && scopeInfo.scope !== "Luar Negeri") return false;
            if (scopeFilter === "remote" && !scopeInfo.isRemote) return false;
            
            // Category filter
            if (categoryFilter !== "all" && catInfo.id !== categoryFilter) return false;
            
            // Search Query filter
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const title = (job.title || "").toLowerCase();
                const company = (job.company || "").toLowerCase();
                const location = (job.location || "").toLowerCase();
                const source = (job.source || "").toLowerCase();
                return title.includes(q) || company.includes(q) || location.includes(q) || source.includes(q) || catInfo.name.toLowerCase().includes(q);
            }
            
            return true;
        });
    }, [allJobs, scopeFilter, categoryFilter, searchQuery]);

    // Counts for tabs
    const counts = useMemo(() => {
        let dalam = 0;
        let luar = 0;
        let remote = 0;
        allJobs.forEach(job => {
            const info = getLocationScope(job);
            if (info.scope === "Dalam Negeri") dalam++;
            if (info.scope === "Luar Negeri") luar++;
            if (info.isRemote) remote++;
        });
        return { total: allJobs.length, dalam, luar, remote };
    }, [allJobs]);

    // Paginated list
    const paginatedJobs = useMemo(() => {
        const start = page * ITEMS_PER_PAGE;
        return filteredJobs.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredJobs, page]);

    const totalPages = Math.ceil(filteredJobs.length / ITEMS_PER_PAGE);

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/loker`
            }
        });
    };

    const openApplyModal = (job) => {
        setSelectedJob(job);
        setTranslatedData(null);
        setTranslateError(null);
        setShowModal(true);
    };

    const handleTranslate = async () => {
        if (!selectedJob || translating) return;

        setTranslating(true);
        setTranslateError(null);

        try {
            const res = await fetch("/api/loker/translate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: selectedJob.title,
                    description: selectedJob.description || ""
                })
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Gagal menerjemahkan loker.");
            }

            setTranslatedData({
                title: data.title || selectedJob.title,
                description: data.description || selectedJob.description || ""
            });
        } catch (error) {
            console.error("Translate error:", error);
            setTranslateError(error.message || "Terjadi kesalahan saat menerjemahkan.");
        } finally {
            setTranslating(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-screen pb-16">
            {/* Banner Section */}
            <div className="relative h-52 md:h-64 mb-8 overflow-hidden shadow-lg bg-indigo-900">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-900 opacity-95 z-10"></div>
                <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold mb-3">
                        <span>💼 Portal Karir & Lowongan Kerja IT</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-3">Peluang Karir Dalam & Luar Negeri</h1>
                    <p className="text-xs md:text-sm text-indigo-200 max-w-2xl">
                        Temukan lowongan kerja IT terkurasi dari Indonesia maupun internasional, lengkap dengan terjemahan bahasa Indonesia untuk lowongan luar negeri.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6">
                {/* Search & Location Filter Control Bar */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 mb-6 space-y-4">
                    {/* Top Row: Search Input */}
                    <div className="relative">
                        <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari lowongan, posisi, perusahaan, atau teknologi (contoh: React, Backend, AI, Jakarta)..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        />
                        {searchQuery && (
                            <button 
                                onClick={() => setSearchQuery("")} 
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full w-5 h-5 flex items-center justify-center"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* Scope Filter Tabs: Dalam Negeri vs Luar Negeri vs Remote */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
                            📍 Wilayah:
                        </span>
                        <button 
                            onClick={() => setScopeFilter("all")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                scopeFilter === "all" 
                                    ? "bg-slate-900 text-white shadow-sm" 
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            Semua Wilayah
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-white/20 font-semibold">{counts.total}</span>
                        </button>
                        <button 
                            onClick={() => setScopeFilter("dalam-negeri")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                scopeFilter === "dalam-negeri" 
                                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200" 
                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
                            }`}
                        >
                            🇮🇩 Dalam Negeri
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 font-semibold">{counts.dalam}</span>
                        </button>
                        <button 
                            onClick={() => setScopeFilter("luar-negeri")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                scopeFilter === "luar-negeri" 
                                    ? "bg-blue-600 text-white shadow-sm shadow-blue-200" 
                                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60"
                            }`}
                        >
                            🌐 Luar Negeri
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 font-semibold">{counts.luar}</span>
                        </button>
                        <button 
                            onClick={() => setScopeFilter("remote")}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                scopeFilter === "remote" 
                                    ? "bg-purple-600 text-white shadow-sm shadow-purple-200" 
                                    : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60"
                            }`}
                        >
                            🏠 Remote / WFH
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 font-semibold">{counts.remote}</span>
                        </button>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
                            🏷️ Kategori:
                        </span>
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setCategoryFilter(cat.id)}
                                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                                    categoryFilter === cat.id
                                        ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60"
                                }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.name}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filter Summary */}
                <div className="flex justify-between items-center mb-4 px-1">
                    <p className="text-xs text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredJobs.length}</strong> lowongan kerja
                        {searchQuery && <span> untuk pencarian &ldquo;{searchQuery}&rdquo;</span>}
                    </p>
                    {(scopeFilter !== "all" || categoryFilter !== "all" || searchQuery) && (
                        <button 
                            onClick={() => { setScopeFilter("all"); setCategoryFilter("all"); setSearchQuery(""); }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline"
                        >
                            Reset Semua Filter
                        </button>
                    )}
                </div>

                {/* Jobs Grid */}
                {loading && allJobs.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="animate-spin text-2xl mb-2">⏳</div>
                        Memuat data lowongan kerja...
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <div className="text-4xl mb-3">🔍</div>
                        <h3 className="text-base font-bold text-slate-700 mb-1">Tidak ada lowongan yang cocok</h3>
                        <p className="text-xs text-slate-400 mb-4">Coba ganti kata kunci pencarian atau ubah filter wilayah / kategori.</p>
                        <button 
                            onClick={() => { setScopeFilter("all"); setCategoryFilter("all"); setSearchQuery(""); }}
                            className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl hover:bg-indigo-700 transition-colors"
                        >
                            Tampilkan Semua Loker
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedJobs.map(job => {
                            const scopeInfo = getLocationScope(job);
                            const catInfo = getJobCategory(job);

                            return (
                                <div key={job.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all flex flex-col h-full relative group">
                                    {/* Badges Container */}
                                    <div className="flex flex-wrap items-center gap-1.5 mb-3">
                                        {/* Scope Badge (Dalam / Luar Negeri) */}
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${scopeInfo.color}`}>
                                            {scopeInfo.badge}
                                        </span>

                                        {/* Remote / WFH Badge */}
                                        {scopeInfo.isRemote && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                                                🏠 Remote
                                            </span>
                                        )}

                                        {/* Category Badge */}
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${catInfo.color}`}>
                                            {catInfo.icon} {catInfo.name}
                                        </span>

                                        {/* Job Type Badge */}
                                        <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-md ml-auto">
                                            {job.type || "Full-time"}
                                        </span>
                                    </div>
                                    
                                    {/* Job Title */}
                                    <h3 className="text-base font-bold text-slate-800 mb-1 leading-snug group-hover:text-indigo-600 transition-colors">
                                        {cleanJobTitle(job.title)}
                                    </h3>

                                    {/* Company & Location */}
                                    <p className="text-xs text-slate-600 mb-2 flex items-center gap-1">
                                        <span className="font-semibold text-slate-700">{job.company}</span>
                                        <span>•</span>
                                        <span className="text-slate-500 truncate">{job.location}</span>
                                    </p>
                                    
                                    {/* Source */}
                                    <div className="text-[11px] text-slate-400 mb-4 mt-auto">
                                        Sumber: <span className="font-medium text-slate-600">{job.source}</span>
                                    </div>
                                    
                                    {/* Action Button */}
                                    <div className="pt-3 border-t border-slate-100 flex gap-2">
                                        <button 
                                            onClick={() => openApplyModal(job)}
                                            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all text-center shadow-sm shadow-indigo-100"
                                        >
                                            Lihat Detail & Lamar
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-10 gap-3">
                        <button 
                            onClick={() => setPage(p => Math.max(0, p - 1))} 
                            disabled={page === 0 || loading} 
                            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors shadow-sm"
                        >
                            &larr; Sebelumnya
                        </button>
                        <span className="text-xs text-slate-600 font-semibold px-2">
                            Hal {page + 1} dari {totalPages}
                        </span>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                            disabled={page >= totalPages - 1 || loading} 
                            className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-50 transition-colors shadow-sm"
                        >
                            Selanjutnya &rarr;
                        </button>
                    </div>
                )}
            </div>

            {/* Detail & Application Modal */}
            {showModal && selectedJob && (() => {
                const modalScope = getLocationScope(selectedJob);
                const modalCat = getJobCategory(selectedJob);

                return (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                            {/* Modal Header */}
                            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                                <div>
                                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${modalScope.color}`}>
                                            {modalScope.badge}
                                        </span>
                                        {modalScope.isRemote && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200">
                                                🏠 Remote
                                            </span>
                                        )}
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${modalCat.color}`}>
                                            {modalCat.icon} {modalCat.name}
                                        </span>
                                        <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-md">
                                            {selectedJob.type || "Full-time"}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">
                                        {translatedData ? cleanJobTitle(translatedData.title) : cleanJobTitle(selectedJob.title)}
                                        {translatedData && (
                                            <span className="ml-2 align-middle text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                🇮🇩 ID
                                            </span>
                                        )}
                                    </h3>
                                    <p className="text-sm text-slate-600 mt-1">
                                        <strong>{selectedJob.company}</strong> • {selectedJob.location}
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Sumber: <span className="text-slate-600">{selectedJob.source}</span>
                                    </p>
                                </div>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-200 transition-colors">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>

                            {/* Modal Body (Scrollable description) */}
                            <div className="p-6 overflow-y-auto flex-1">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Deskripsi Pekerjaan:
                                    </h4>
                                    {modalScope.scope === "Luar Negeri" && (
                                        <button
                                            onClick={handleTranslate}
                                            disabled={translating}
                                            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                                                translatedData
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                    : "bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100"
                                            } disabled:opacity-60 disabled:cursor-not-allowed`}
                                        >
                                            {translating ? (
                                                <>
                                                    <span className="inline-block animate-spin">⏳</span>
                                                    Menerjemahkan...
                                                </>
                                            ) : translatedData ? (
                                                <>
                                                    ✓ Sudah Diterjemahkan
                                                </>
                                            ) : (
                                                <>
                                                    🌐 Terjemahkan ke Bahasa Indonesia
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>

                                {translateError && (
                                    <div className="p-3 rounded-lg mb-3 text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                                        {translateError}
                                    </div>
                                )}

                                {translatedData ? (
                                    <>
                                        <div className="mb-2 flex items-center gap-2">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                🇮🇩 Terjemahan Bahasa Indonesia
                                            </span>
                                        </div>
                                        {translatedData.description ? (
                                            <div
                                                className="text-sm text-slate-700 leading-relaxed pr-2 break-words job-description-html"
                                                dangerouslySetInnerHTML={{ __html: cleanHtmlClient(translatedData.description) }}
                                            />
                                        ) : (
                                            <p className="text-slate-400 italic text-sm">Tidak ada deskripsi detail untuk lowongan ini. Anda dapat melihat informasi lengkap di website sumber.</p>
                                        )}
                                        <div className="mt-4 pt-4 border-t border-dashed border-slate-200">
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                                                🇬🇧 Teks Asli (Bahasa Asing)
                                            </span>
                                        </div>
                                        <details className="mt-2">
                                            <summary className="text-xs font-semibold text-slate-500 cursor-pointer hover:text-indigo-600 transition-colors">
                                                Lihat teks asli
                                            </summary>
                                            <div
                                                className="mt-2 text-sm text-slate-500 leading-relaxed pr-2 break-words job-description-html"
                                                dangerouslySetInnerHTML={{ __html: cleanHtmlClient(selectedJob.description) }}
                                            />
                                        </details>
                                    </>
                                ) : selectedJob.description ? (
                                    <div
                                        className="text-sm text-slate-700 leading-relaxed pr-2 break-words job-description-html"
                                        dangerouslySetInnerHTML={{ __html: cleanHtmlClient(selectedJob.description) }}
                                    />
                                ) : (
                                    <p className="text-slate-400 italic text-sm">Tidak ada deskripsi detail untuk lowongan ini. Anda dapat melihat informasi lengkap di website sumber.</p>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="p-6 border-t border-slate-100 bg-slate-50">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <a 
                                        href={selectedJob.link} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors text-center flex items-center justify-center gap-2"
                                    >
                                        Buka Website Sumber Asli &rarr;
                                    </a>
                                    <button 
                                        type="button" 
                                        onClick={() => setShowModal(false)}
                                        className="py-2.5 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
