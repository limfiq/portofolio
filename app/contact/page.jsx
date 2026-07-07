"use client";

import { useState } from "react";
import { supabase } from "@/config/supabaseClient";

export default function Contact() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Sanitization helper
    // Prevents XSS by escaping HTML special characters
    const sanitizeInput = (text) => {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            "/": '&#x2F;',
        };
        const reg = /[&<>"'/]/ig;
        return text.replace(reg, (match) => (map[match]));
    };

    const validate = (data) => {
        let tempErrors = {};

        // Name: Required, Max Length 100
        if (!data.name.trim()) tempErrors.name = "Nama wajib diisi.";
        else if (data.name.length > 100) tempErrors.name = "Nama terlalu panjang (maks 100 karakter).";
        else if (!/^[a-zA-Z\s]*$/.test(data.name)) tempErrors.name = "Nama hanya boleh berisi huruf dan spasi.";

        // Email: Required, Format check
        if (!data.email.trim()) tempErrors.email = "Email wajib diisi.";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) tempErrors.email = "Format email tidak valid.";
        else if (data.email.length > 100) tempErrors.email = "Email terlalu panjang.";

        // Subject: Required, Max Length
        if (!data.subject.trim()) tempErrors.subject = "Subjek wajib diisi.";
        else if (data.subject.length > 150) tempErrors.subject = "Subjek terlalu panjang (maks 150 karakter).";
        // Check for potential injection patterns (basic)
        else if (/['";]/.test(data.subject)) tempErrors.subject = "Karakter tidak diizinkan pada subjek.";

        // Message: Required, Max Length
        if (!data.message.trim()) tempErrors.message = "Pesan wajib diisi.";
        else if (data.message.length > 1000) tempErrors.message = "Pesan terlalu panjang (maks 1000 karakter).";

        setErrors(tempErrors);
        return Object.keys(tempErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (validate(formData)) {
            try {
                // Sanitize data before sending to backend or processing
                const safeData = {
                    name: sanitizeInput(formData.name),
                    email: sanitizeInput(formData.email),
                    subject: sanitizeInput(formData.subject),
                    message: sanitizeInput(formData.message)
                };

                const { error } = await supabase
                    .from('contacts')
                    .insert([safeData]);

                if (error) throw error;

                alert("Terima kasih! Pesan Anda telah terkirim dengan aman.");
                setFormData({ name: "", email: "", subject: "", message: "" });
            } catch (error) {
                console.error("Error submitting form:", error);
                alert("Terjadi kesalahan saat mengirim pesan. Silakan coba lagi.");
            }
        }

        setIsSubmitting(false);
    };

    return (
        <div className="pt-24 pb-16 bg-slate-50 min-h-screen">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-4xl font-bold text-center text-slate-900 mb-8">Hubungi Saya</h1>
                <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
                    Apakah Anda memiliki pertanyaan, tawaran kerjasama, atau sekadar ingin menyapa?
                    Jangan ragu untuk menghubungi saya melalui formulir di bawah ini.
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="md:col-span-1 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Email</h3>
                            <p className="text-slate-600">ufiq@limfiq.my.id</p>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">Lokasi</h3>

                            <p className="text-slate-600">Banyuwangi, Jawa Timur, Indonesia</p>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">Nama</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                    />
                                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                    />
                                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">Subjek</label>
                                <input
                                    type="text"
                                    id="subject"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${errors.subject ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                />
                                {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                            </div>

                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">Pesan</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="5"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={`w-full px-4 py-2 border rounded-lg outline-none transition-all ${errors.message ? 'border-red-500 focus:ring-red-200' : 'border-slate-300 focus:ring-blue-500 focus:border-blue-500'}`}
                                ></textarea>
                                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-3 px-6 text-white font-semibold rounded-lg shadow-md transition-all ${isSubmitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-500/30'}`}
                            >
                                {isSubmitting ? "Mengirim..." : "Kirim Pesan"}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
