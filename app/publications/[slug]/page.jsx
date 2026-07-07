import { supabase } from "@/config/supabaseClient";
import { notFound } from 'next/navigation';
import Image from 'next/image';

const getGDriveDirectLink = (urlOrId) => {
    if (!urlOrId) return "/banner1.png";
    if (typeof urlOrId !== 'string') return "/banner1.png";
    
    // If it's already a direct link or local path
    if (urlOrId.includes("lh3.googleusercontent.com") || urlOrId.startsWith("/")) {
        return urlOrId;
    }

    // Extract ID from URL if possible
    const idMatch = urlOrId.match(/(?:id=|\/d\/|folders\/|file\/d\/)([a-zA-Z0-9-_]{25,})/);
    const id = idMatch ? idMatch[1] : urlOrId;

    // If it looks like a GDrive ID (approx 25-35 chars, no slashes or dots)
    if (id.length >= 25 && !id.includes("/") && !id.includes(".")) {
        return `https://lh3.googleusercontent.com/d/${id}`;
    }

    return urlOrId;
};

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
                <a href="/publications" className="mt-4 inline-block text-blue-600 hover:underline"> Kembali ke daftar publikasi</a>
            </div>
        );
    }

    // Fetch related publications
    const { data: relatedItems } = await supabase
        .from("publications")
        .select("title, slug, cover_image, type, year")
        .neq("id", data.id)
        .order("created_at", { ascending: false })
        .limit(3);

    // Calculate reading time
    const wordsPerMinute = 200;
    const contentText = (data.abstract || "").replace(/<[^>]*>/g, '');
    const wordCount = contentText.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    return (
        <div className="max-w-4xl mx-auto pt-32 px-4 pb-12 overflow-hidden break-words">
            <div className="mb-12">
                <a href="/publications" className="text-blue-600 hover:underline flex items-center gap-2 mb-8 group w-fit">
                    <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Kembali ke Daftar
                </a>
                
                <div className="relative w-full h-64 md:h-96 rounded-2xl mb-8 overflow-hidden shadow-xl">
                    <Image
                        src={getGDriveDirectLink(data.cover_image)}
                        alt={data.title}
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                    <span className="px-4 py-1 bg-blue-600 text-white rounded-full text-xs font-bold uppercase tracking-wide">
                        {data.type}
                    </span>
                    <span className="px-4 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-bold">
                        Tahun {data.year}
                    </span>
                    <span className="flex items-center text-gray-400 text-sm ml-auto">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {readingTime} min baca
                    </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-extrabold mb-8 text-gray-900 leading-tight">
                    {data.title}
                </h1>
            </div>
            
            <div className="blog-content w-full mb-16 border-t pt-8">
                <h2 className="text-xl font-bold mb-4 flex items-center text-blue-600 uppercase tracking-widest">
                    Abstrak
                </h2>
                <div 
                    dangerouslySetInnerHTML={{ __html: data.abstract || "<p class='text-gray-400 italic'>Konten abstrak tidak tersedia.</p>" }} 
                />
            </div>

            {/* Related Section */}
            {relatedItems && relatedItems.length > 0 && (
                <div className="border-t pt-12 mt-12">
                    <h2 className="text-2xl font-bold mb-8 text-gray-900 flex items-center">
                        <span className="w-1.5 h-8 bg-blue-600 mr-3 rounded-full"></span>
                        Publikasi Lainnya
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedItems.map((item) => (
                            <a 
                                key={item.slug} 
                                href={`/publications/${item.slug}`}
                                className="group block"
                            >
                                <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-all">
                                    <Image
                                        src={getGDriveDirectLink(item.cover_image)}
                                        alt={item.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded text-[10px] font-bold uppercase text-blue-600">
                                        {item.type}
                                    </div>
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                    {item.title}
                                </h3>
                                <p className="text-xs text-gray-400 mt-2">
                                    Tahun {item.year}
                                </p>
                            </a>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Page;
