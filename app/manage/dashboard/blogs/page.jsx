"use client";

import { useCallback, useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";
import QuillEditor from "@/components/QuillEditor";

const ITEMS_PER_PAGE = 10;

// This Supabase client is only for storage operations, which are public.
const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Fungsi untuk membuat slug dari judul
const slugify = (text) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Ganti spasi dengan -
        .replace(/[^\w\-]+/g, '')       // Hapus karakter non-word
        .replace(/\-\-+/g, '-')         // Ganti -- dengan -
        .replace(/^-+/, '')             // Hapus - dari awal
        .replace(/-+$/, '');            // Hapus - dari akhir
};

function BlogsPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentBlog, setCurrentBlog] = useState(null);
    const [form, setForm] = useState({
        title: "", slug: "", content: "", tags: "", cover_image: "", status: "draft",
    });
    const [uploading, setUploading] = useState(false);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const fetchBlogs = useCallback(async (currentPage) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/blogs?page=${currentPage}`);

            let data;
            const responseText = await response.text();

            try {
                data = JSON.parse(responseText);
            } catch (e) {
                console.error("Failed to parse blogs list JSON:", responseText);
                throw new Error("Invalid server response (not JSON)");
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch blogs');
            }

            setBlogs(data.blogs || []);
            setTotalCount(data.totalCount || 0);
            setError(null);
        } catch (err) {
            setError(err.message);
            setBlogs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBlogs(page);
    }, [page, fetchBlogs]);

    const handleOpenModal = (blog = null) => {
        setCurrentBlog(blog);
        setForm(blog ? { ...blog } : { title: "", slug: "", content: "", tags: "", cover_image: "", status: "draft" });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentBlog(null);
        setError(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const newForm = { ...form, [name]: value };
        if (name === "title" && !currentBlog) {
            newForm.slug = slugify(value);
        }
        setForm(newForm);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        setUploading(true);
        setError(null);

        const blogData = { ...form };

        try {
            const url = currentBlog ? `/api/blogs/${currentBlog.id}` : '/api/blogs';
            const method = currentBlog ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(blogData),
            });

            if (!response.ok) {
                let errorMessage = 'Failed to save blog post';
                const errorText = await response.text();

                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    console.error("Failed to parse error response JSON:", errorText);
                    errorMessage = `Server Error: ${response.status} ${response.statusText}`;
                    if (response.status === 413) {
                        errorMessage = "Error: Content is too large. Please use the image uploader instead of pasting.";
                    }
                }
                throw new Error(errorMessage);
            }

            handleCloseModal();
            fetchBlogs(page);
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (blogId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus tulisan ini?")) {
            try {
                const response = await fetch(`/api/blogs/${blogId}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Failed to delete blog post');
                }
                fetchBlogs(page);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="p-4 md:p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Manajemen Tulisan</h1>
                <button onClick={() => handleOpenModal()} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                    Tambah Tulisan
                </button>
            </div>

            {loading && <p>Memuat data...</p>}
            {error && <p className="text-red-500 bg-red-100 p-3 rounded-lg">{error}</p>}

            <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Judul</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {blogs.map((blog) => (
                            <tr key={blog.id}>
                                <td className="px-6 py-4 max-w-md">
                                    <div className="text-sm font-medium text-gray-900 break-words">{blog.title}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${blog.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {blog.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleOpenModal(blog)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button onClick={() => handleDelete(blog.id)} className="text-red-600 hover:text-red-900">Hapus</button>
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
                    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-6">{currentBlog ? "Edit" : "Tambah"} Tulisan</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Judul</label>
                                <input type="text" name="title" value={form.title} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Slug</label>
                                <input type="text" name="slug" value={form.slug} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-100" readOnly={!currentBlog} required />
                                <p className="text-xs text-gray-500 mt-1">Slug dibuat otomatis. Hanya bisa diubah saat mengedit.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Konten</label>
                                <div className="mt-1">
                                    <QuillEditor
                                        value={form.content}
                                        onChange={(content) => setForm(f => ({ ...f, content }))}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Tags (pisahkan dengan koma)</label>
                                <input type="text" name="tags" value={form.tags} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Status</label>
                                <select name="status" value={form.status} onChange={handleInputChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                                    <option value="draft">Draft</option>
                                    <option value="published">Published</option>
                                </select>
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

export default BlogsPage;
