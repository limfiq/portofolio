import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="container mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                {/* Illustration Section */}
                <div className="flex justify-center order-1 md:order-1">
                    {/* 
               Placeholder for the 404 illustration. 
               The user should place their image at /public/404-illustration.png 
               or update the src below.
            */}
                    <div className="relative w-full max-w-md aspect-square">
                        {/* Fallback visual if no image is present - or standard Next.js Image */}
                        <Image
                            src="/404.png"
                            alt="404 Illustration"
                            width={500}
                            height={500}
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Text Content */}
                <div className="text-center md:text-left order-2 md:order-2">
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                        Halaman Tidak Ditemukan.
                    </h1>
                    <p className="text-slate-500 text-lg mb-8">
                        Halaman yang anda cari tidak tersedia
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-transparent border-2 border-slate-900 text-slate-900 font-medium rounded-full hover:bg-slate-900 hover:text-white transition-all group"
                    >
                        Kembali ke Home
                        <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}
