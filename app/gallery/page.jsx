"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { createBrowserClient } from "@supabase/ssr";
import PageTracker from "@/components/PageTracker";

const CATEGORIES = [
    { id: "all", label: "Semua Foto", icon: "✨" },
    { id: "Teaching", label: "Pengajaran", icon: "🎓" },
    { id: "Research", label: "Penelitian", icon: "🔬" },
    { id: "Community Service", label: "Pengabdian", icon: "🤝" },
    { id: "Award", label: "Penghargaan", icon: "🏆" },
    { id: "Event", label: "Kegiatan / Event", icon: "🎪" },
];

const categoryColors = {
    "Teaching": "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    "Research": "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    "Community Service": "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    "Award": "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    "Event": "bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
};

export default function GalleryPage() {
    const supabase = useMemo(() => {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
        );
    }, []);

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [lightboxItem, setLightboxItem] = useState(null);

    const fetchGallery = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("gallery")
            .select("*")
            .order("created_at", { ascending: false });

        if (!error && data) {
            setItems(data);
        }
        setLoading(false);
    }, [supabase]);

    useEffect(() => {
        fetchGallery();
    }, [fetchGallery]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            if (activeCategory !== "all" && item.category !== activeCategory) {
                return false;
            }
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                const title = (item.title || "").toLowerCase();
                const desc = (item.description || "").toLowerCase();
                return title.includes(q) || desc.includes(q);
            }
            return true;
        });
    }, [items, activeCategory, searchQuery]);

    const counts = useMemo(() => {
        const c = { all: items.length };
        CATEGORIES.forEach(cat => {
            if (cat.id !== "all") {
                c[cat.id] = items.filter(i => i.category === cat.id).length;
            }
        });
        return c;
    }, [items]);

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 transition-colors pb-24">
            <PageTracker name="Galeri" />

            {/* Hero Section */}
            <div className="relative h-64 md:h-80 overflow-hidden shadow-lg bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white mb-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent opacity-70"></div>
                <div className="relative z-10 max-w-7xl mx-auto px-6 h-full flex flex-col justify-center items-center text-center">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-500/30 text-blue-300 text-xs font-bold mb-4 shadow-sm">
                        <span>📸 Dokumentasi Visual & Kegiatan</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">
                        Galeri Aktivitas & Karya
                    </h1>
                    <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
                        Koleksi foto dan dokumentasi kegiatan pengajaran, riset penelitian, pengabdian masyarakat, serta momen seminar dan penghargaan.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {/* Filter Controls Bar */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 mb-8 space-y-4">
                    {/* Search Input */}
                    <div className="relative max-w-md">
                        <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Cari foto, judul, atau deskripsi kegiatan..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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

                    {/* Category Filter Tabs */}
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        {CATEGORIES.map(cat => {
                            const count = counts[cat.id] || 0;
                            const isActive = activeCategory === cat.id;

                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => setActiveCategory(cat.id)}
                                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                                        isActive
                                            ? "bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                                    }`}
                                >
                                    <span>{cat.icon}</span>
                                    <span>{cat.label}</span>
                                    <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-black/10 dark:bg-white/10 font-semibold">
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Gallery Grid */}
                {loading ? (
                    <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div className="animate-spin text-3xl mb-3">⏳</div>
                        <p className="text-xs text-slate-500">Memuat koleksi galeri foto...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
                        <div className="text-4xl mb-3">📸</div>
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">Belum ada foto yang cocok</h3>
                        <p className="text-xs text-slate-400 mb-4">Coba ganti kata kunci pencarian atau pilih kategori lain.</p>
                        <button
                            onClick={() => { setActiveCategory("all"); setSearchQuery(""); }}
                            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Tampilkan Semua Foto
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map(item => {
                            const badgeColor = categoryColors[item.category] || "bg-slate-100 text-slate-700 border-slate-200";

                            return (
                                <div
                                    key={item.id}
                                    onClick={() => setLightboxItem(item)}
                                    className="group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col cursor-pointer"
                                >
                                    {/* Image Container */}
                                    <div className="relative h-56 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                        {item.media_url ? (
                                            <Image
                                                src={item.media_url}
                                                alt={item.title || "Galeri Foto"}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                                                <span>📷 Tidak ada pratinjau</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                            <span className="text-xs text-white font-semibold flex items-center gap-1.5">
                                                <span>🔍 Klik untuk memperbesar</span>
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Info */}
                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="mb-2">
                                                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${badgeColor}`}>
                                                    {item.category || "Umum"}
                                                </span>
                                            </div>
                                            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1.5">
                                                {item.title}
                                            </h3>
                                            {item.description && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>

                                        {item.created_at && (
                                            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[10px] text-slate-400">
                                                {new Date(item.created_at).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric"
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Lightbox Modal */}
            {lightboxItem && (
                <div
                    className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
                    onClick={() => setLightboxItem(null)}
                >
                    <div
                        className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800 max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Image */}
                        <div className="relative h-72 sm:h-96 w-full bg-black/90">
                            {lightboxItem.media_url ? (
                                <Image
                                    src={lightboxItem.media_url}
                                    alt={lightboxItem.title || "Galeri Foto"}
                                    fill
                                    className="object-contain"
                                    sizes="(max-width: 1024px) 100vw, 800px"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-white text-sm">
                                    Tidak ada gambar
                                </div>
                            )}
                            <button
                                onClick={() => setLightboxItem(null)}
                                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Modal Details */}
                        <div className="p-6 overflow-y-auto">
                            <div className="mb-2">
                                <span className={`text-xs font-bold px-3 py-1 rounded-lg border ${categoryColors[lightboxItem.category] || "bg-slate-100 text-slate-700"}`}>
                                    {lightboxItem.category || "Umum"}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                                {lightboxItem.title}
                            </h3>
                            {lightboxItem.description && (
                                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                                    {lightboxItem.description}
                                </p>
                            )}
                            {lightboxItem.created_at && (
                                <p className="text-[11px] text-slate-400 mt-4">
                                    Diunggah pada: {new Date(lightboxItem.created_at).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric"
                                    })}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
