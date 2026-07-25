import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
    return (
        <section className="relative pt-36 pb-24 overflow-hidden bg-tech-grid bg-tech-dots">
            {/* Ambient Background Blobs */}
            <div className="absolute top-1/4 right-0 w-96 h-96 bg-blue-400/10 dark:bg-blue-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-400/10 dark:bg-indigo-500/10 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute bottom-10 left-10 w-80 h-80 bg-purple-400/5 dark:bg-purple-500/5 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>

            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-12 gap-12 items-center relative z-10">
                {/* Left Column: Text & Stats */}
                <div className="lg:col-span-7 order-2 lg:order-1 text-left">
                    <span className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-6 border border-blue-100 dark:border-blue-800/30 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-slow"></span>
                        Academic & Tech Builder
                    </span>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight text-slate-900 dark:text-white">
                        Hello, I'm <br />
                        <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-600 dark:from-blue-400 dark:via-indigo-300 dark:to-blue-400 bg-clip-text text-transparent">
                            M. Taufiq, M.Kom
                        </span>
                    </h1>

                    <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed max-w-xl">
                        Dosen & Peneliti ilmu komputer yang mendedikasikan diri pada inovasi
                        <span className="text-blue-700 dark:text-blue-400 font-semibold"> Teknologi Informasi</span>,
                        serta praktisi software development yang membangun sistem digital masa depan.
                    </p>

                    <div className="flex flex-wrap gap-4 mb-12">
                        <Link
                            href="/publications"
                            className="px-8 py-3.5 bg-blue-700 hover:bg-blue-800 text-white rounded-full font-semibold shadow-lg shadow-blue-700/25 dark:shadow-blue-950/40 hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2"
                        >
                            Eksplor Riset
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                        <Link
                            href="https://orcid.org/0000-0003-3473-7847/print"
                            target="_blank"
                            className="px-8 py-3.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-semibold hover:border-blue-700 dark:hover:border-blue-400 hover:text-blue-700 dark:hover:text-blue-400 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm hover:-translate-y-0.5 transition-all duration-300"
                        >
                            Unduh CV
                        </Link>
                    </div>

                    {/* Stats Dashboard */}
                    <div className="grid grid-cols-3 gap-6 p-6 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-100 dark:border-slate-800/40 shadow-sm max-w-lg select-none">
                        <div>
                            <p className="text-3xl font-extrabold text-slate-900 dark:text-white bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">10+</p>
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-wider">Tahun Mengajar</p>
                        </div>
                        <div className="border-l border-slate-200/60 dark:border-slate-800/60 pl-6">
                            <p className="text-3xl font-extrabold text-slate-900 dark:text-white bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">50+</p>
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-wider">Publikasi Ilmiah</p>
                        </div>
                        <div className="border-l border-slate-200/60 dark:border-slate-800/60 pl-6">
                            <p className="text-3xl font-extrabold text-slate-900 dark:text-white bg-gradient-to-r from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300 bg-clip-text text-transparent">20+</p>
                            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-wider">Proyek Digital</p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Avatar with Floating Widgets */}
                <div className="lg:col-span-5 order-1 lg:order-2 flex justify-center lg:justify-end">
                    <div className="relative">
                        {/* Glowing Background Ring */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2.5rem] rotate-6 opacity-15 blur-xl"></div>

                        {/* Profile Wrapper */}
                        <div className="relative p-2.5 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800/50">
                            <Image
                                src="/profile.webp"
                                alt="Foto M. Taufiq, M.Kom"
                                width={400}
                                height={400}
                                className="w-72 h-72 md:w-96 md:h-96 rounded-[2rem] object-cover border border-slate-100 dark:border-slate-800/50"
                                priority
                                fetchPriority="high"
                            />
                        </div>

                        {/* Floating Badge 1: Engineer/Developer */}
                        <div className="absolute -top-6 -left-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-150 dark:border-slate-800 p-3 rounded-2xl shadow-xl animate-float select-none flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">Developer</div>
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">IT Practitioner</span>
                            </div>
                        </div>

                        {/* Floating Badge 2: Academic/Lecturer */}
                        <div className="absolute -bottom-6 -right-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-150 dark:border-slate-800 p-3 rounded-2xl shadow-xl animate-float animation-delay-2000 select-none flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">Lecturer</div>
                                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Computer Science</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;