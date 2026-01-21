import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
    return (
        <section className="relative pt-32 pb-20 overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
            <div className="absolute top-0 right-40 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>

            <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
                <div className="order-2 lg:order-1">
                    <span className="inline-block py-1 px-3 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6">
                        Academic & Researcher
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                        Hello, I'm <br />
                        <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            M. Taufiq, M.Kom
                        </span>
                    </h1>
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-lg">
                        Dosen & Peneliti yang berfokus pada inovasi
                        <span className="text-blue-700 font-medium"> Teknologi Informasi</span>,
                        Pengembangan Sistem, dan Pendidikan Digital masa depan.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            href="/publications"
                            className="px-8 py-3 bg-blue-700 text-white rounded-full font-medium shadow-lg shadow-blue-700/25 hover:bg-blue-800 hover:-translate-y-1 transition-all duration-300"
                        >
                            Lihat Publikasi
                        </Link>
                        <Link
                            href="https://orcid.org/0000-0003-3473-7847/print"
                            className="px-8 py-3 border border-slate-200 text-slate-700 rounded-full font-medium hover:border-blue-700 hover:text-blue-700 bg-white hover:-translate-y-1 transition-all duration-300"
                        >
                            Unduh CV
                        </Link>
                    </div>

                    <div className="mt-12 flex items-center gap-8 text-slate-500">
                        <div>
                            <p className="text-2xl font-bold text-slate-900">10+</p>
                            <p className="text-sm">Years Experience</p>
                        </div>
                        <div className="w-px h-10 bg-slate-200"></div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">50+</p>
                            <p className="text-sm">Publications</p>
                        </div>
                        <div className="w-px h-10 bg-slate-200"></div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">20+</p>
                            <p className="text-sm">Projects</p>
                        </div>
                    </div>
                </div>

                <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-[2rem] rotate-6 opacity-20 blur-lg"></div>
                        <Image
                            src="/profile.jpg"
                            alt="Foto M. Taufiq, M.Kom"
                            width={400}
                            height={400}
                            className="relative w-72 h-72 md:w-96 md:h-96 rounded-[2rem] object-cover shadow-2xl border-4 border-white"
                            priority
                        />
                        {/* Floating badges could go here */}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;