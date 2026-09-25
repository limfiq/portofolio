"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

const ITEMS_PER_PAGE = 9;

export default function ScholarshipsPublicPage() {
    const supabase = useMemo(() => {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
        );
    }, []);

    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);

    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchScholarships = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("scholarships")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setScholarships(data);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchScholarships();
    }, [fetchScholarships]);

    useEffect(() => {
        setPage(0);
    }, [searchQuery, statusFilter]);

    const filteredScholarships = useMemo(() => {
        return scholarships.filter(item => {
            if (statusFilter !== "all" && item.status !== statusFilter) return false;
            
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const title = (item.title || "").toLowerCase();
                const provider = (item.provider || "").toLowerCase();
                return title.includes(q) || provider.includes(q);
            }
            
            return true;
        });
    }, [scholarships, statusFilter, searchQuery]);

    const paginatedItems = useMemo(() => {
        const start = page * ITEMS_PER_PAGE;
        return filteredScholarships.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredScholarships, page]);

    const totalPages = Math.ceil(filteredScholarships.length / ITEMS_PER_PAGE);

    return (
        <div className="bg-slate-50 min-h-screen pb-16">
            {/* Banner Section */}
            <div className="relative h-52 md:h-64 mb-8 overflow-hidden shadow-lg bg-emerald-900">
                <div className="absolute inset-0 bg-gradient-to-r from-teal-900 via-emerald-900 to-green-900 opacity-95 z-10"></div>
                <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-4 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold mb-3">
                        <span>🎓 Portal Beasiswa & Hibah</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold mb-3">Peluang Studi & Pendanaan</h1>
                    <p className="text-xs md:text-sm text-emerald-200 max-w-2xl">
                        Temukan informasi beasiswa, fellowship, dan program hibah terbaru baik di dalam maupun luar negeri.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 md:px-6">
                {/* Search & Filter */}
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 mb-6 space-y-4">
                    <div className="relative">
                        <svg className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari beasiswa atau penyelenggara..."
                            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                        />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-500 mr-2">Status:</span>
                        <button onClick={() => setStatusFilter("all")} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                            Semua
                        </button>
                        <button onClick={() => setStatusFilter("Open")} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === "Open" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-700 border border-emerald-200"}`}>
                            ✅ Buka
                        </button>
                        <button onClick={() => setStatusFilter("Closed")} className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${statusFilter === "Closed" ? "bg-red-600 text-white" : "bg-red-50 text-red-700 border border-red-200"}`}>
                            ❌ Tutup
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4 px-1">
                    <p className="text-xs text-slate-500">
                        Menampilkan <strong className="text-slate-800">{filteredScholarships.length}</strong> beasiswa
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-500">⏳ Memuat data beasiswa...</div>
                ) : filteredScholarships.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
                        <div className="text-4xl mb-3">🔍</div>
                        <h3 className="text-base font-bold text-slate-700">Tidak ada beasiswa yang cocok</h3>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {paginatedItems.map(item => {
                            const expired = item.deadline && new Date(item.deadline) < new Date();
                            const soon = item.deadline && (() => { const diff = (new Date(item.deadline) - new Date()) / (1000 * 60 * 60 * 24); return diff >= 0 && diff <= 14; })();
                            return (
                            <div key={item.id} className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all flex flex-col h-full relative group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase ${item.status === 'Open' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                        {item.status}
                                    </span>
                                    {item.deadline && (
                                        <span className={`text-[10px] font-medium ${ expired ? 'text-red-500' : soon ? 'text-amber-500 font-bold' : 'text-slate-500'}`}>
                                            ⏳ {new Date(item.deadline).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year:'numeric'})}
                                        </span>
                                    )}
                                </div>
                                
                                <h3 className="text-base font-bold text-slate-800 mb-1 leading-snug group-hover:text-emerald-600 transition-colors">
                                    {item.title}
                                </h3>

                                <p className="text-xs font-semibold text-emerald-700 mb-3">
                                    🏢 {item.provider}
                                </p>
                                
                                <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                                    {item.description || "Klik Lihat Detail untuk melihat informasi lengkap beasiswa ini."}
                                </p>
                                
                                <div className="pt-3 border-t border-slate-100 mt-auto flex gap-2">
                                    <Link 
                                        href={`/beasiswa/${item.id}`}
                                        className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all text-center shadow-sm shadow-emerald-100"
                                    >
                                        Lihat Detail →
                                    </Link>
                                    {item.url && (
                                        <a
                                            href={item.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            title="Buka link sumber"
                                            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-all flex items-center"
                                        >
                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
                                        </a>
                                    )}
                                </div>
                            </div>
                        )})}
                    </div>
                )}

                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-10 gap-3">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-50">&larr; Sebelumnya</button>
                        <span className="text-xs text-slate-600 font-semibold px-2">Hal {page + 1} dari {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-bold disabled:opacity-50">Selanjutnya &rarr;</button>
                    </div>
                )}
            </div>
        </div>
    );
}
