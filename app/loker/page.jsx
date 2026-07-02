"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";

const ITEMS_PER_PAGE = 9;

// Helper function to clean gender indicators from job titles
function cleanJobTitle(title) {
    if (!title) return "";
    
    let clean = title;
    
    // Pattern to match gender indicator suffixes like (m/w/d), (f/m/x), (all genders), (gn), (m/f/*)
    const patterns = [
        /\s*[\(\[-]\s*(m\/w\/d|f\/m\/d|m\/f\/d|w\/m\/d|m\/f\/x|w\/m\/x|m\/w\/x|f\/m\/x|m\/f\/o|gn|all genders|m\/w\/d\/x|m\/w\/x\/d|all|f\/m\/div)\s*[\)\]-]?/gi,
        /\s*[\(\[-]\s*[mwdfx](\/[mwdfx]){1,3}\s*[\)\]]/gi, // generic patterns like (m/f), (m/w/d/x)
        /\s*-\s*all genders\b/gi,
        /\s*\|\s*all genders\b/gi,
    ];
    
    patterns.forEach(pattern => {
        clean = clean.replace(pattern, "");
    });
    
    // Clean up trailing dashes, vertical bars, slashes, or whitespace that might be left over
    clean = clean.replace(/\s*[-|/]\s*$/g, "");
    clean = clean.trim();
    
    return clean;
}

