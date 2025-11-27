import { supabase } from "@/config/supabaseClient";
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { headers } from "next/headers";


const Page = async (props) => {
    const { slug } = await props.params;
    const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "exact one row not found"
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

    const getGoogleDriveImageUrl = (imageIdentifier) => {
        if (!imageIdentifier) return "/banner1.png"; // Fallback image

        // Jika sudah berupa URL, coba parse dan normalisasi ke bentuk uc?export=view&id=ID untuk Drive
        try {
            if (typeof imageIdentifier === "string" && imageIdentifier.startsWith("http")) {
                const parsed = new URL(imageIdentifier);
                const host = parsed.hostname;

                if (host.includes("drive.google.com")) {
                    // pattern: /file/d/<id>/...
                    const pathMatch = parsed.pathname.match(/\/file\/d\/([^\/]+)/);
                    const idFromPath = pathMatch ? pathMatch[1] : null;
                    // pattern: ?id=<id>
                    const idFromQuery = parsed.searchParams.get("id");
                    const id = idFromPath || idFromQuery;

                    if (id) return `https://drive.google.com/uc?export=view&id=${id}`;
                    // jika sudah mengarah ke uc atau driveusercontent, kembalikan apa adanya
                    return imageIdentifier;
                }
                // bukan drive => kembalikan apa adanya
                return imageIdentifier;
            }
        } catch (e) {
            console.error("Invalid image URL:", imageIdentifier, e);
            return "/banner1.png";
        }

        // jika hanya ID diberikan
        return `https://drive.google.com/uc?export=view&id=${imageIdentifier}`;
    };

    return (

        <div>
            <Header />
            <div className="max-w-4xl mx-auto mt-8">
                <div className="relative w-full h-96 rounded-lg mb-8 overflow-hidden">
                    <Image
                        src={getGoogleDriveImageUrl(data.cover_image)}
                        alt={data.title}
                        fill
                        className="object-cover"
                    />
                </div>
                <h1 className="text-4xl font-bold mb-4">{data.title}</h1>
                <div className="flex items-center text-gray-500 mb-8">
                    <span>{new Date(data.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    {data.tags && <span className="mx-2">•</span>}
                    {data.tags && <span>{data.tags}</span>}
                </div>
                <div
                    className="prose lg:prose-xl max-w-none"
                    dangerouslySetInnerHTML={{ __html: data.content }}
                />
            </div>
            <Footer />
        </div>
    );
};

export default Page;