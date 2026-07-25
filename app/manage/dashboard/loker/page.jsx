"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";

const ITEMS_PER_PAGE = 10;

// Helper function to clean gender indicators from job titles
function cleanJobTitle(title) {
    if (!title) return "";
    
    let clean = title;
    
    // Pattern to match gender indicator suffixes like (m/w/d), (f/m/x), (all genders), (gn), (m/f/*)
    const patterns = [
        /\s*[\(\[-]\s*(m\/w\/d|f\/m\/d|m\/f\/d|w\/m\/d|m\/f\/x|w\/m\/x|m\/w\/x|f\/m\/x|m\/f\/o|gn|all genders|m\/w\/d\/x|m\/w\/x\/d|all|f\/m\/div)\s*[\)\]-]?/gi,
        /\s*[\(\[-]\s*[mwdfx](\/[mwdfx]){1,3}\s*[\)\]]/gi, // generic patterns like (m/f), (m/w/d/x)
        /\s*-\s*all genders\b/gi,
        /\s*\|\s*all genders\b/gi,
    ];
    
    patterns.forEach(pattern => {
        clean = clean.replace(pattern, "");
    });
    
    // Clean up trailing dashes, vertical bars, slashes, or whitespace that might be left over
    clean = clean.replace(/\s*[-|/]\s*$/g, "");
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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [manualForm, setManualForm] = useState({ title: "", company: "", location: "", type: "Full-time", link: "", source: "Manual / Sosial Media", description: "" });
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
                setManualForm(prev => ({
                    ...prev,
                    title: data.title || prev.title,
                    description: data.description || prev.description,
                    company: data.company || prev.company,
                    source: data.source !== "Manual / Sosial Media" ? data.source : prev.source
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
        const { error } = await supabase.from("job_vacancies").insert([manualForm]);
        setSubmittingManual(false);
        if (error) {
            alert("Gagal menambahkan loker: " + error.message);
        } else {
            setIsModalOpen(false);
            setManualForm({ title: "", company: "", location: "", type: "Full-time", link: "", source: "Manual / Sosial Media", description: "" });
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
                                ) : jobs.map((job) => (
                                    <tr key={job.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900">{cleanJobTitle(job.title)}</div>
                                            <div className="text-xs text-gray-500">{job.company} • {job.location}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${job.source.includes('Manual') ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'}`}>
                                                {job.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => setSelectedAdminJob(job)} className="text-indigo-600 hover:text-indigo-900 mr-4">Detail</button>
                                            <a href={job.link} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-gray-950 mr-4">Link Asli</a>
                                            <button onClick={() => handleDeleteJob(job.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                ))}
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
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Tambah Loker Manual</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Posisi Pekerjaan</label>
                                <input required type="text" value={manualForm.title} onChange={e => setManualForm({...manualForm, title: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Frontend Developer" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Nama Perusahaan</label>
                                <input required type="text" value={manualForm.company} onChange={e => setManualForm({...manualForm, company: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: PT. Inovasi Bangsa" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Lokasi</label>
                                    <input type="text" value={manualForm.location} onChange={e => setManualForm({...manualForm, location: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Jakarta / WFO" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Tipe</label>
                                    <select value={manualForm.type} onChange={e => setManualForm({...manualForm, type: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                                        <option value="Full-time">Full-time</option>
                                        <option value="Part-time">Part-time</option>
                                        <option value="Internship">Internship</option>
                                        <option value="Contract">Contract</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Link Pendaftaran (Wajib)</label>
                                <div className="flex gap-2 items-start">
                                    <input required type="url" value={manualForm.link} onChange={e => setManualForm({...manualForm, link: e.target.value})} className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="https://projects.co.id/... atau link valid" />
                                    <button 
                                        type="button" 
                                        onClick={handleFetchUrlData}
                                        disabled={fetchingUrl || !manualForm.link}
                                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 border border-indigo-200 whitespace-nowrap"
                                    >
                                        {fetchingUrl ? "Mencari..." : "Isi Otomatis ⚡"}
                                    </button>
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1">Isi otomatis mendukung projects.co.id, Upwork, Freelancer, Jobstreet, dll.</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Pekerjaan (Opsional)</label>
                                <textarea value={manualForm.description} onChange={e => setManualForm({...manualForm, description: e.target.value})} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-24" placeholder="Kualifikasi, deskripsi pekerjaan, dll..."></textarea>
                            </div>
                            <button type="submit" disabled={submittingManual} className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
                                {submittingManual ? 'Menyimpan...' : 'Simpan Loker'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detail Loker untuk Admin */}
            {selectedAdminJob && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-2xl p-6 flex flex-col max-h-[85vh]">
                        <div className="flex justify-between items-start border-b border-gray-100 pb-3 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{cleanJobTitle(selectedAdminJob.title)}</h3>
                                <p className="text-sm text-gray-500">{selectedAdminJob.company} • {selectedAdminJob.location}</p>
                            </div>
                            <button onClick={() => setSelectedAdminJob(null)} className="text-gray-400 hover:text-gray-600 p-1">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto flex-1 text-sm text-gray-700 leading-relaxed mb-6">
                            {selectedAdminJob.description ? (
                                <div dangerouslySetInnerHTML={{ __html: selectedAdminJob.description }} />
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
            )}
        </div>
    );
}
