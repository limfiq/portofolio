import { supabase } from "@/config/supabaseClient";
import { notFound } from 'next/navigation';
import Image from 'next/image';


const Page = async (props) => {
    const { slug } = await props.params;
    const { data, error } = await supabase
        .from("community_services")
        .select("*")
        .eq("slug", slug)
        .single();

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching activity:', error);
        return (
            <div className="mx-auto px-4 py-8 text-center">
                <h1 className="text-2xl font-bold text-red-500">Error</h1>
                <p>Could not fetch the activity. Please try again later.</p>
            </div>
        );
    }

    if (!data) {
        notFound();
    }

    const getGoogleDriveImageUrl = (imageIdentifier) => {
        if (!imageIdentifier) return "/banner2.png"; // Fallback image
        if (imageIdentifier.startsWith('http')) return imageIdentifier;
        return `https://drive.google.com/uc?export=view&id=${imageIdentifier}`;
    };

    return (
        <div className="max-w-4xl mx-auto pt-24 px-4 pb-12">
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
                <span>{data.year}</span>
                <span className="mx-2">•</span>
                <span>{data.location}</span>
            </div>
            <div
                className="prose lg:prose-xl max-w-none"
                dangerouslySetInnerHTML={{ __html: data.description }}
            />
        </div>
    );
};

export default Page;