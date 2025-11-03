import Image from "next/image";
import Link from "next/link";

const PostCard = ({ title, description, slug, imageUrl }) => (
    <div className="bg-gray-50 rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <Image src={imageUrl} alt={title} width={400} height={250} className="w-full h-48 object-cover" />
        <div className="p-6">
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{description}</p>
            <Link href={`/blog/${slug}`} className="font-semibold text-blue-600 hover:underline">
                Baca Selengkapnya &rarr;
            </Link>
        </div>
    </div>
);

const RecentLecturer = () => {
    const posts = [
        {
            title: "Masa Depan AI dalam Pendidikan Tinggi",
            description: "Menjelajahi bagaimana AI dapat merevolusi cara kita belajar dan mengajar di universitas.",
            slug: "post-1",
            imageUrl: "/placeholder.jpg",
        },
        {
            title: "Optimasi Arsitektur Cloud untuk Aplikasi Skala Besar",
            description: "Studi kasus tentang praktik terbaik dalam merancang infrastruktur cloud yang efisien dan andal.",
            slug: "post-2",
            imageUrl: "/placeholder.jpg",
        },
        {
            title: "Pengabdian Masyarakat: Workshop Coding untuk Siswa SMA",
            description: "Berbagi pengalaman dan kegembiraan dalam memperkenalkan dasar-dasar pemrograman kepada generasi muda.",
            slug: "post-3",
            imageUrl: "/placeholder.jpg",
        },
    ];

    return (
        <section className="bg-white py-16">
            <div className="max-w-6xl mx-auto px-6">
                <h2 className="text-3xl font-bold text-center mb-8">Tulisan Terbaru</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => <PostCard key={post.slug} {...post} />)}
                </div>
            </div>
        </section>
    );
};

export default RecentLecturer;