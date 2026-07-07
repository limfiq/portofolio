"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import Image from "next/image";
import QuillEditor from "@/components/QuillEditor";

const ITEMS_PER_PAGE = 10;

const getGDriveDirectLink = (urlOrId) => {
    if (!urlOrId) return "";
    const idMatch = urlOrId.match(/(?:id=|\/d\/|folders\/)([a-zA-Z0-9-_]{25,})/);
    const id = idMatch ? idMatch[1] : urlOrId;
    if (urlOrId.includes("lh3.googleusercontent.com") || (!urlOrId.includes("drive.google.com") && !urlOrId.includes("google.com/open"))) {
        return urlOrId;
    }
    return `https://lh3.googleusercontent.com/d/${id}`;
};

function ProjectsPage() {
    const supabase = useMemo(() => {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
    }, []);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    const [form, setForm] = useState({
        title: "",
        tech_stack: "",
        description: "",
        link: "",
        image: "",
    });
    const [uploading, setUploading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const fetchProjects = useCallback(async (currentPage) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("projects")
            .select("*")
            .order("created_at", { ascending: false })
            .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

        if (error) {
            setError(error.message);
            setProjects([]);
        } else {
            setProjects(data);
            setError(null);
        }
        setLoading(false);
    }, [supabase]);

    const fetchCount = useCallback(async () => {
        const { count, error } = await supabase
            .from("projects")
            .select("id", { count: "exact", head: true });
        if (error) {
            console.error("Error fetching count:", error);
        } else {
            setTotalCount(count);
        }
    }, [supabase]);

    useEffect(() => {
        fetchProjects(page);
        fetchCount();
    }, [page, fetchProjects, fetchCount]);

    const handleOpenModal = (project = null) => {
        setCurrentProject(project);
        setForm(
            project
                ? { ...project }
                : { title: "", tech_stack: "", description: "", link: "", image: "" }
        );
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentProject(null);
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

        const projectData = {
            ...form,
            image: getGDriveDirectLink(form.image),
            user_id: user.id
        };

        const { error: queryError } = currentProject
            ? await supabase.from("projects").update(projectData).eq("id", currentProject.id)
            : await supabase.from("projects").insert(projectData);

        if (queryError) {
            setError(queryError.message);
        } else {
            handleCloseModal();
            fetchProjects(page);
            fetchCount();
        }
        setUploading(false);
    };

    const handleDelete = async (projectId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus proyek ini?")) {
            const { error } = await supabase.from("projects").delete().eq("id", projectId);

            if (error) setError(error.message);
            else {
                fetchProjects(page);
                fetchCount();
            }
        }
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Proyek</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tambah Proyek
                </button>
            </div>

            {loading && <p>Memuat data...</p>}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teknologi</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {projects.map((project) => (
                            <tr key={project.id}>
                                <td className="px-6 py-4 max-w-sm">
                                    <div className="text-sm font-medium text-gray-900 break-words">{project.title}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">{project.tech_stack}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <div className="flex justify-end gap-2">
                                        <Link href={`/project/${project.slug}`} className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors text-xs font-bold">Detail</Link>
                                        <button onClick={() => handleOpenModal(project)} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg hover:bg-orange-600 transition-colors text-xs font-bold">Edit</button>
                                        <button onClick={() => handleDelete(project.id, project.image)} className="bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors text-xs font-bold">Hapus</button>
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
                        <h2 className="text-xl font-bold mb-6">{currentProject ? "Edit" : "Tambah"} Proyek</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Judul</label>
                                <input type="text" name="title" value={form.title} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Teknologi yang Digunakan (pisahkan dengan koma)</label>
                                <input type="text" name="tech_stack" value={form.tech_stack} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
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
                                <label className="block text-sm font-medium text-gray-700">Link Proyek (opsional)</label>
                                <input type="url" name="link" value={form.link} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Gambar (URL GDrive / ID)</label>
                                <input type="text" name="image" value={form.image} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border" placeholder="Masukkan URL atau ID Google Drive" />
                                {form.image && <div className="mt-2 text-[10px] text-gray-400 break-all">{form.image}</div>}
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

export default ProjectsPage;