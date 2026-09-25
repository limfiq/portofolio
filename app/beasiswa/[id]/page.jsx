"use client";

import { useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function BeasiswaDetailPage() {
    const { id } = useParams();
    const supabase = useMemo(() => {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
        );
    }, []);

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        if (!id) return;
        const fetchDetail = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from("scholarships")
                .select("*")
                .eq("id", id)
                .single();
            if (error || !data) {
                setNotFound(true);
            } else {
                setItem(data);
            }
            setLoading(false);
        };
        fetchDetail();
    }, [id, supabase]);

    const formatDate = (dateStr) => {
        if (!dateStr) return null;
        return new Date(dateStr).toLocaleDateString("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const isDeadlineSoon = (dateStr) => {
        if (!dateStr) return false;
        const deadline = new Date(dateStr);
        const now = new Date();
        const diff = (deadline - now) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 14;
    };

    const isExpired = (dateStr) => {
        if (!dateStr) return false;
        return new Date(dateStr) < new Date();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500 text-sm">Memuat detail beasiswa...</p>
                </div>
            </div>
        );
    }

    if (notFound || !item) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="text-6xl mb-4">🔍</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Beasiswa Tidak Ditemukan</h2>
                    <p className="text-slate-500 mb-6">Data beasiswa yang Anda cari mungkin sudah dihapus atau tidak tersedia.</p>
                    <Link href="/beasiswa" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all">
                        ← Kembali ke Daftar Beasiswa
                    </Link>
                </div>
            </div>
        );
    }

    const deadline = item.deadline;
    const expired = isExpired(deadline);
    const soon = isDeadlineSoon(deadline);

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Banner */}
            <div className="relative bg-gradient-to-br from-teal-900 via-emerald-900 to-green-900 pt-28 pb-16 px-4 overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                <div className="relative max-w-4xl mx-auto">
                    <Link href="/beasiswa" className="inline-flex items-center gap-2 text-emerald-300 hover:text-white text-sm font-medium mb-6 transition-colors group">
                        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                        Kembali ke Daftar Beasiswa
                    </Link>

                    {/* Status Badge */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            item.status === "Open"
                                ? "bg-emerald-400/20 text-emerald-300 border border-emerald-400/30"
                                : "bg-red-400/20 text-red-300 border border-red-400/30"
                        }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === "Open" ? "bg-emerald-400" : "bg-red-400"}`}></span>
                            {item.status === "Open" ? "Pendaftaran Dibuka" : "Pendaftaran Ditutup"}
                        </span>
                        {soon && !expired && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 animate-pulse">
                                ⚡ Segera Berakhir
                            </span>
                        )}
                        {expired && deadline && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-300 border border-red-400/30">
                                ⏰ Deadline Terlewat
                            </span>
                        )}
                    </div>

                    <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight mb-4">
                        {item.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-4 text-sm text-emerald-200">
                        {item.provider && (
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                {item.provider}
                            </span>
                        )}
                        {deadline && (
                            <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                Deadline: <span className={`font-semibold ${expired ? "text-red-300" : soon ? "text-amber-300" : "text-white"}`}>{formatDate(deadline)}</span>
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description Card */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">📄</span>
                                Deskripsi Beasiswa
                            </h2>
                            {item.description ? (
                                <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed whitespace-pre-line">
                                    {item.description}
                                </div>
                            ) : (
                                <div className="bg-slate-50 rounded-xl p-5 text-center">
                                    <div className="text-3xl mb-2">📋</div>
                                    <p className="text-slate-500 text-sm">
                                        Klik tombol <strong>"Kunjungi Website Resmi"</strong> di bawah untuk melihat deskripsi lengkap, persyaratan, dan cara mendaftar beasiswa ini.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Info Note */}
                        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-3">
                            <span className="text-blue-500 text-xl mt-0.5">ℹ️</span>
                            <div>
                                <p className="text-sm font-semibold text-blue-800 mb-0.5">Informasi Penting</p>
                                <p className="text-xs text-blue-600 leading-relaxed">
                                    Informasi ini dikumpulkan secara otomatis. Pastikan Anda selalu mengecek website resmi penyelenggara untuk mendapatkan informasi terkini mengenai persyaratan, kuota, dan prosedur pendaftaran.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-5">
                        {/* CTA Card */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sticky top-24">
                            <h3 className="text-base font-bold text-slate-800 mb-4">Tertarik dengan beasiswa ini?</h3>
                            
                            {item.url ? (
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-100 hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5"
                                >
                                    Kunjungi Website Resmi
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            ) : (
                                <div className="w-full py-3 bg-slate-100 text-slate-400 text-sm font-bold rounded-xl text-center">
                                    Link tidak tersedia
                                </div>
                            )}

                            <Link
                                href="/beasiswa"
                                className="flex items-center justify-center gap-2 w-full py-2.5 mt-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all"
                            >
                                ← Kembali ke Daftar
                            </Link>
                        </div>

                        {/* Info Box */}
                        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-3">
                            <h3 className="text-sm font-bold text-slate-700">Informasi Beasiswa</h3>
                            <div className="space-y-2">
                                {item.provider && (
                                    <div className="flex gap-3 items-start">
                                        <span className="text-emerald-500 mt-0.5">🏢</span>
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">Penyelenggara</p>
                                            <p className="text-sm font-semibold text-slate-700">{item.provider}</p>
                                        </div>
                                    </div>
                                )}
                                {deadline && (
                                    <div className="flex gap-3 items-start">
                                        <span className="text-emerald-500 mt-0.5">📅</span>
                                        <div>
                                            <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">Batas Pendaftaran</p>
                                            <p className={`text-sm font-semibold ${expired ? "text-red-600" : soon ? "text-amber-600" : "text-slate-700"}`}>
                                                {formatDate(deadline)}
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-3 items-start">
                                    <span className="text-emerald-500 mt-0.5">🔖</span>
                                    <div>
                                        <p className="text-[10px] text-slate-400 uppercase font-semibold tracking-wide">Status</p>
                                        <p className={`text-sm font-bold ${item.status === "Open" ? "text-emerald-600" : "text-red-600"}`}>
                                            {item.status === "Open" ? "✅ Dibuka" : "❌ Ditutup"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
