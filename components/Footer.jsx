import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2">
                        <img src="/logo.png" alt="Logo" className="w-12 h-12 mb-4" />
                        <Link href="/" className="text-2xl font-bold text-white mb-4 block">
                            M. Taufiq, M.Kom
                        </Link>
                        <p className="text-slate-400 mb-6 max-w-sm">
                            Membangun solusi digital yang inovatif untuk pendidikan dan teknologi masa depan.
                        </p>
                        <div className="flex gap-4">
                            {/* Social Media Icons */}
                            <a href="https://www.facebook.com/mtaufiq39" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all" title="Facebook">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                            </a>
                            <a href="https://www.youtube.com/@limfiq" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-all" title="YouTube">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            </a>
                            <a href="https://www.linkedin.com/in/limfiq" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-700 hover:text-white transition-all" title="LinkedIn">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" /></svg>
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Tautan Cepat</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="hover:text-blue-400 transition-colors">Tentang Saya</Link></li>
                            <li><Link href="/penelitian" className="hover:text-blue-400 transition-colors">Penelitian</Link></li>
                            <li><Link href="/pengabdian" className="hover:text-blue-400 transition-colors">Pengabdian</Link></li>
                            <li><Link href="/publications" className="hover:text-blue-400 transition-colors">Publikasi</Link></li>
                            <li><Link href="/contact" className="hover:text-blue-400 transition-colors">Kontak</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div id="contact">
                        <h3 className="text-white font-semibold mb-4">Hubungi Saya</h3>
                        <ul className="space-y-2 text-slate-400">
                            <li>Email: ufiq@limfiq.my.id</li>
                            <li>Lokasi: Indonesia</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} limfiq. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;