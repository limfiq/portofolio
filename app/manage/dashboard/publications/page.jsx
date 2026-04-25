"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";
import QuillEditor from "@/components/QuillEditor";

const ITEMS_PER_PAGE = 10;

// Create the Supabase client once at the module level.
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
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

        const publicationData = {
            ...form,
            slug: slugify(form.title),
            cover_image: getGDriveDirectLink(form.cover_image),
            user_id: 1, // Tetap gunakan 1 jika kolom DB adalah bigint
            year: parseInt(form.year, 10) || null,
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tahun</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipe</th>
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
                                    <div className={`text-xs font-mono px-2 py-1 rounded ${publication.slug ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                        {publication.slug || "MISSING"}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{publication.year}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{publication.type}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex justify-end gap-2">
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">{currentPublication ? "Edit" : "Tambah"} Publikasi</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Judul</label>
                                <input type="text" name="title" value={form.title} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tahun</label>
                                <input type="number" name="year" value={form.year} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tipe Publikasi</label>
                                <select name="type" value={form.type} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                    <option value="Journal">Journal</option>
                                    <option value="Conference">Conference</option>
                                    <option value="Book Chapter">Book Chapter</option>
                                    <option value="Proceeding">Proceeding</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Penerbit</label>
                                <input type="text" name="publisher" value={form.publisher} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">DOI (Digital Object Identifier)</label>
                                <input type="text" name="doi" value={form.doi} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Link</label>
                                <input type="url" name="link" value={form.link} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Abstrak</label>
                                <div className="mt-1">
                                    <QuillEditor
                                        value={form.abstract}
                                        onChange={(content) => setForm(prev => ({ ...prev, abstract: content }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Penulis (pisahkan dengan koma)</label>
                                <input type="text" name="authors" value={form.authors} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gambar Sampul (URL GDrive / ID)</label>
                                <input type="text" name="cover_image" value={form.cover_image} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Masukkan URL atau ID Google Drive" />
                                {form.cover_image && <div className="mt-2 text-[10px] text-gray-400 break-all">{form.cover_image}</div>}
                            </div>

                            {error && <p className="text-red-500 text-sm">{error}</p>}

                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Batal</button>
                                <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300">
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