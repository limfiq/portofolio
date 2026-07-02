import Link from "next/link";

const AboutSection = () => {
    return (
        <section className="py-24 bg-slate-50/50 dark:bg-slate-900/20 border-y border-slate-100 dark:border-slate-800/40 relative">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-tech-dots opacity-50 pointer-events-none"></div>

            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider text-xs uppercase mb-3 block">
                        Tentang Saya
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-slate-900 dark:text-white leading-tight">
                        Menghubungkan Dunia Akademis & Industri Teknologi
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
                        Saya adalah seorang akademisi dan praktisi teknologi informasi dengan pengalaman lebih dari satu dekade. 
                        Gairah saya terletak pada persimpangan antara <strong className="text-blue-700 dark:text-blue-400 font-bold">kecerdasan buatan (AI)</strong>, 
                        <strong className="text-blue-700 dark:text-blue-400 font-bold"> rekayasa perangkat lunak</strong>, dan <strong className="text-blue-700 dark:text-blue-400 font-bold">pendidikan digital</strong>.
                    </p>
                </div>

                {/* Pillars Grid */}
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12 mt-8">
                    {/* Academic Pillar */}
                    <div className="group bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 shadow-md hover:shadow-xl rounded-3xl p-8 lg:p-10 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full border-t-4 border-t-blue-600">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>

                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                            Akademisi & Pendidik
                        </h3>
                        
                        <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed mb-6">
                            Sebagai dosen, saya berfokus pada transfer keilmuan yang adaptif terhadap tren teknologi terkini, memandu penelitian mahasiswa, dan mempublikasikan karya ilmiah berkualitas.
                        </p>

                        <ul className="space-y-3.5 mb-8 text-sm text-slate-600 dark:text-slate-300 flex-grow">
                            <li className="flex items-start gap-2.5">
                                <span className="text-blue-500 mt-1 select-none">&#10003;</span>
                                <span><strong>Dosen Ilmu Komputer:</strong> Mengajar mata kuliah pemrograman, RPL, dan kecerdasan buatan berbasis kurikulum industri.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="text-blue-500 mt-1 select-none">&#10003;</span>
                                <span><strong>Peneliti Aktif:</strong> Mengeksplorasi integrasi machine learning dan sistem edukasi berbasis cloud.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="text-blue-500 mt-1 select-none">&#10003;</span>
                                <span><strong>Mentoring Mahasiswa:</strong> Membimbing kompetisi ilmiah dan proyek tugas akhir yang inovatif.</span>
                            </li>
                        </ul>

                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60">
                            <Link 
                                href="/lecturer"
                                className="inline-flex items-center gap-1.5 font-bold text-sm text-blue-600 dark:text-blue-400 group-hover:translate-x-1.5 transition-transform"
                            >
                                Eksplor Aktivitas Mengajar <span>&rarr;</span>
                            </Link>
                        </div>
                    </div>

                    {/* Developer Pillar */}
                    <div className="group bg-white dark:bg-slate-900/60 border border-slate-150 dark:border-slate-800/80 shadow-md hover:shadow-xl rounded-3xl p-8 lg:p-10 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full border-t-4 border-t-indigo-600">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                        </div>

                        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">
                            IT Architect & Builder
                        </h3>
                        
                        <p className="text-slate-600 dark:text-slate-350 text-sm leading-relaxed mb-6">
                            Sebagai praktisi perangkat lunak, saya mendesain, membangun, dan memelihara platform digital modern dengan standar industri yang andal, aman, dan berkinerja tinggi.
                        </p>

                        <ul className="space-y-3.5 mb-8 text-sm text-slate-600 dark:text-slate-300 flex-grow">
                            <li className="flex items-start gap-2.5">
                                <span className="text-indigo-500 mt-1 select-none">&#10003;</span>
                                <span><strong>Full-Stack Engineering:</strong> Merancang antarmuka UI/UX modern dan membangun logika backend tangguh.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="text-indigo-500 mt-1 select-none">&#10003;</span>
                                <span><strong>Cloud & System Architect:</strong> Implementasi layanan serverless, Docker containers, dan database relasional teroptimasi.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <span className="text-indigo-500 mt-1 select-none">&#10003;</span>
                                <span><strong>Clean Code Practitioner:</strong> Menjamin kualitas kode lewat pengujian modular dan dokumentasi teknis API terstruktur.</span>
                            </li>
                        </ul>

                        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/60">
                            <Link 
                                href="/project"
                                className="inline-flex items-center gap-1.5 font-bold text-sm text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1.5 transition-transform"
                            >
                                Eksplor Proyek Developer <span>&rarr;</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;