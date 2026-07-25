"use client";

import { useCallback, useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import QuillEditor from "@/components/QuillEditor";

const ITEMS_PER_PAGE = 10;

// Create the Supabase client once at the module level.
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
);

export default function TeachingPage() {
    const [teachings, setTeachings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTeaching, setCurrentTeaching] = useState(null);
    const [form, setForm] = useState({
        course_name: "",
        semester: "",
        credits: "",
        description: "",
        syllabus_file: "",
    });
    const [uploading, setUploading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const fetchTeachings = useCallback(async (currentPage) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("teaching")
            .select("*")
            .order("created_at", { ascending: false })
            .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

        if (error) {
            setError(error.message);
            setTeachings([]);
        } else {
            setTeachings(data);
            setError(null);
        }
        setLoading(false);
    }, []);

    const fetchCount = useCallback(async () => {
        const { count, error } = await supabase
            .from("teaching")
            .select("id", { count: "exact", head: true });
        if (error) {
            console.error("Error fetching count:", error);
        } else {
            setTotalCount(count);
        }
    }, []);

    useEffect(() => {
        fetchTeachings(page);
        fetchCount();
    }, [page, fetchTeachings, fetchCount]);

    const handleOpenModal = (teaching = null) => {
        setCurrentTeaching(teaching);
        setForm(
            teaching
                ? { ...teaching }
                : { course_name: "", semester: "", credits: "", description: "", syllabus_file: "" }
        );
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentTeaching(null);
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Submitting teaching form:", form);
        setUploading(true);
        setError(null);

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("Anda harus login untuk menyimpan data.");
            setUploading(false);
            return;
        }

        const teachingData = {
            ...form,
            user_id: user.id,
            credits: form.credits ? parseInt(form.credits, 10) : 0,
        };

        console.log("Payload:", teachingData);

        let response;
        if (currentTeaching) {
            response = await supabase
                .from("teaching")
                .update(teachingData)
                .eq("id", currentTeaching.id);
        } else {
            response = await supabase.from("teaching").insert(teachingData);
        }

        console.log("Supabase Response:", response);

        if (response.error) {
            console.error("Supabase Error:", response.error);
            setError(response.error.message);
        } else {
            handleCloseModal();
            fetchTeachings(page);
            fetchCount();
        }

        setUploading(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus data pengajaran ini?")) {
            const { error } = await supabase.from("teaching").delete().eq("id", id);
            if (error) {
                setError(error.message);
            } else {
                fetchTeachings(page);
                fetchCount();
            }
        }
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Pengajaran</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah Pengajaran
                </button>
            </div>

            {loading && <p>Memuat data...</p>}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mata Kuliah</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Semester</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKS</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {teachings.map((item) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 max-w-sm">
                                    <div className="text-sm font-medium text-gray-900 break-words">{item.course_name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.semester}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.credits}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/teaching/${item.id}`} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold">Detail</Link>
                                        <Link href={`/manage/dashboard/teaching/${item.id}/materials`} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition-colors text-xs font-bold">Materi</Link>
                                        <button onClick={() => handleOpenModal(item)} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors text-xs font-bold">Edit</button>
                                        <button onClick={() => handleDelete(item.id)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-xs font-bold">Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0 || loading}
                    className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
                >
                    Sebelumnya
                </button>
                <span>Halaman {page + 1} dari {totalPages || 1}</span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1 || loading}
                    className="px-4 py-2 bg-gray-300 rounded-lg disabled:opacity-50"
                >
                    Selanjutnya
                </button>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">{currentTeaching ? "Edit" : "Tambah"} Pengajaran</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Mata Kuliah</label>
                                <input
                                    type="text"
                                    name="course_name"
                                    value={form.course_name}
                                    onChange={handleInputChange}
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Semester</label>
                                    <input
                                        type="text"
                                        name="semester"
                                        value={form.semester}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">SKS</label>
                                    <input
                                        type="number"
                                        name="credits"
                                        value={form.credits}
                                        onChange={handleInputChange}
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                                <div className="mt-1">
                                    <QuillEditor
                                        value={form.description}
                                        onChange={(content) => setForm(prev => ({ ...prev, description: content }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Link Silabus (URL)</label>
                                <input
                                    type="url"
                                    name="syllabus_file"
                                    value={form.syllabus_file}
                                    onChange={handleInputChange}
                                    placeholder="https://..."
                                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
                                />
                            </div>

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
