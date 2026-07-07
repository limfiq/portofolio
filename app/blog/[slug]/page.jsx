import { supabase } from "@/config/supabaseClient";
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { headers } from "next/headers";


const Page = async (props) => {
    const { slug } = await props.params;

    // Fetch current blog
    const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching blog post:', error);
        return (
            <div className="mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold text-red-500">Error</h1>
                <p>Could not fetch the blog post. Please try again later.</p>
            </div>
        );
    }

    if (!data) {
        notFound();
    }

    // Fetch related blogs (excluding current one)
    const { data: relatedBlogs } = await supabase
        .from("blogs")
        .select("title, slug, cover_image, created_at")
        .eq("status", "published")
        .neq("id", data.id)
        .order("created_at", { ascending: false })
        .limit(3);

    const getGoogleDriveImageUrl = (imageIdentifier) => {
        if (!imageIdentifier) return "/banner1.png";
        try {
            if (typeof imageIdentifier === "string" && imageIdentifier.startsWith("http")) {
                const parsed = new URL(imageIdentifier);
                const host = parsed.hostname;
                if (host.includes("drive.google.com")) {
                    const pathMatch = parsed.pathname.match(/\/file\/d\/([^\/]+)/);
                    const idFromPath = pathMatch ? pathMatch[1] : null;
                    const idFromQuery = parsed.searchParams.get("id");
                    const id = idFromPath || idFromQuery;
                    if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
                    return imageIdentifier;
                }
                return imageIdentifier;
            }
        } catch (e) {
            return "/banner1.png";
        }
        return `https://drive.google.com/uc?export=view&id=${imageIdentifier}`;
    };

    // Calculate reading time
    const wordsPerMinute = 200;
    const textContent = data.content.replace(/<[^>]*>/g, ''); // Remove HTML tags
    const wordCount = textContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    return (
        <div className="max-w-4xl mx-auto pt-24 px-4 pb-12 overflow-hidden break-words">
            <div className="relative w-full h-64 md:h-96 rounded-2xl mb-8 overflow-hidden shadow-lg">
                <Image
                    src={getGoogleDriveImageUrl(data.cover_image)}
                    alt={data.title}
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight tracking-tight text-gray-900">
                {data.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-gray-500 mb-10 text-sm md:text-base border-b pb-6">
                <span className="flex items-center bg-gray-100 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date(data.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <span className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {readingTime} menit baca
                </span>
                {data.tags && (
                    <div className="flex flex-wrap gap-2">
                        {data.tags.split(',').map((tag, index) => (
                            <span key={index} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-medium uppercase">
                                #{tag.trim()}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div
                className="blog-content w-full mb-16"
                dangerouslySetInnerHTML={{ __html: data.content }}
            />

            {/* Related Articles Section */}
            {relatedBlogs && relatedBlogs.length > 0 && (
                <div className="border-t pt-12 mt-12">
                    <h2 className="text-2xl font-bold mb-8 text-gray-900 flex items-center">
                        <span className="w-1.5 h-8 bg-blue-600 mr-3 rounded-full"></span>
                        Tulisan Terkait
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {relatedBlogs.map((post) => (
                            <a 
                                key={post.slug} 
                                href={`/blog/${post.slug}`}
                                className="group block"
                            >
                                <div className="relative aspect-video rounded-xl overflow-hidden mb-3 shadow-sm group-hover:shadow-md transition-shadow">
                                    <Image
                                        src={getGoogleDriveImageUrl(post.cover_image)}
                                        alt={post.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                    {post.title}
                                </h3>
                                <p className="text-xs text-gray-400 mt-2">
                                    {new Date(post.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
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