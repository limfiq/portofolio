"use client";

import { useCallback, useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";

const ITEMS_PER_PAGE = 10;

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
);

const CATEGORIES = [
    { value: "Teaching", label: "🎓 Pengajaran (Teaching)" },
    { value: "Research", label: "🔬 Penelitian (Research)" },
    { value: "Community Service", label: "🤝 Pengabdian (Community Service)" },
    { value: "Award", label: "🏆 Penghargaan (Award)" },
    { value: "Event", label: "🎪 Event / Kegiatan" },
];

const categoryBadgeStyle = {
    "Teaching": "bg-blue-50 text-blue-700 border-blue-200",
    "Research": "bg-purple-50 text-purple-700 border-purple-200",
    "Community Service": "bg-emerald-50 text-emerald-700 border-emerald-200",
    "Award": "bg-amber-50 text-amber-700 border-amber-200",
    "Event": "bg-pink-50 text-pink-700 border-pink-200",
};

export default function ManageGalleryPage() {
    const [gallery, setGallery] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentGallery, setCurrentGallery] = useState(null);
    const [detailGallery, setDetailGallery] = useState(null);
    const [form, setForm] = useState({
        title: "",
        category: "Event",
        media_url: "",
        description: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const getGDriveDirectLink = (urlOrId) => {
        if (!urlOrId) return "";
        const idMatch = urlOrId.match(/(?:id=|\/d\/|folders\/)([a-zA-Z0-9-_]{25,})/);
        const id = idMatch ? idMatch[1] : urlOrId;
        if (urlOrId.includes("lh3.googleusercontent.com") || (!urlOrId.includes("drive.google.com") && !urlOrId.includes("google.com/open"))) {
            return urlOrId;
        }
        return `https://lh3.googleusercontent.com/d/${id}`;
    };

    const fetchGallery = useCallback(async (currentPage) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("gallery")
            .select("*")
            .order("created_at", { ascending: false })
            .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

        if (error) {
            setError(error.message);
            setGallery([]);
        } else {
            setGallery(data || []);
            setError(null);
        }
        setLoading(false);
    }, []);

    const fetchCount = useCallback(async () => {
        const { count, error } = await supabase
            .from("gallery")
            .select("id", { count: "exact", head: true });
        if (!error && count !== null) {
            setTotalCount(count);
        }
    }, []);

    useEffect(() => {
        fetchGallery(page);
        fetchCount();
    }, [page, fetchGallery, fetchCount]);

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    const handleOpenModal = (item = null) => {
        setCurrentGallery(item);
        if (item) {
            setForm({
                title: item.title || "",
                category: item.category || "Event",
                media_url: item.media_url || "",
                description: item.description || "",
            });
        } else {
            setForm({
                title: "",
                category: "Event",
                media_url: "",
                description: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentGallery(null);
        setError(null);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingImage(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/uploads", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.url) {
                setForm((prev) => ({ ...prev, media_url: data.url }));
            } else {
                alert("Gagal mengunggah file: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            alert("Kesalahan saat mengunggah file gambar.");
        } finally {
            setUploadingImage(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Anda harus login terlebih dahulu");

            const finalMediaUrl = getGDriveDirectLink(form.media_url);

            const payload = {
                user_id: user.id,
                title: form.title.trim(),
                category: form.category,
                media_url: finalMediaUrl.trim(),
                description: form.description.trim(),
            };

            if (currentGallery) {
                const { error: updateError } = await supabase
                    .from("gallery")
                    .update(payload)
                    .eq("id", currentGallery.id);
                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("gallery")
                    .insert([payload]);
                if (insertError) throw insertError;
            }

            handleCloseModal();
            fetchGallery(page);
            fetchCount();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Apakah Anda yakin ingin menghapus foto ini dari galeri?")) return;

        const { error } = await supabase.from("gallery").delete().eq("id", id);
        if (error) {
            alert("Gagal menghapus: " + error.message);
        } else {
            fetchGallery(page);
            fetchCount();
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Galeri</h1>
                    <p className="text-sm text-gray-500">Kelola dokumentasi foto pengajaran, riset, pengabdian, dan kegiatan</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 flex items-center gap-2 text-sm font-bold"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah Foto Galeri
                </button>
            </div>

            {loading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}

            {error && <p className="text-red-500 bg-red-100 p-4 rounded-xl mb-6 text-sm">{error}</p>}

            {!loading && gallery.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200">
                    <div className="text-4xl mb-2">📸</div>
                    <p className="text-gray-500 font-medium">Belum ada dokumentasi galeri.</p>
                    <p className="text-xs text-gray-400 mt-1">Klik tombol &ldquo;Tambah Foto Galeri&rdquo; untuk menambahkan foto pertama.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Foto & Judul</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {gallery.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                                                    {item.media_url ? (
                                                        <Image
                                                            src={item.media_url}
                                                            alt={item.title || "Galeri"}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                                                            No Img
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 line-clamp-1">{item.title}</div>
                                                    <div className="text-xs text-gray-500 line-clamp-1">{item.description || "Tidak ada deskripsi"}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-md border ${categoryBadgeStyle[item.category] || "bg-slate-100 text-slate-700"}`}>
                                                {item.category || "Event"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {item.created_at ? new Date(item.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setDetailGallery(item)}
                                                    className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold"
                                                >
                                                    Detail
                                                </button>
                                                <button
                                                    onClick={() => handleOpenModal(item)}
                                                    className="bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors text-xs font-bold"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-xs font-bold"
                                                >
                                                    Hapus
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0 || loading}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-all font-medium text-xs"
                        >
                            Sebelumnya
                        </button>
                        <span className="text-xs text-gray-500 font-medium">
                            Halaman <span className="text-gray-900 font-bold">{page + 1}</span> dari <span className="text-gray-900 font-bold">{totalPages || 1}</span>
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1 || loading}
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-all font-medium text-xs"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </>
            )}

            {/* Modal Tambah/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-3 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {currentGallery ? "✏️ Edit Foto Galeri" : "➕ Tambah Foto Galeri Baru"}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Judul / Keterangan Singkat Foto</label>
                                <input
                                    type="text"
                                    required
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Contoh: Penyerahan Penghargaan Best Paper ICACS"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Kategori Kegiatan</label>
                                <select
                                    value={form.category}
                                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                >
                                    {CATEGORIES.map((cat) => (
                                        <option key={cat.value} value={cat.value}>
                                            {cat.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">URL Media / Foto</label>
                                <input
                                    type="text"
                                    required
                                    value={form.media_url}
                                    onChange={(e) => setForm({ ...form, media_url: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                                    placeholder="https://... atau Link Google Drive / Imgur"
                                />

                                <div className="flex items-center gap-2">
                                    <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5">
                                        <span>📁 Upload File Gambar</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            disabled={uploadingImage}
                                        />
                                    </label>
                                    {uploadingImage && <span className="text-xs text-blue-600 font-medium animate-pulse">Mengunggah gambar...</span>}
                                </div>

                                {form.media_url && (
                                    <div className="mt-3 relative h-40 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                        <Image
                                            src={getGDriveDirectLink(form.media_url)}
                                            alt="Pratinjau Foto"
                                            fill
                                            className="object-contain"
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Deskripsi Tambahan (Opsional)</label>
                                <textarea
                                    rows={3}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
                                    placeholder="Keterangan lengkap mengenai kegiatan atau dokumentasi ini..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-blue-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md shadow-blue-100"
                                >
                                    {submitting ? "Menyimpan..." : (currentGallery ? "Simpan Perubahan" : "Tambah Foto")}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detail */}
            {detailGallery && (
                <div
                    className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                    onClick={() => setDetailGallery(null)}
                >
                    <div
                        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative h-64 w-full bg-slate-900">
                            {detailGallery.media_url ? (
                                <Image
                                    src={detailGallery.media_url}
                                    alt={detailGallery.title}
                                    fill
                                    className="object-contain"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-white text-xs">
                                    Tidak ada foto
                                </div>
                            )}
                            <button
                                onClick={() => setDetailGallery(null)}
                                className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white w-8 h-8 rounded-full flex items-center justify-center"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-md border ${categoryBadgeStyle[detailGallery.category] || "bg-slate-100 text-slate-700"}`}>
                                {detailGallery.category}
                            </span>
                            <h3 className="text-lg font-bold text-gray-900 mt-2 mb-2">{detailGallery.title}</h3>
                            <p className="text-xs text-gray-600 leading-relaxed">{detailGallery.description || "Tidak ada deskripsi tambahan."}</p>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={() => setDetailGallery(null)}
                                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
