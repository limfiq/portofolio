import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 py-16 border-t border-slate-200/10 dark:border-slate-800/60 mt-20 md:mt-32 w-full select-none">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="md:col-span-6 flex flex-col justify-between">
                        <div>
                            <Link href="/" className="text-2xl font-extrabold text-white tracking-tight hover:opacity-90 transition-opacity mb-4 block">
                                M. Taufiq, M.Kom
                            </Link>
                            <p className="text-slate-300 text-sm leading-relaxed max-w-sm mb-6">
                                Dosen, peneliti, dan praktisi IT yang berfokus pada rekayasa perangkat lunak, kecerdasan buatan, dan digitalisasi pendidikan.
                            </p>
                        </div>
                        
                        {/* Social Media Row */}
                        <div className="flex gap-3 mt-2">
                            <a 
                                href="https://www.facebook.com/mtaufiq39" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-900 hover:bg-blue-600 dark:hover:bg-blue-600 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
                                title="Facebook"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                            <a 
                                href="https://www.youtube.com/@limfiq" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-900 hover:bg-red-650 dark:hover:bg-red-600 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
                                title="YouTube"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                                </svg>
                            </a>
                            <a 
                                href="https://www.linkedin.com/in/limfiq" 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-900 hover:bg-blue-700 dark:hover:bg-blue-700 text-slate-300 hover:text-white flex items-center justify-center transition-all hover:-translate-y-0.5"
                                title="LinkedIn"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links Column */}
                    <div className="md:col-span-2">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Navigasi</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link href="/about" className="text-slate-300 hover:text-blue-400 hover:underline transition-colors">Tentang Saya</Link></li>
                            <li><Link href="/publications" className="text-slate-300 hover:text-blue-400 hover:underline transition-colors">Publikasi Ilmiah</Link></li>
                            <li><Link href="/penelitian-pengabdian" className="text-slate-300 hover:text-blue-400 hover:underline transition-colors">Penelitian & Pengabdian</Link></li>
                            <li><Link href="/awards" className="text-slate-300 hover:text-blue-400 hover:underline transition-colors">Penghargaan</Link></li>
                            <li><Link href="/gallery" className="text-slate-300 hover:text-blue-400 hover:underline transition-colors">Galeri Foto</Link></li>
                            <li><Link href="/lecturer" className="text-slate-300 hover:text-blue-400 hover:underline transition-colors">Aktivitas Mengajar</Link></li>
                            <li><Link href="/loker" className="text-slate-300 hover:text-blue-400 hover:underline transition-colors">Loker IT</Link></li>
                            <li><Link href="/contact" className="text-slate-300 hover:text-blue-400 hover:underline transition-colors">Kontak</Link></li>
                        </ul>
                    </div>

                    {/* Web Apps Column */}
                    <div className="md:col-span-2">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Aplikasi Web</h3>
                        <ul className="space-y-3 text-sm">
                            <li>
                                <a 
                                    href="https://pos.limfiq.my.id" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-slate-300 hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                                >
                                    <span>🛒 POS Kasir</span>
                                    <span className="text-[10px] opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://posyandu.limfiq.my.id" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-slate-300 hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                                >
                                    <span>👶 Posyandu</span>
                                    <span className="text-[10px] opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://sdidarulfaizin.my.id" 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="text-slate-300 hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                                >
                                    <span>🏛️ SDIT Darul Faizin</span>
                                    <span className="text-[10px] opacity-60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info Column */}
                    <div className="md:col-span-3">
                        <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4">Hubungi</h3>
                        <ul className="space-y-3 text-sm text-slate-300">
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                <a href="mailto:ufiq@limfiq.my.id" className="hover:text-blue-400 transition-colors">
                                    ufiq@limfiq.my.id
                                </a>
                            </li>
                            <li className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span>Banyuwangi, Indonesia</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-400">
                    <p>&copy; {new Date().getFullYear()} M. Taufiq, M.Kom. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;