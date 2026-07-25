"use client";

import { useCallback, useState, useEffect, use } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import QuillEditor from "@/components/QuillEditor";

const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key"
);

export default function MaterialsManagementPage(props) {
    const params = use(props.params);
    const teachingId = params.id;

    const [course, setCourse] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentMaterial, setCurrentMaterial] = useState(null);
    const [form, setForm] = useState({
        title: "",
        content: "",
        file_url: "",
        order: 0,
    });
    const [saving, setSaving] = useState(false);

    const fetchCourse = useCallback(async () => {
        const { data, error } = await supabase
            .from("teaching")
            .select("course_name")
            .eq("id", teachingId)
            .single();
        if (data) setCourse(data);
    }, [teachingId]);

    const fetchMaterials = useCallback(async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("course_materials")
            .select("*")
            .eq("teaching_id", teachingId)
            .order("order", { ascending: true });

        if (error) {
            setError(error.message);
        } else {
            setMaterials(data || []);
        }
        setLoading(false);
    }, [teachingId]);

    useEffect(() => {
        fetchCourse();
        fetchMaterials();
    }, [fetchCourse, fetchMaterials]);

    const handleOpenModal = (material = null) => {
        setCurrentMaterial(material);
        setForm(
            material
                ? { ...material }
                : { title: "", content: "", file_url: "", order: materials.length }
        );
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentMaterial(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        const materialData = {
            ...form,
            teaching_id: teachingId,
            order: parseInt(form.order, 10) || 0
        };

        let res;
        if (currentMaterial) {
            res = await supabase
                .from("course_materials")
                .update(materialData)
                .eq("id", currentMaterial.id);
        } else {
            res = await supabase.from("course_materials").insert(materialData);
        }

        if (res.error) {
            setError(res.error.message);
        } else {
            handleCloseModal();
            fetchMaterials();
        }
        setSaving(false);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Hapus materi ini?")) {
            const { error } = await supabase.from("course_materials").delete().eq("id", id);
            if (error) setError(error.message);
            else fetchMaterials();
        }
    };

    return (
        <div className="p-4 md:p-6">
            <div className="mb-6">
                <Link href="/manage/dashboard/teaching" className="text-blue-600 hover:underline mb-2 inline-block">
                    &larr; Kembali ke Daftar Pengajaran
                </Link>
                <div className="flex justify-between items-center mt-2">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Kelola Materi</h1>
                        <p className="text-gray-500">{course?.course_name}</p>
                    </div>
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Tambah Materi
                    </button>
                </div>
            </div>

            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg mb-4">{error}</p>}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Urutan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul Materi</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {materials.map((m) => (
                            <tr key={m.id}>
                                <td className="px-6 py-4 text-sm text-gray-500 w-20">{m.order}</td>
                                <td className="px-6 py-4 text-sm font-medium text-gray-900">{m.title}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleOpenModal(m)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                </td>
                            </tr>
                        ))}
                        {materials.length === 0 && !loading && (
                            <tr>
                                <td colSpan="3" className="px-6 py-12 text-center text-gray-500">Belum ada materi.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">{currentMaterial ? "Edit" : "Tambah"} Materi</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Judul Materi</label>
                                <input
                                    type="text"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Urutan (Angka)</label>
                                <input
                                    type="number"
                                    value={form.order}
                                    onChange={(e) => setForm({ ...form, order: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Isi Materi</label>
                                <QuillEditor
                                    value={form.content}
                                    onChange={(content) => setForm({ ...form, content })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Link File (Opsional)</label>
                                <input
                                    type="url"
                                    value={form.file_url}
                                    onChange={(e) => setForm({ ...form, file_url: e.target.value })}
                                    className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                                    placeholder="https://..."
                                />
                            </div>
                            <div className="flex justify-end gap-4 pt-4">
                                <button type="button" onClick={handleCloseModal} className="px-4 py-2 bg-gray-200 rounded-lg">Batal</button>
                                <button type="submit" disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:bg-blue-300">
                                    {saving ? "Menyimpan..." : "Simpan"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
