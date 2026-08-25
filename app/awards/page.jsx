"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createBrowserClient } from "@supabase/ssr";
import PageTracker from "@/components/PageTracker";

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

export default function AwardsPage() {
    const supabase = useMemo(() => {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
        );
    }, []);

    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedYear, setSelectedYear] = useState("all");
    const [selectedAward, setSelectedAward] = useState(null);

    const fetchAwards = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("awards")
            .select("*")
            .order("year", { ascending: false });

        if (!error && data) {
            setAwards(data);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchAwards();
    }, [fetchAwards]);

    const years = useMemo(() => {
        const uniqueYears = Array.from(new Set(awards.map(a => a.year).filter(Boolean))).sort((a, b) => b - a);
        return uniqueYears;
    }, [awards]);

    const filteredAwards = useMemo(() => {
        return awards.filter(award => {
            const matchesYear = selectedYear === "all" || String(award.year) === String(selectedYear);
            if (!matchesYear) return false;

            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const title = (award.title || "").toLowerCase();
                const inst = (award.institution || "").toLowerCase();
                const desc = (award.description || "").toLowerCase();
                return title.includes(q) || inst.includes(q) || desc.includes(q);
            }
            return true;
        });
    }, [awards, selectedYear, searchQuery]);

    const stats = useMemo(() => {
        const total = awards.length;
        const institutionsCount = new Set(awards.map(a => a.institution?.trim()).filter(Boolean)).size;
        const latestYear = awards.length > 0 ? Math.max(...awards.map(a => Number(a.year) || 0)) : "-";
        return { total, institutionsCount, latestYear: latestYear || "-" };
    }, [awards]);

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors pb-24">
            <PageTracker name="Penghargaan" />

            {/* Hero Section */}
            <div className="relative h-64 md:h-80 overflow-hidden shadow-lg bg-gradient-to-r from-amber-950 via-slate-900 to-indigo-950 text-white mb-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-500/20 via-transparent to-transparent opacity-70"></div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md border border-amber-500/30 text-amber-300 text-xs font-bold mb-4 shadow-sm">
                        <span>🏆 Rekam Jejak Prestasi & Kehormatan</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
                        Penghargaan & Apresiasi
                    </h1>
                    <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        Dokumentasi rekognisi ilmiah, akademik, dan profesional yang diraih dari berbagai institusi, konferensi, dan lembaga nasional maupun internasional.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 -mt-16 relative z-20">
                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center text-2xl font-bold">
                            🏆
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.total}</div>
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Penghargaan</div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-2xl font-bold">
                            🏛️
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.institutionsCount}</div>
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Institusi Pemberi</div>
                        </div>
                    </div>

                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold">
                            📅
                        </div>
                        <div>
                            <div className="text-2xl font-black text-slate-900 dark:text-white">{stats.latestYear}</div>
                            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Prestasi Terakhir</div>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 mb-8 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                        <div className="relative w-full md:w-96">
                            <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Cari penghargaan, institusi, atau kata kunci..."
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Year Pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
                            <span className="text-xs font-bold text-slate-400 mr-1 whitespace-nowrap">Tahun:</span>
                            <button
                                onClick={() => setSelectedYear("all")}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                    selectedYear === "all"
                                        ? "bg-amber-600 text-white shadow-sm shadow-amber-200 dark:shadow-none"
                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                }`}
                            >
                                Semua
                            </button>
                            {years.map(yr => (
                                <button
                                    key={yr}
                                    onClick={() => setSelectedYear(yr)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                        String(selectedYear) === String(yr)
                                            ? "bg-amber-600 text-white shadow-sm shadow-amber-200 dark:shadow-none"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                                >
                                    {yr}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Awards Cards Grid */}
                {loading ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div className="animate-spin text-3xl mb-3">⏳</div>
                        <p className="text-xs text-slate-500">Memuat daftar penghargaan...</p>
                    </div>
                ) : filteredAwards.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
                        <div className="text-4xl mb-3">🏆</div>
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">Tidak ada data penghargaan ditemukan</h3>
                        <p className="text-xs text-slate-400 mb-4">Coba sesuaikan kata kunci pencarian atau filter tahun.</p>
                        <button
                            onClick={() => { setSelectedYear("all"); setSearchQuery(""); }}
                            className="px-4 py-2 bg-amber-600 text-white text-xs font-bold rounded-xl hover:bg-amber-700 transition-colors"
                        >
                            Reset Filter
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAwards.map(award => (
                            <div
                                key={award.id}
                                className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-300 dark:hover:border-amber-600/50 transition-all flex flex-col justify-between group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40 text-xs font-black">
                                            {award.year || "Penghargaan"}
                                        </span>
                                        <span className="text-lg">🏅</span>
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug mb-2">
                                        {award.title}
                                    </h3>

                                    {award.institution && (
                                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 mb-3">
                                            <span className="opacity-70">🏛️</span>
                                            <span className="truncate">{award.institution}</span>
                                        </p>
                                    )}

                                    {award.description && (
                                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
                                            {stripHtml(award.description)}
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={() => setSelectedAward(award)}
                                    className="w-full py-2.5 px-4 bg-slate-50 dark:bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 group/btn"
                                >
                                    <span>Lihat Rincian</span>
                                    <span className="group-hover/btn:translate-x-0.5 transition-transform">&rarr;</span>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedAward && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col max-h-[85vh]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-amber-500/5 flex justify-between items-start">
                            <div>
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold mb-2">
                                    <span>Tahun {selectedAward.year}</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">
                                    {selectedAward.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                                    <span>🏛️</span>
                                    <strong>{selectedAward.institution || "Institusi"}</strong>
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedAward(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto flex-1 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Deskripsi & Catatan:</h4>
                            {selectedAward.description ? (
                                <div
                                    className="prose prose-sm dark:prose-invert max-w-none text-xs md:text-sm"
                                    dangerouslySetInnerHTML={{ __html: selectedAward.description }}
                                />
                            ) : (
                                <p className="text-xs text-slate-400 italic">Tidak ada keterangan detail tambahan.</p>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
                            <button
                                onClick={() => setSelectedAward(null)}
                                className="px-5 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
