"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { getLocationScope, getJobCategory } from "@/app/loker/page";

const ITEMS_PER_PAGE = 10;

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

export default function LokerAdminPage() {
    const supabase = useMemo(() => {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
        );
    }, []);

    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scraping, setScraping] = useState(false);
    const [message, setMessage] = useState(null);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const fetchJobs = useCallback(async (currentPage) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("job_vacancies")
            .select("*")
            .order("created_at", { ascending: false })
            .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

        if (!error && data) {
            setJobs(data);
        }
        setLoading(false);
    }, [supabase]);

    const fetchCount = useCallback(async () => {
        const { count, error } = await supabase
            .from("job_vacancies")
            .select("id", { count: "exact", head: true });
        if (!error) {
            setTotalCount(count);
        }
    }, [supabase]);

    const fetchApplications = useCallback(async () => {
        // Fetch recent applications with job title
        const { data, error } = await supabase
            .from("job_applications")
            .select(`
                *,
                job_vacancies ( title, company )
            `)
            .order("applied_at", { ascending: false })
            .limit(20);

        if (!error && data) {
            setApplications(data);
        }
    }, [supabase]);

    useEffect(() => {
        fetchJobs(page);
        fetchCount();
        fetchApplications();
    }, [page, fetchJobs, fetchCount, fetchApplications]);

    const handleScrape = async () => {
        setScraping(true);
        setMessage(null);
        try {
            const res = await fetch("/api/loker/scrape", { method: "POST" });
            const data = await res.json();
            if (res.ok) {
                setMessage({ type: "success", text: data.message });
                fetchJobs(0);
                setPage(0);
                fetchCount();
            } else {
                setMessage({ type: "error", text: data.error || "Gagal scraping." });
            }
        } catch (error) {
            setMessage({ type: "error", text: "Terjadi kesalahan jaringan." });
        }
        setScraping(false);
    };

    const handleDeleteJob = async (id) => {
        if (window.confirm("Yakin ingin menghapus loker ini? (Semua lamaran terkait juga akan terhapus)")) {
            await supabase.from("job_vacancies").delete().eq("id", id);
            fetchJobs(page);
            fetchCount();
            fetchApplications();
        }
    };

    const handleUpdateApplicationStatus = async (id, newStatus) => {
        const { error } = await supabase
            .from("job_applications")
            .update({ status: newStatus })
            .eq("id", id);
        
        if (!error) {
            fetchApplications();
        } else {
            alert("Gagal mengupdate status: " + error.message);
        }
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    // Modal state for Detail
    const [selectedAdminJob, setSelectedAdminJob] = useState(null);

    // Modal state for Manual Entry
    const defaultManualForm = {
        title: "",
        company: "",
        scope: "Dalam Negeri", // 'Dalam Negeri' or 'Luar Negeri'
        city: "Jakarta",
        workMode: "WFO / On-site", // 'WFO / On-site', 'Remote / WFH', 'Hybrid'
        type: "Full-time",
        link: "",
        source: "Manual / LinkedIn",
        description: ""
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [manualForm, setManualForm] = useState(defaultManualForm);
    const [submittingManual, setSubmittingManual] = useState(false);
    const [fetchingUrl, setFetchingUrl] = useState(false);

    const handleFetchUrlData = async () => {
        if (!manualForm.link) {
            alert("Harap masukkan Link Pendaftaran (URL) terlebih dahulu!");
            return;
        }
        setFetchingUrl(true);
        try {
            const res = await fetch("/api/loker/scrape-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: manualForm.link })
            });
            const data = await res.json();
            if (res.ok) {
                // Infer remote mode from scraped text
                const textToCheck = `${data.title} ${data.description}`.toLowerCase();
                const isRemote = textToCheck.includes("remote") || textToCheck.includes("wfh");
                
                setManualForm(prev => ({
                    ...prev,
                    title: data.title || prev.title,
                    description: data.description || prev.description,
                    company: data.company || prev.company,
                    source: data.source && data.source !== "Manual / Sosial Media" ? `Manual / ${data.source}` : prev.source,
                    workMode: isRemote ? "Remote / WFH" : prev.workMode
                }));
            } else {
                alert("Gagal mengambil data dari URL: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            alert("Terjadi kesalahan koneksi saat mengambil URL.");
        }
        setFetchingUrl(false);
    };

    const handleManualSubmit = async (e) => {
        e.preventDefault();
        setSubmittingManual(true);

        // Format clean location string that guarantees accurate scope & remote badge detection
        let formattedLocation = "";
        const rawCity = (manualForm.city || "").trim();

        if (manualForm.scope === "Dalam Negeri") {
            const cityName = rawCity || "Indonesia";
            formattedLocation = cityName.toLowerCase().includes("indonesia") ? cityName : `${cityName}, Indonesia`;
        } else {
            formattedLocation = rawCity || "Luar Negeri";
        }

        if (manualForm.workMode === "Remote / WFH") {
            if (!formattedLocation.toLowerCase().includes("remote")) {
                formattedLocation += " (Remote)";
            }
        } else if (manualForm.workMode === "Hybrid") {
            if (!formattedLocation.toLowerCase().includes("hybrid")) {
                formattedLocation += " (Hybrid)";
            }
        }

        const payload = {
            title: manualForm.title.trim(),
            company: manualForm.company.trim(),
            location: formattedLocation,
            type: manualForm.type,
            link: manualForm.link.trim(),
            source: manualForm.source || "Manual",
            description: manualForm.description.trim()
        };

        const { error } = await supabase.from("job_vacancies").insert([payload]);
        setSubmittingManual(false);
        if (error) {
            alert("Gagal menambahkan loker: " + error.message);
        } else {
            setIsModalOpen(false);
            setManualForm(defaultManualForm);
            fetchJobs(0);
            setPage(0);
            fetchCount();
        }
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Lowongan Kerja (Loker)</h1>
                    <p className="text-sm text-gray-500">Kelola data scraping, manual, dan lamaran mahasiswa</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
                    >
                        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Tambah Manual
                    </button>
                    <button 
                        onClick={handleScrape} 
                        disabled={scraping}
                        className="bg-purple-600 text-white px-4 py-2 rounded-xl hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 flex items-center gap-2 disabled:opacity-50"
                    >
                        {scraping ? (
                            <span className="animate-spin">⏳</span>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                        )}
                        {scraping ? "Sedang Scraping..." : "Scrape Loker"}
                    </button>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Loker Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Daftar Loker ({totalCount})</h2>
                    <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Posisi / Perusahaan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sumber</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan="3" className="text-center py-8 text-gray-500">Memuat data...</td></tr>
                                ) : jobs.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-8 text-gray-500">Belum ada data loker. Silakan klik tombol Scrape atau Tambah Manual.</td></tr>
                                ) : (
                                    jobs.map((job) => {
                                        const scopeInfo = getLocationScope(job);
                                        const catInfo = getJobCategory(job);
                                        return (
                                            <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 mb-1">
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${scopeInfo.color}`}>
                                                            {scopeInfo.badge}
                                                        </span>
                                                        {scopeInfo.isRemote && (
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                                                🏠 Remote
                                                            </span>
                                                        )}
                                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${catInfo.color}`}>
                                                            {catInfo.icon} {catInfo.name}
                                                        </span>
                                                    </div>
                                                    <div className="text-sm font-bold text-gray-900">{cleanJobTitle(job.title)}</div>
                                                    <div className="text-xs text-gray-500">{job.company} • {job.location}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${job.source.includes('Manual') ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                                                        {job.source}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => setSelectedAdminJob(job)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-semibold">Detail</button>
                                                    <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-950 mr-4">Link Asli</a>
                                                    <button onClick={() => handleDeleteJob(job.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-4">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading} className="px-3 py-1 bg-gray-200 rounded-lg text-sm disabled:opacity-50">
                            &larr; Prev
                        </button>
                        <span className="text-sm text-gray-600">Hal {page + 1} dari {totalPages || 1}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || loading || totalPages === 0} className="px-3 py-1 bg-gray-200 rounded-lg text-sm disabled:opacity-50">
                            Next &rarr;
                        </button>
                    </div>
                </div>

                {/* Lamaran Section */}
                <div className="lg:col-span-1">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Lamaran Masuk</h2>
                    <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-4">
                        {applications.length === 0 ? (
                            <p className="text-gray-500 text-sm text-center py-4">Belum ada mahasiswa yang melamar.</p>
                        ) : (
                            <div className="space-y-4">
                                {applications.map(app => (
                                    <div key={app.id} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                                        <div className="flex justify-between items-start mb-1">
                                            <div className="text-sm font-bold text-gray-900 line-clamp-1" title={app.job_vacancies?.title}>
                                                {app.job_vacancies?.title}
                                            </div>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${app.status === 'Terkirim' ? 'bg-yellow-100 text-yellow-800' : app.status === 'Diproses' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                {app.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-500 mb-2">
                                            {app.job_vacancies?.company} • {app.user_email}
                                        </div>
                                        <div className="flex gap-2">
                                            <a href={app.cv_url} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-100 text-slate-700 px-2 py-1 rounded hover:bg-slate-200 transition-colors">
                                                Lihat CV
                                            </a>
                                            <select 
                                                value={app.status}
                                                onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                                                className="text-[10px] border border-gray-200 rounded px-1 text-gray-700 bg-white"
                                            >
                                                <option value="Terkirim">Terkirim</option>
                                                <option value="Diproses">Diproses</option>
                                                <option value="Diterima">Diterima</option>
                                                <option value="Ditolak">Ditolak</option>
                                            </select>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Tambah Manual */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl p-6 md:p-7 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <span>➕ Tambah Loker Baru</span>
                                </h3>
                                <p className="text-xs text-gray-500">Isi form detail atau gunakan Isi Otomatis dari URL loker</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Scrollable Form Body */}
                        <form onSubmit={handleManualSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
                            {/* Link Pendaftaran & Auto Fetch */}
                            <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100">
                                <label className="block text-xs font-bold text-indigo-900 mb-1">
                                    🔗 Link Pendaftaran / URL Sumber (Wajib)
                                </label>
                                <div className="flex gap-2 items-center">
                                    <input 
                                        required 
                                        type="url" 
                                        value={manualForm.link} 
                                        onChange={e => setManualForm({...manualForm, link: e.target.value})} 
                                        className="flex-1 bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" 
                                        placeholder="https://projects.co.id/... atau linkedin.com/jobs/..." 
                                    />
                                    <button 
                                        type="button" 
                                        onClick={handleFetchUrlData}
                                        disabled={fetchingUrl || !manualForm.link}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-sm shadow-indigo-200 whitespace-nowrap flex items-center gap-1.5"
                                    >
                                        {fetchingUrl ? (
                                            <>
                                                <span className="animate-spin text-xs">⏳</span>
                                                <span>Mencari...</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>⚡ Isi Otomatis</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                                <p className="text-[10px] text-indigo-700/70 mt-1">Dapat mengisi judul, perusahaan, dan deskripsi secara otomatis dari website lowongan.</p>
                            </div>

                            {/* Posisi & Perusahaan */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Posisi Pekerjaan</label>
                                    <input 
                                        required 
                                        type="text" 
                                        value={manualForm.title} 
                                        onChange={e => setManualForm({...manualForm, title: e.target.value})} 
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" 
                                        placeholder="Contoh: Senior Backend Engineer" 
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Nama Perusahaan</label>
                                    <input 
                                        required 
                                        type="text" 
                                        value={manualForm.company} 
                                        onChange={e => setManualForm({...manualForm, company: e.target.value})} 
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" 
                                        placeholder="Contoh: PT. Telkom Indonesia" 
                                    />
                                </div>
                            </div>

                            {/* Wilayah / Scope (Dalam Negeri vs Luar Negeri) */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                                    📍 Wilayah Cakupan (Dalam / Luar Negeri)
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setManualForm(prev => ({ ...prev, scope: "Dalam Negeri", city: prev.city === "Luar Negeri" || !prev.city ? "Jakarta" : prev.city }))}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                                            manualForm.scope === "Dalam Negeri"
                                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-200"
                                                : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100/70"
                                        }`}
                                    >
                                        <span>🇮🇩</span>
                                        <span>Dalam Negeri (Indonesia)</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setManualForm(prev => ({ ...prev, scope: "Luar Negeri", city: prev.city === "Jakarta" || !prev.city ? "Singapura" : prev.city }))}
                                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                                            manualForm.scope === "Luar Negeri"
                                                ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200"
                                                : "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100/70"
                                        }`}
                                    >
                                        <span>🌐</span>
                                        <span>Luar Negeri (Internasional)</span>
                                    </button>
                                </div>
                            </div>

                            {/* Kota / Wilayah Spesifik & Mode Kerja */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        {manualForm.scope === "Dalam Negeri" ? "Kota / Wilayah di Indonesia" : "Kota / Negara Asal"}
                                    </label>
                                    <input 
                                        type="text" 
                                        value={manualForm.city} 
                                        onChange={e => setManualForm({...manualForm, city: e.target.value})} 
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" 
                                        placeholder={manualForm.scope === "Dalam Negeri" ? "Contoh: Jakarta, Bandung, Surabaya, Bali, dll" : "Contoh: Singapura, Berlin / Jerman, Tokyo, dll"} 
                                    />
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                        {(manualForm.scope === "Dalam Negeri" 
                                            ? ["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Bali", "Remote Indonesia"] 
                                            : ["Singapura", "Malaysia", "Berlin, Germany", "Tokyo, Japan", "Global Remote"]
                                        ).map(sugg => (
                                            <button
                                                key={sugg}
                                                type="button"
                                                onClick={() => setManualForm(prev => ({ ...prev, city: sugg }))}
                                                className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded"
                                            >
                                                {sugg}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Sistem / Mode Kerja</label>
                                    <select 
                                        value={manualForm.workMode} 
                                        onChange={e => setManualForm({...manualForm, workMode: e.target.value})} 
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="WFO / On-site">🏢 On-site / WFO (Kantor)</option>
                                        <option value="Remote / WFH">🏠 Remote / WFH (Kerja Jarak Jauh)</option>
                                        <option value="Hybrid">🔄 Hybrid (Kombinasi Kantor & Rumah)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Tipe Kontrak & Sumber Loker */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Tipe Pekerjaan</label>
                                    <select 
                                        value={manualForm.type} 
                                        onChange={e => setManualForm({...manualForm, type: e.target.value})} 
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                    >
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Internship">Internship / Magang</option>
                                        <option value="Contract">Contract / Kontrak</option>
                                        <option value="Freelance">Freelance / Proyek</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Sumber Informasi</label>
                                    <input 
                                        type="text" 
                                        value={manualForm.source} 
                                        onChange={e => setManualForm({...manualForm, source: e.target.value})} 
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" 
                                        placeholder="Contoh: Manual / LinkedIn" 
                                    />
                                </div>
                            </div>

                            {/* Live Badge Preview */}
                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                                <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                                    <span>👁️ Preview Tampilan Badge & Lokasi:</span>
                                    <span className="text-[10px] text-slate-400 font-normal">Otomatis diformat saat disimpan</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                        manualForm.scope === "Dalam Negeri" 
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                                            : "bg-blue-50 text-blue-700 border-blue-200"
                                    }`}>
                                        {manualForm.scope === "Dalam Negeri" ? "🇮🇩 Dalam Negeri" : "🌐 Luar Negeri"}
                                    </span>
                                    {manualForm.workMode === "Remote / WFH" && (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                            🏠 Remote
                                        </span>
                                    )}
                                    <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded">
                                        {manualForm.type}
                                    </span>
                                </div>
                                <div className="text-xs font-semibold text-slate-700">
                                    {manualForm.company || "Nama Perusahaan"} • {manualForm.city || (manualForm.scope === "Dalam Negeri" ? "Indonesia" : "Luar Negeri")}
                                    {manualForm.workMode === "Remote / WFH" ? " (Remote)" : manualForm.workMode === "Hybrid" ? " (Hybrid)" : ""}
                                </div>
                            </div>

                            {/* Deskripsi Pekerjaan */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi & Kualifikasi Pekerjaan (Opsional)</label>
                                <textarea 
                                    value={manualForm.description} 
                                    onChange={e => setManualForm({...manualForm, description: e.target.value})} 
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none h-24 bg-slate-50 focus:bg-white leading-relaxed" 
                                    placeholder="Tuliskan tanggung jawab, kualifikasi teknis, benefit, dll..."
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div className="pt-2 flex gap-3">
                                <button 
                                    type="submit" 
                                    disabled={submittingManual} 
                                    className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-md shadow-indigo-100"
                                >
                                    {submittingManual ? 'Menyimpan ke Database...' : '💾 Simpan Loker ke Database'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setIsModalOpen(false)}
                                    disabled={submittingManual}
                                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detail Loker untuk Admin */}
            {selectedAdminJob && (() => {
                const adminScope = getLocationScope(selectedAdminJob);
                const adminCat = getJobCategory(selectedAdminJob);

                return (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl w-full max-w-2xl p-6 flex flex-col max-h-[85vh]">
                            <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
                                <div>
                                    <div className="flex flex-wrap items-center gap-1.5 mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${adminScope.color}`}>
                                            {adminScope.badge}
                                        </span>
                                        {adminScope.isRemote && (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                                🏠 Remote
                                            </span>
                                        )}
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${adminCat.color}`}>
                                            {adminCat.icon} {adminCat.name}
                                        </span>
                                        <span className="text-[10px] bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded">
                                            {selectedAdminJob.type || "Full-time"}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">{cleanJobTitle(selectedAdminJob.title)}</h3>
                                    <p className="text-sm text-gray-500">{selectedAdminJob.company} • {selectedAdminJob.location}</p>
                                </div>
                                <button onClick={() => setSelectedAdminJob(null)} className="text-gray-400 hover:text-gray-600 p-1">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                </button>
                            </div>
                        <div className="overflow-y-auto flex-1 text-sm text-gray-700 leading-relaxed mb-6 job-description-html pr-2">
                            {selectedAdminJob.description ? (
                                <div dangerouslySetInnerHTML={{ __html: cleanHtmlClient(selectedAdminJob.description) }} />
                            ) : (
                                <p className="text-gray-400 italic">Tidak ada deskripsi detail.</p>
                            )}
                        </div>
                        <div className="flex justify-end gap-3 border-t border-gray-100 pt-3">
                            <a href={selectedAdminJob.link} target="_blank" rel="noopener noreferrer" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors">
                                Kunjungi Link Sumber
                            </a>
                            <button onClick={() => setSelectedAdminJob(null)} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-colors">
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            );
        })()}
    </div>
);
}
