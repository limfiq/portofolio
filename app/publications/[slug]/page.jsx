import { supabase } from "@/config/supabaseClient";
import { notFound } from 'next/navigation';
import Image from 'next/image';


const Page = async (props) => {
    const { slug } = await props.params;
    
    const isNumeric = /^\d+$/.test(slug);
    
    let query = supabase.from("publications").select("*");
    
    if (isNumeric) {
        query = query.or(`slug.eq."${slug}",id.eq.${slug}`);
    } else {
        query = query.eq("slug", slug);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
        console.error('Error fetching publication:', error);
        return (
            <div className="max-w-4xl mx-auto pt-32 px-4 text-center">
                <h1 className="text-2xl font-bold text-red-500">Koneksi Database Bermasalah</h1>
                <p className="mt-2 text-gray-600">{error.message}</p>
                <a href="/publications" className="mt-4 inline-block text-blue-600 hover:underline"> Kembali ke daftar publikasi</a>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="max-w-4xl mx-auto pt-32 px-4 text-center">
                <h1 className="text-2xl font-bold text-orange-500">Publikasi Tidak Ditemukan</h1>
                <p className="mt-2 text-gray-600">Slug "{slug}" tidak cocok dengan data apapun di database.</p>
                <p className="mt-1 text-sm text-gray-400">Pastikan Anda sudah mengedit dan menyimpan ulang publikasi di dashboard untuk membuat slug.</p>
                <a href="/publications" className="mt-4 inline-block text-blue-600 hover:underline"> Kembali ke daftar publikasi</a>
            </div>
        );
    }

    const getGoogleDriveImageUrl = (imageIdentifier) => {
        if (!imageIdentifier) return "/banner1.png"; 
        if (imageIdentifier.startsWith('http')) return imageIdentifier;
        return `https://drive.google.com/uc?export=view&id=${imageIdentifier}`;
    };

    return (
        <div className="max-w-4xl mx-auto pt-32 px-4 pb-12">
            <div className="mb-8">
                <a href="/publications" className="text-blue-600 hover:underline flex items-center gap-2 mb-6">
                    &larr; Kembali ke Daftar
                </a>
                <div className="relative w-full h-96 rounded-2xl mb-8 overflow-hidden shadow-xl">
                    <Image
                        src={getGoogleDriveImageUrl(data.cover_image)}
                        alt={data.title}
                        fill
                        className="object-cover"
                    />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 leading-tight">{data.title}</h1>
                <div className="flex items-center text-gray-500 mb-8 bg-gray-50 p-4 rounded-lg">
                    <span className="font-medium px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{data.type}</span>
                    <span className="mx-3 text-gray-300">|</span>
                    <span className="font-medium text-gray-700">{data.year}</span>
                </div>
            </div>
            
            <div className="prose lg:prose-xl max-w-none prose-purple">
                <div 
                    className="publication-content"
                    dangerouslySetInnerHTML={{ __html: data.abstract || "<p className='text-gray-400 italic'>Konten abstrak kosong.</p>" }} 
                />
            </div>
        </div>
    );
};

export default Page;
