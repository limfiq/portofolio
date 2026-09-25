"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";

const ITEMS_PER_PAGE = 10;

export default function ScholarshipsAdminPage() {
    const supabase = useMemo(() => {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
        );
    }, []);

    const [scholarships, setScholarships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [fetchingUrl, setFetchingUrl] = useState(false);
    
    // Modal state for Manual Entry
    const defaultManualForm = {
        title: "",
        provider: "",
        url: "",
        deadline: "",
        status: "Open",
        description: ""
    };

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [manualForm, setManualForm] = useState(defaultManualForm);
    const [submittingManual, setSubmittingManual] = useState(false);

    const fetchScholarships = useCallback(async (currentPage) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("scholarships")
            .select("*")
            .order("created_at", { ascending: false })
            .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

        if (!error && data) {
            setScholarships(data);
        }
        setLoading(false);
    }, [supabase]);

    const fetchCount = useCallback(async () => {
        const { count, error } = await supabase
            .from("scholarships")
            .select("id", { count: "exact", head: true });
        if (!error) {
            setTotalCount(count);
        }
    }, [supabase]);

    useEffect(() => {
        fetchScholarships(page);
        fetchCount();
    }, [page, fetchScholarships, fetchCount]);

    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus beasiswa ini?")) {
            await supabase.from("scholarships").delete().eq("id", id);
            fetchScholarships(page);
            fetchCount();
        }
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const openCreateModal = () => {
        setEditingId(null);
        setManualForm(defaultManualForm);
        setIsModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditingId(item.id);
        setManualForm({
            title: item.title || "",
            provider: item.provider || "",
            url: item.url || "",
            deadline: item.deadline ? item.deadline.split('T')[0] : "",
            status: item.status || "Open",
            description: item.description || ""
        });
        setIsModalOpen(true);
    };

    const handleFetchUrlData = async () => {
        if (!manualForm.url) {
            alert("Harap masukkan Link (URL) terlebih dahulu!");
            return;
        }
        setFetchingUrl(true);
        try {
            const res = await fetch("/api/beasiswa/scrape-url", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: manualForm.url })
            });
            const data = await res.json();
            if (res.ok) {
                setManualForm(prev => ({
                    ...prev,
                    title: data.title || prev.title,
                    description: data.description || prev.description,
                    provider: data.provider || prev.provider
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

        const payload = {
            title: manualForm.title.trim(),
            provider: manualForm.provider.trim(),
            url: manualForm.url.trim(),
            status: manualForm.status,
            description: manualForm.description.trim(),
            deadline: manualForm.deadline || null
        };

        if (editingId) {
            const { error } = await supabase
                .from("scholarships")
                .update(payload)
                .eq("id", editingId);
                
            if (error) alert("Gagal memperbarui: " + error.message);
            else {
                setIsModalOpen(false);
                fetchScholarships(page);
            }
        } else {
            const { error } = await supabase
                .from("scholarships")
                .insert([payload]);
                
            if (error) alert("Gagal menambahkan: " + error.message);
            else {
                setIsModalOpen(false);
                fetchScholarships(0);
                setPage(0);
                fetchCount();
            }
        }
        setSubmittingManual(false);
    };

    const handleBulkScrape = async () => {
        if (!window.confirm("Ini akan mengambil daftar beasiswa terbaru dari Indbeasiswa.com dan menambahkannya ke database. Lanjutkan?")) return;
        
        setFetchingUrl(true);
        try {
            const res = await fetch("/api/beasiswa/scrape-indbeasiswa");
            const data = await res.json();
            
            if (res.ok && data.success) {
                if (data.data.length === 0) {
                    alert("Tidak ada data ditemukan.");
                } else {
                    // Check if exists based on URL to prevent duplicates (basic check, can be improved)
                    let addedCount = 0;
                    for (const item of data.data) {
                        const { data: existing } = await supabase.from("scholarships").select("id").eq("url", item.url).single();
                        if (!existing) {
                            await supabase.from("scholarships").insert([{
                                title: item.title,
                                url: item.url,
                                provider: item.provider,
                                description: `Beasiswa untuk jenjang ${item.level}. Diambil otomatis dari Indbeasiswa.`,
                                deadline: item.deadline || null,
                                status: "Open"
                            }]);
                            addedCount++;
                        }
                    }
                    alert(`Berhasil menarik ${data.data.length} beasiswa. ${addedCount} data baru ditambahkan ke database.`);
                    fetchScholarships(0);
                    setPage(0);
                    fetchCount();
                }
            } else {
                alert("Gagal melakukan scraping massal: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan saat memanggil API scraper.");
        }
        setFetchingUrl(false);
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Beasiswa & Hibah</h1>
                    <p className="text-sm text-gray-500">Kelola informasi beasiswa untuk ditampilkan di website</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleBulkScrape}
                        disabled={fetchingUrl}
                        className="bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                    >
                        {fetchingUrl ? "⏳ Sedang Menarik..." : "⚡ Tarik dari Indbeasiswa"}
                    </button>
                    <button 
                        onClick={openCreateModal}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition-all shadow-sm flex items-center gap-2"
                    >
                        ➕ Tambah Baru
                    </button>
                </div>
            </div>

            <div className="bg-white shadow-sm border border-gray-100 rounded-xl overflow-hidden">
                <div>
                    <div className="px-5 py-4 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-800">Daftar Beasiswa ({totalCount})</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Beasiswa / Penyelenggara</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status & Deadline</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr><td colSpan="3" className="text-center py-8 text-gray-500">Memuat data...</td></tr>
                                ) : scholarships.length === 0 ? (
                                    <tr><td colSpan="3" className="text-center py-8 text-gray-500">Belum ada data beasiswa.</td></tr>
                                ) : (
                                    scholarships.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-bold text-gray-900">{item.title}</div>
                                                <div className="text-xs text-gray-500">{item.provider}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${item.status === 'Open' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                    {item.status}
                                                </span>
                                                {item.deadline && <div className="text-xs text-gray-500 mt-1">S/D: {item.deadline}</div>}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="inline-flex items-center gap-2">
                                                    <button onClick={() => openEditModal(item)} className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-semibold">Edit</button>
                                                    <button onClick={() => handleDelete(item.id)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold">Hapus</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination */}
                    <div className="flex justify-between items-center px-5 py-4 border-t border-gray-100">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">&larr; Prev</button>
                        <span className="text-sm text-gray-600">Hal {page + 1} dari {totalPages || 1}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || loading || totalPages === 0} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors">Next &rarr;</button>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-xl p-6 md:p-7 shadow-2xl max-h-[92vh] flex flex-col overflow-hidden">
                        <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">
                                {editingId ? "✏️ Edit Beasiswa" : "➕ Tambah Beasiswa"}
                            </h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleManualSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
                            <div className="bg-indigo-50/60 p-3.5 rounded-2xl border border-indigo-100">
                                <label className="block text-xs font-bold text-indigo-900 mb-1">🔗 Link Sumber (URL)</label>
                                <div className="flex gap-2 items-center">
                                    <input required type="url" value={manualForm.url} onChange={e => setManualForm({...manualForm, url: e.target.value})} className="flex-1 bg-white border border-indigo-200 rounded-xl px-3 py-2 text-xs outline-none" />
                                    <button type="button" onClick={handleFetchUrlData} disabled={fetchingUrl || !manualForm.url} className="bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50">
                                        {fetchingUrl ? "⏳ Scrape..." : "⚡ Isi Otomatis"}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Nama Beasiswa / Hibah</label>
                                    <input required type="text" value={manualForm.title} onChange={e => setManualForm({...manualForm, title: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Penyelenggara</label>
                                    <input required type="text" value={manualForm.provider} onChange={e => setManualForm({...manualForm, provider: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Tenggat Waktu (Deadline)</label>
                                    <input type="date" value={manualForm.deadline} onChange={e => setManualForm({...manualForm, deadline: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                                    <select value={manualForm.status} onChange={e => setManualForm({...manualForm, status: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none">
                                        <option value="Open">Buka (Open)</option>
                                        <option value="Closed">Tutup (Closed)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Singkat</label>
                                <textarea value={manualForm.description} onChange={e => setManualForm({...manualForm, description: e.target.value})} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs bg-slate-50 outline-none h-24" />
                            </div>

                            <div className="pt-2 flex gap-3">
                                <button type="submit" disabled={submittingManual} className="flex-1 bg-indigo-600 text-white rounded-xl py-2.5 text-xs font-bold hover:bg-indigo-700 disabled:opacity-50">
                                    {submittingManual ? 'Menyimpan...' : '💾 Simpan'}
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold">Batal</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
