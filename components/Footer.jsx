import Link from "next/link";

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    {/* Brand Column */}
                    <div className="col-span-1 md:col-span-2">
                        <Link href="/" className="text-2xl font-bold text-white mb-4 block">
                            Portofolio
                        </Link>
                        <p className="text-slate-400 mb-6 max-w-sm">
                            Membangun solusi digital yang inovatif untuk pendidikan dan teknologi masa depan.
                        </p>
                        <div className="flex gap-4">
                            {/* Social placeholders - replace with icons later if needed */}
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                                FB
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                                IG
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                                LI
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Tautan Cepat</h3>
                        <ul className="space-y-2">
                            <li><Link href="/about" className="hover:text-blue-400 transition-colors">Tentang Saya</Link></li>
                            <li><Link href="/project" className="hover:text-blue-400 transition-colors">Proyek</Link></li>
                            <li><Link href="/publications" className="hover:text-blue-400 transition-colors">Publikasi</Link></li>
                            <li><Link href="/blog" className="hover:text-blue-400 transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div id="contact">
                        <h3 className="text-white font-semibold mb-4">Hubungi Saya</h3>
                        <ul className="space-y-2 text-slate-400">
                            <li>Email: m.taufiq@example.com</li>
                            <li>Lokasi: Indonesia</li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} M. Taufiq, M.Kom. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;