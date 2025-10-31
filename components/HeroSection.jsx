import Image from "next/image";
import Link from "next/link";

const HeroSection = () => {
    return (
        <section className="bg-gradient-to-r from-blue-800 to-blue-500 text-white py-20">
            <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-10 items-center">
                <div className="flex justify-center md:justify-start">
                    <Image
                        src="/profile.jpg"
                        alt="Foto Dosen"
                        width={192}
                        height={192}
                        className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-lg"
                        priority
                    />
                </div>
                <div>
                    <h1 className="text-3xl md:text-4xl font-semibold mb-3">
                        M. Taufiq, M.Kom
                    </h1>
                    <p className="text-lg mb-4">
                        Dosen & Peneliti di bidang Teknologi Informasi. Fokus riset pada AI, Cloud Computing,
                        dan Inovasi Pendidikan Digital.
                    </p>
                    <div className="flex gap-4 mt-6">
                        <Link href="/publications" className="px-5 py-2 bg-white text-blue-700 rounded-md font-semibold hover:bg-gray-100 transition-colors">
                            Lihat Publikasi
                        </Link>
                        <Link href="https://orcid.org/0000-0003-3473-7847/print" className="px-5 py-2 border border-white rounded-md font-semibold hover:bg-white hover:text-blue-700 transition-colors">
                            Unduh CV
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default HeroSection;