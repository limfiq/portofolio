"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import Image from "next/image";
import QuillEditor from "@/components/QuillEditor";

const ITEMS_PER_PAGE = 10;

// Create the Supabase client once at the module level.
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
);

const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
};

const getGDriveDirectLink = (urlOrId) => {
    if (!urlOrId) return "";
    // Regex to extract ID from various GDrive URL formats
    const idMatch = urlOrId.match(/(?:id=|\/d\/|folders\/)([a-zA-Z0-9-_]{25,})/);
    const id = idMatch ? idMatch[1] : urlOrId;

    // If it's already a direct link or not a GDrive link, return as is
    if (urlOrId.includes("lh3.googleusercontent.com") || (!urlOrId.includes("drive.google.com") && !urlOrId.includes("google.com/open"))) {
        return urlOrId;
    }
    return `https://lh3.googleusercontent.com/d/${id}`;
};

const PublicationsPage = () => {
    const [publications, setPublications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPublication, setCurrentPublication] = useState(null);
    const [form, setForm] = useState({
        title: "",
        year: "",
        type: "Journal", // Default value as per schema
        publisher: "",
        doi: "",
        link: "",
        abstract: "",
        authors: "",
        cover_image: "",
        index: "",
        status: "Published",
    });
    const [uploading, setUploading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const fetchPublications = useCallback(async (currentPage) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("publications") // Changed table name
            .select("*")
            .order("created_at", { ascending: false })
            .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

        if (error) {
            setError(error.message);
            setPublications([]);
        } else {
            setPublications(data);
            setError(null);
        }
        setLoading(false);
    }, [supabase]); // Added supabase to dependencies

    const fetchCount = useCallback(async () => {
        const { count, error } = await supabase
            .from("publications") // Changed table name
            .select("id", { count: "exact", head: true });
        if (error) {
            console.error("Error fetching count:", error);
        } else {
            setTotalCount(count);
        }
    }, [supabase]);

    useEffect(() => {
        fetchPublications(page);
        fetchCount();
    }, [page, fetchPublications, fetchCount]);

    const handleOpenModal = (publication = null) => {
        setCurrentPublication(publication);
        const emptyForm = {
            title: "",
            year: "",
            type: "Journal",
            publisher: "",
            doi: "",
            link: "",
            abstract: "",
            authors: "",
            cover_image: "",
            index: "",
            status: "Published",
        };

        if (publication) {
            const sanitizedPublication = Object.fromEntries(
                Object.entries(publication).map(([key, value]) => [key, value === null ? "" : value])
            );
            setForm({ ...emptyForm, ...sanitizedPublication });
        } else {
            setForm(emptyForm);
        }

        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentPublication(null);
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("Anda harus login untuk menyimpan data.");
            setUploading(false);
            return;
        }

        // Detect if status changed to set status_changed timestamp
        const statusChangedDate = (!currentPublication || form.status !== currentPublication.status)
            ? new Date().toISOString()
            : currentPublication.status_changed;

        const publicationData = {
            ...form,
            slug: slugify(form.title),
            cover_image: getGDriveDirectLink(form.cover_image),
            user_id: user.id,
            year: parseInt(form.year, 10) || null,
            status_changed: statusChangedDate,
        };

        const { error: queryError } = currentPublication
            ? await supabase.from("publications").update(publicationData).eq("id", currentPublication.id)
            : await supabase.from("publications").insert(publicationData);

        if (queryError) {
            console.error("Supabase Save Error:", queryError);
            setError(queryError.message);
        } else {
            handleCloseModal();
            fetchPublications(page);
            fetchCount();
        }
        setUploading(false);
    };

    const handleDelete = async (publicationId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus publikasi ini?")) {
            const { error } = await supabase.from("publications").delete().eq("id", publicationId);
            if (error) setError(error.message);
            else {
                fetchPublications(page);
                fetchCount();
            }
        }
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Publikasi</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah Publikasi
                </button>
            </div>

            {loading && <p>Memuat data...</p>}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe / Indeks</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tahun</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {publications.map((publication) => (
                            <tr key={publication.id}>
                                <td className="px-6 py-4 max-w-sm">
                                    <div className="text-sm font-medium text-gray-900 break-words">{publication.title}</div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900">{publication.type}</div>
                                    {publication.index && (
                                        <div className="text-xs text-gray-500 font-semibold uppercase">{publication.index}</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{publication.year}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${publication.status === "Published" || publication.status === "Accepted"
                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                            : publication.status === "Draft"
                                                ? "bg-slate-50 text-slate-500 border-slate-200"
                                                : "bg-amber-50 text-amber-700 border-amber-200"
                                        }`}>
                                        {publication.status || "Published"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/publications/${publication.slug}`} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold">Detail</Link>
                                        <button onClick={() => handleOpenModal(publication)} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors text-xs font-bold">Edit</button>
                                        <button onClick={() => handleDelete(publication.id, publication.cover_image)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-xs font-bold">Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-6">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading} className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50">
                    Sebelumnya
                </button>
                <span>Halaman {page + 1} dari {totalPages}</span>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || loading} className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50">
                    Selanjutnya
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto transform transition-all scale-100 flex flex-col">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between z-10">
                            <h2 className="text-lg font-bold text-slate-800">
                                {currentPublication ? "Edit Publikasi Ilmiah" : "Tambah Publikasi Baru"}
                            </h2>
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
                            {/* Section 1: Utama */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Judul Publikasi</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={form.title}
                                        onChange={handleInputChange}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 font-semibold"
                                        required
                                        placeholder="Masukkan judul publikasi lengkap..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Penulis / Kontributor (pisahkan dengan koma)</label>
                                    <input
                                        type="text"
                                        name="authors"
                                        value={form.authors}
                                        onChange={handleInputChange}
                                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                                        placeholder="Contoh: Dr. John Doe, Prof. Jane Smith, M.T."
                                    />
                                </div>
                            </div>

                            {/* Section 2: Kategorisasi & Alur Kerja */}
                            <div className="border-t border-slate-100 pt-5">
                                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3.5">Kategorisasi & Alur Kerja</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Tipe Publikasi</label>
                                        <select
                                            name="type"
                                            value={form.type}
                                            onChange={handleInputChange}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 bg-white"
                                        >
                                            <option value="Journal">Journal</option>
                                            <option value="Conference">Conference</option>
                                            <option value="Book Chapter">Book Chapter</option>
                                            <option value="Proceeding">Proceeding</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Indeks (misal: Scopus Q1, Sinta 2)</label>
                                        <input
                                            type="text"
                                            name="index"
                                            value={form.index}
                                            onChange={handleInputChange}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                                            placeholder="Masukkan indeks publikasi..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Status Publikasi</label>
                                        <select
                                            name="status"
                                            value={form.status}
                                            onChange={handleInputChange}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800 bg-white"
                                        >
                                            <option value="Draft">Draft</option>
                                            <option value="Ready To Submit">Ready To Submit</option>
                                            <option value="Submitted">Submitted</option>
                                            <option value="Under Review">Under Review</option>
                                            <option value="Revision Requested">Revision Requested</option>
                                            <option value="Accepted">Accepted</option>
                                            <option value="Rejected">Rejected</option>
                                            <option value="Published">Published</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Penerbit & Tautan */}
                            <div className="border-t border-slate-100 pt-5">
                                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3.5">Detail Penerbit & Tautan</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Tahun Terbit</label>
                                        <input
                                            type="number"
                                            name="year"
                                            value={form.year}
                                            onChange={handleInputChange}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                                            placeholder="Contoh: 2026"
                                        />
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Nama Penerbit / Jurnal</label>
                                        <input
                                            type="text"
                                            name="publisher"
                                            value={form.publisher}
                                            onChange={handleInputChange}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                                            placeholder="Contoh: IEEE Transactions, Springer, Journal IGS"
                                        />
                                    </div>
                                    <div className="sm:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5">DOI (Digital Object Identifier)</label>
                                            <input
                                                type="text"
                                                name="doi"
                                                value={form.doi}
                                                onChange={handleInputChange}
                                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                                                placeholder="Contoh: 10.1109/ACCESS.2026.123456"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 mb-1.5">Tautan URL Asli</label>
                                            <input
                                                type="url"
                                                name="link"
                                                value={form.link}
                                                onChange={handleInputChange}
                                                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                                                placeholder="Contoh: https://journal.igsindonesia.org/..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Abstrak & Media */}
                            <div className="border-t border-slate-100 pt-5">
                                <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3.5">Abstrak & Media</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Abstrak Publikasi</label>
                                        <div className="mt-1 border border-slate-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                                            <QuillEditor
                                                value={form.abstract}
                                                onChange={(content) => setForm(prev => ({ ...prev, abstract: content }))}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 mb-1.5">Gambar Sampul (URL / ID Google Drive)</label>
                                        <input
                                            type="text"
                                            name="cover_image"
                                            value={form.cover_image}
                                            onChange={handleInputChange}
                                            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-800"
                                            placeholder="Masukkan URL Google Drive atau ID berkas gambar"
                                        />
                                        {form.cover_image && (
                                            <div className="mt-2 text-[10px] font-mono text-slate-400 bg-slate-50 p-2.5 rounded-lg break-all">
                                                {form.cover_image}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm bg-red-50 border border-red-100 p-4 rounded-xl">{error}</p>}

                            {/* Actions */}
                            <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold text-sm active:scale-95 transition-all"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:bg-blue-300 font-semibold text-sm shadow-lg shadow-blue-100 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    {uploading ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PublicationsPage;