const AboutSection = () => {
    return (
        <section className="py-24 bg-white">
            <div className="max-w-4xl mx-auto px-6 text-center">
                <span className="text-blue-600 font-semibold tracking-wider text-sm uppercase mb-4 block">Tentang Saya</span>
                <h2 className="text-3xl md:text-4xl font-bold mb-8 text-slate-900">Dedikasi untuk Pendidikan & Teknologi</h2>
                <div className="prose prose-lg prose-slate mx-auto text-slate-600 leading-relaxed">
                    <p className="mb-6">
                        Saya adalah seorang akademisi dan praktisi di dunia teknologi informasi dengan pengalaman lebih dari satu dekade.
                        Gairah saya terletak pada persimpangan antara <strong className="text-blue-700 font-semibold">kecerdasan buatan</strong> dan <strong className="text-blue-700 font-semibold">pendidikan</strong>.
                    </p>
                    <p>
                        Saya selalu mencari cara-cara inovatif
                        untuk meningkatkan proses belajar-mengajar melalui teknologi. Saat ini, saya aktif meneliti dan mengembangkan
                        platform pembelajaran adaptif berbasis cloud yang bertujuan untuk personalisasi pendidikan bagi setiap individu.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;