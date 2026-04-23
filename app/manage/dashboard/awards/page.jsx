"use client";

import { useCallback, useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import QuillEditor from "@/components/QuillEditor";

const ITEMS_PER_PAGE = 10;

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const AwardsPage = () => {
    const [awards, setAwards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAward, setCurrentAward] = useState(null);
    const [form, setForm] = useState({
        title: "",
        institution: "",
        year: "",
        description: "",
    });
    const [submitting, setSubmitting] = useState(false);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const fetchAwards = useCallback(async (currentPage) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("awards")
            .select("*")
            .order("year", { ascending: false })
            .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

        if (error) {
            setError(error.message);
            setAwards([]);
        } else {
            setAwards(data);
            setError(null);
        }
        setLoading(false);
    }, []);

    const fetchCount = useCallback(async () => {
        const { count, error } = await supabase
            .from("awards")
            .select("id", { count: "exact", head: true });
        if (error) {
            console.error("Error fetching count:", error);
        } else {
            setTotalCount(count);
        }
    }, []);

    useEffect(() => {
        fetchAwards(page);
        fetchCount();
    }, [page, fetchAwards, fetchCount]);

    const handleOpenModal = (award = null) => {
        setCurrentAward(award);
        const emptyForm = {
            title: "",
            institution: "",
            year: "",
            description: "",
        };

        if (award) {
            const sanitizedAward = Object.fromEntries(
                Object.entries(award).map(([key, value]) => [key, value === null ? "" : value])
            );
            setForm({ ...emptyForm, ...sanitizedAward });
        } else {
            setForm(emptyForm);
        }

        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentAward(null);
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        // Get current user for user_id
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("Anda harus login untuk menyimpan data.");
            setSubmitting(false);
            return;
        }

        const awardData = {
            ...form,
            user_id: user.id, // Use UUID from Supabase Auth
            year: parseInt(form.year, 10) || null,
        };

        const { error: queryError } = currentAward
            ? await supabase.from("awards").update(awardData).eq("id", currentAward.id)
            : await supabase.from("awards").insert(awardData);

        if (queryError) {
            console.error("Supabase Save Error:", queryError);
            setError(queryError.message);
        } else {
            handleCloseModal();
            fetchAwards(page);
            fetchCount();
        }
        setSubmitting(false);
    };

    const handleDelete = async (awardId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus penghargaan ini?")) {
            const { error } = await supabase.from("awards").delete().eq("id", awardId);
            if (error) setError(error.message);
            else {
                fetchAwards(page);
                fetchCount();
            }
        }
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Manajemen Penghargaan</h1>
                    <p className="text-gray-500 text-sm">Kelola daftar penghargaan dan prestasi Anda.</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()} 
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah Penghargaan
                </button>
            </div>

            {loading && (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
            
            {error && <p className="text-red-500 bg-red-100 p-4 rounded-xl mb-6">{error}</p>}

            {!loading && awards.length === 0 ? (
                <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-100">
                    <p className="text-gray-400">Belum ada data penghargaan.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Judul Penghargaan</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Institusi</th>
                                    <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">Tahun</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                {awards.map((award) => (
                                    <tr key={award.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-bold text-gray-900">{award.title}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{award.institution}</td>
                                        <td className="px-6 py-4 text-center text-sm text-gray-500 font-medium">{award.year}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button 
                                                onClick={() => handleOpenModal(award)} 
                                                className="text-blue-600 hover:text-blue-900 mr-4 font-bold"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(award.id)} 
                                                className="text-red-600 hover:text-red-900 font-bold"
                                            >
                                                Hapus
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-between items-center mt-8">
                        <button 
                            onClick={() => setPage(p => Math.max(0, p - 1))} 
                            disabled={page === 0 || loading} 
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-all font-medium"
                        >
                            Sebelumnya
                        </button>
                        <span className="text-sm text-gray-500 font-medium">
                            Halaman <span className="text-gray-900 font-bold">{page + 1}</span> dari <span className="text-gray-900 font-bold">{totalPages || 1}</span>
                        </span>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                            disabled={page >= totalPages - 1 || loading} 
                            className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl disabled:opacity-50 hover:bg-gray-50 transition-all font-medium"
                        >
                            Selanjutnya
                        </button>
                    </div>
                </>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-xl font-bold text-gray-900">{currentAward ? "Edit" : "Tambah"} Penghargaan</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Judul Penghargaan</label>
                                <input 
                                    type="text" 
                                    name="title" 
                                    value={form.title} 
                                    onChange={handleInputChange} 
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                                    placeholder="Contoh: Best Paper Award"
                                    required 
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Institusi Pemberi</label>
                                    <input 
                                        type="text" 
                                        name="institution" 
                                        value={form.institution} 
                                        onChange={handleInputChange} 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                                        placeholder="Contoh: LLDIKTI VII"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Tahun</label>
                                    <input 
                                        type="number" 
                                        name="year" 
                                        value={form.year} 
                                        onChange={handleInputChange} 
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" 
                                        placeholder="Contoh: 2024"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Keterangan / Deskripsi</label>
                                <div className="mt-1">
                                    <QuillEditor
                                        value={form.description}
                                        onChange={(content) => setForm(prev => ({ ...prev, description: content }))}
                                    />
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                            <div className="flex justify-end gap-4 pt-8">
                                <button 
                                    type="button" 
                                    onClick={handleCloseModal} 
                                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all font-bold"
                                >
                                    Batal
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={submitting} 
                                    className="px-6 py-3 bg-blue-600 text-white rounded-xl disabled:bg-blue-300 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all font-bold"
                                >
                                    {submitting ? "Menyimpan..." : "Simpan Data"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AwardsPage;
