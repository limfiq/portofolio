"use client";

import { useCallback } from "react";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import QuillEditor from "@/components/QuillEditor";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const ITEMS_PER_PAGE = 10;

export default function ActivityPage() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentActivity, setCurrentActivity] = useState(null);
    const [form, setForm] = useState({
        title: "",
        slug: "",
        location: "",
        year: "",
        description: "",
        link: "",
        cover_image: "",
        jenis_luaran: "",
        status: "",
    });
    const [uploading, setUploading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const router = useRouter();

    const fetchActivities = useCallback(async (currentPage) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("community_services")
            .select("*")
            .order("created_at", { ascending: false })
            .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

        if (error) {
            setError(error.message);
            setActivities([]);
        } else {
            setActivities(data);
            setError(null);
        }
        setLoading(false);
    }, []);

    const fetchCount = useCallback(async () => {
        const { count, error } = await supabase
            .from("community_services")
            .select("id", { count: "exact", head: true });
        if (error) {
            console.error("Error fetching count:", error);
        } else {
            setTotalCount(count);
        }
    }, []);

    useEffect(() => {
        fetchActivities(page);
        fetchCount();
    }, [page, fetchActivities, fetchCount]);

    const handleOpenModal = (activity = null) => {
        setCurrentActivity(activity);
        setForm(
            activity
                ? { ...activity, slug: activity.slug || slugify(activity.title) }
                : { title: "", slug: "", location: "", year: "", description: "", link: "", cover_image: "", jenis_luaran: "", status: "" }
        );
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentActivity(null);
        setError(null);
    };

    const slugify = (text) =>
        text
            .toString()
            .trim()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const getGDriveDirectLink = (urlOrId) => {
        if (!urlOrId) return "";
        const idMatch = urlOrId.match(/(?:id=|\/d\/|folders\/)([a-zA-Z0-9-_]{25,})/);
        const id = idMatch ? idMatch[1] : urlOrId;
        if (urlOrId.includes("lh3.googleusercontent.com") || (!urlOrId.includes("drive.google.com") && !urlOrId.includes("google.com/open"))) {
            return urlOrId;
        }
        return `https://lh3.googleusercontent.com/d/${id}`;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (name === "title" && !currentActivity) {
            // generate slug automatically when creating new
            setForm((prev) => ({ ...prev, slug: slugify(value) }));
        }
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

        const activityData = {
            ...form,
            cover_image: getGDriveDirectLink(form.cover_image),
            user_id: user.id,
            year: parseInt(form.year, 10),
            slug: form.slug || slugify(form.title),
        };

        let response;
        if (currentActivity) {
            response = await supabase
                .from("community_services")
                .update(activityData)
                .eq("id", currentActivity.id);
        } else {
            response = await supabase.from("community_services").insert(activityData);
        }

        if (response.error) {
            setError(response.error.message);
        } else {
            handleCloseModal();
            fetchActivities(page);
            fetchCount();
        }

        setUploading(false);
    };

    const handleDelete = async (activityId, imagePath) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus aktivitas ini?")) {

            // Hapus data dari tabel
            const { error } = await supabase
                .from("community_services")
                .delete()
                .eq("id", activityId);

            if (error) {
                setError(error.message);
            } else {
                fetchActivities(page);
                fetchCount();
            }
        }
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Aktivitas</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah Aktivitas
                </button>
            </div>

            {loading && <p>Memuat data...</p>}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Judul</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lokasi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {activities.map((activity) => (
                            <tr key={activity.id}>
                                <td className="px-6 py-4 max-w-sm">
                                    <div className="text-sm font-medium text-gray-900 break-words">{activity.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.location}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{activity.year}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {activity.status && (
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${activity.status.toLowerCase() === 'selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {activity.status}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/activity/${activity.slug}`} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold">Detail</Link>
                                        <button onClick={() => handleOpenModal(activity)} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors text-xs font-bold">Edit</button>
                                        <button onClick={() => handleDelete(activity.id, activity.cover_image)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-xs font-bold">Hapus</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
                <button
                    onClick={() => setPage(p => Math.max(0, p - 1))}
                    disabled={page === 0 || loading}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
                >
                    Sebelumnya
                </button>
                <span>Halaman {page + 1} dari {totalPages}</span>
                <button
                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1 || loading}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50"
                >
                    Selanjutnya
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">{currentActivity ? "Edit" : "Tambah"} Aktivitas</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Judul</label>
                                    <input type="text" name="title" value={form.title} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Slug</label>
                                    <input type="text" name="slug" value={form.slug} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="otomatis dari judul" />
                                    <p className="text-xs text-gray-500 mt-1">Biarkan kosong untuk dibuat otomatis berdasarkan judul.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Lokasi</label>
                                    <input type="text" name="location" value={form.location} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Tahun</label>
                                    <input type="number" name="year" value={form.year} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Jenis Luaran</label>
                                    <input type="text" name="jenis_luaran" value={form.jenis_luaran || ""} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" placeholder="Contoh: Laporan, Jurnal" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <select name="status" value={form.status || ""} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-white py-2 px-3">
                                        <option value="">Pilih Status</option>
                                        <option value="Selesai">Selesai</option>
                                        <option value="Berjalan">Berjalan</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                                    <div className="mt-1">
                                        <QuillEditor
                                            value={form.description}
                                            onChange={(content) => setForm(prev => ({ ...prev, description: content }))}
                                        />
                                    </div>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Link (opsional)</label>
                                    <input type="url" name="link" value={form.link} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Gambar Sampul (URL GDrive / ID)</label>
                                    <input type="text" name="cover_image" value={form.cover_image} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Masukkan URL atau ID Google Drive" />
                                    {form.cover_image && <div className="mt-2 text-[10px] text-gray-400 break-all">{form.cover_image}</div>}
                                </div>
                            </div>
                            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
                            <div className="flex justify-end gap-4 mt-8">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Batal</button>
                                <button type="submit" disabled={uploading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300">
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