export default function LokerPublicPage() {
    const supabase = useMemo(() => {
        return createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
    }, []);

    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);

    const [appliedJobs, setAppliedJobs] = useState({});
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [cvFile, setCvFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [applyMessage, setApplyMessage] = useState(null);

    // Auth check
    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            setUser(session?.user || null);
        };
        
        checkUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
        });

        return () => subscription.unsubscribe();
    }, [supabase]);

    // Fetch jobs
    const fetchJobs = useCallback(async (currentPage) => {
        setLoading(true);
        const { data, error } = await supabase
            .from("job_vacancies")
            .select("*")
            .order("created_at", { ascending: false })
            .range(currentPage * ITEMS_PER_PAGE, (currentPage + 1) * ITEMS_PER_PAGE - 1);

        if (!error && data) {
            setJobs(data);
        }
        setLoading(false);
    }, [supabase]);

    const fetchCount = useCallback(async () => {
        const { count, error } = await supabase
            .from("job_vacancies")
            .select("id", { count: "exact", head: true });
        if (!error) {
            setTotalCount(count);
        }
    }, [supabase]);

    // Fetch user's applications
    const fetchApplications = useCallback(async () => {
        if (!user) return;
        const { data, error } = await supabase
            .from("job_applications")
            .select("job_id, status")
            .eq("user_id", user.id);
            
        if (!error && data) {
            const appMap = {};
            data.forEach(app => {
                appMap[app.job_id] = app.status;
            });
            setAppliedJobs(appMap);
        }
    }, [supabase, user]);

    useEffect(() => {
        fetchJobs(page);
        fetchCount();
    }, [page, fetchJobs, fetchCount]);

    useEffect(() => {
        if (user) {
            fetchApplications();
        } else {
            setAppliedJobs({});
        }
    }, [user, fetchApplications]);

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/loker`
            }
        });
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    const openApplyModal = (job) => {
        setSelectedJob(job);
        setCvFile(null);
        setApplyMessage(null);
        setShowModal(true);
    };

    const handleApply = async (e) => {
        e.preventDefault();
        if (!cvFile || !selectedJob || !user) return;

        setUploading(true);
        setApplyMessage(null);

        try {
            // 1. Upload CV to Storage
            const fileExt = cvFile.name.split('.').pop();
            const fileName = `${user.id}_${selectedJob.id}_${Date.now()}.${fileExt}`;
            const filePath = `cvs/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('cv_uploads')
                .upload(filePath, cvFile);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('cv_uploads')
                .getPublicUrl(filePath);

            // 3. Insert Application Record
            const { error: insertError } = await supabase
                .from('job_applications')
                .insert({
                    job_id: selectedJob.id,
                    user_id: user.id,
                    user_email: user.email,
                    cv_url: publicUrl,
                    status: 'Terkirim'
                });

            if (insertError) throw insertError;

            setApplyMessage({ type: 'success', text: 'Lamaran berhasil dikirim!' });
            fetchApplications(); // Refresh application status
            setTimeout(() => setShowModal(false), 2000);

        } catch (error) {
            console.error('Error applying:', error);
            setApplyMessage({ type: 'error', text: error.message || 'Gagal mengirim lamaran.' });
        } finally {
            setUploading(false);
        }
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="bg-slate-50 min-h-screen pb-16">
            {/* Banner Section */}
            <div className="relative h-48 md:h-64 mb-12 overflow-hidden shadow-lg bg-indigo-900">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-indigo-600 opacity-90 z-10"></div>
                <div className="relative z-20 flex flex-col items-center justify-center h-full text-white px-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4">Informasi Lowongan Kerja</h1>
                    <p className="text-sm md:text-base text-blue-100 max-w-2xl text-center">
                        Temukan peluang karir terbaik dari dalam maupun luar negeri. 
                        Silakan login untuk mengirimkan CV Anda secara langsung.
                    </p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6">
                {/* Auth Bar */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                    <div className="text-sm text-slate-600">
                        {user ? (
                            <span>Masuk sebagai: <strong>{user.email}</strong></span>
                        ) : (
                            <span>Silakan login untuk dapat mengirim lamaran kerja.</span>
                        )}
                    </div>
                    <div>
                        {user ? (
                            <button onClick={handleLogout} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors">
                                Keluar
                            </button>
                        ) : (
                            <button onClick={handleGoogleLogin} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-bold rounded-lg transition-all shadow-sm">
                                <svg className="w-4 h-4" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Login dengan Google
                            </button>
                        )}
                    </div>
                </div>

                {/* Jobs Grid */}
                {loading && jobs.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">Memuat loker...</div>
                ) : jobs.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 bg-white rounded-3xl border border-slate-100">Belum ada loker yang tersedia.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map(job => (
                            <div key={job.id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col h-full relative">
                                {appliedJobs[job.id] && (
                                    <div className="absolute top-4 right-4 bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                        Lamaran: {appliedJobs[job.id]}
                                    </div>
                                )}
                                
                                <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2.5 py-1 rounded-md w-fit uppercase tracking-wider mb-3">
                                    {job.type || "Full-time"}
                                </span>
                                
                                <h3 className="text-lg font-bold text-slate-800 mb-1 leading-tight">{cleanJobTitle(job.title)}</h3>
                                <p className="text-sm text-slate-600 mb-2">{job.company} • {job.location}</p>
                                
                                <div className="text-[11px] text-slate-400 mb-4">
                                    Sumber: <span className="font-semibold text-indigo-500">{job.source}</span>
                                </div>
                                
                                <div className="mt-auto pt-4 border-t border-slate-50 flex gap-2">
                                    <button 
                                        onClick={() => openApplyModal(job)}
                                        className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors text-center shadow-md shadow-indigo-100"
                                    >
                                        Lihat Detail & Lamar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center mt-12 gap-4">
                        <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0 || loading} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold disabled:opacity-50">
                            &larr; Sebelumnya
                        </button>
                        <span className="text-sm text-slate-600 font-semibold">Hal {page + 1} dari {totalPages}</span>
                        <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1 || loading} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-bold disabled:opacity-50">
                            Selanjutnya &rarr;
                        </button>
                    </div>
                )}
            </div>

            {/* Detail & Application Modal */}
            {showModal && selectedJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                            <div>
                                <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 inline-block">
                                    {selectedJob.type || "Full-time"}
                                </span>
                                <h3 className="text-xl font-bold text-slate-800">{cleanJobTitle(selectedJob.title)}</h3>
                                <p className="text-sm text-slate-600 mt-1">
                                    <strong>{selectedJob.company}</strong> • {selectedJob.location}
                                </p>
                                <p className="text-xs text-slate-400 mt-1">
                                    Sumber: {selectedJob.source}
                                </p>
                            </div>
                            <button onClick={() => !uploading && setShowModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {/* Modal Body (Scrollable description) */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <h4 className="text-sm font-bold text-slate-700 mb-3">Deskripsi Pekerjaan:</h4>
                            {selectedJob.description ? (
                                <div 
                                    className="text-sm text-slate-700 leading-relaxed space-y-4 pr-2 break-words job-description-html"
                                    dangerouslySetInnerHTML={{ __html: selectedJob.description }}
                                />
                            ) : (
                                <p className="text-slate-400 italic text-sm">Tidak ada deskripsi detail untuk lowongan ini. Anda dapat melihat informasi lengkap di website sumber.</p>
                            )}
                        </div>

                        {/* Modal Footer / Apply Section */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50">
                            {applyMessage && (
                                <div className={`p-3 rounded-lg mb-4 text-xs font-semibold ${applyMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                                    {applyMessage.text}
                                </div>
                            )}

                            {appliedJobs[selectedJob.id] ? (
                                <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-semibold rounded-xl text-center mb-4">
                                    Anda telah mengirimkan lamaran untuk lowongan ini. Status: <strong className="uppercase">{appliedJobs[selectedJob.id]}</strong>
                                </div>
                            ) : user ? (
                                <form onSubmit={handleApply} className="mb-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Kirim Lamaran Langsung</h5>
                                    <div className="flex flex-col sm:flex-row gap-3 items-end">
                                        <div className="flex-1 w-full">
                                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Upload CV (PDF, Maks 2MB)</label>
                                            <input 
                                                type="file" 
                                                accept=".pdf" 
                                                onChange={(e) => setCvFile(e.target.files[0])}
                                                required
                                                className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer border border-slate-100 rounded-lg p-1"
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={!cvFile || uploading}
                                            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-50 shadow-md shadow-indigo-100 flex justify-center items-center h-9"
                                        >
                                            {uploading ? "Mengirim..." : "Kirim Lamaran"}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100 text-center mb-4">
                                    <p className="text-xs text-slate-600 mb-3">Silakan login dengan akun Google Anda untuk melamar lowongan ini.</p>
                                    <button 
                                        onClick={handleGoogleLogin} 
                                        className="mx-auto flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg transition-all shadow-sm"
                                    >
                                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        Login dengan Google
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row gap-3">
                                <a 
                                    href={selectedJob.link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors text-center flex items-center justify-center gap-2"
                                >
                                    Buka Website Sumber Asli &rarr;
                                </a>
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    disabled={uploading}
                                    className="py-2.5 px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors disabled:opacity-50"
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
