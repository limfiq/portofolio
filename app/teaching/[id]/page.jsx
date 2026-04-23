import { supabase } from "@/config/supabaseClient";
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function TeachingDetailPage(props) {
    const { id } = await props.params;

    // Fetch course details
    const { data: course, error: courseError } = await supabase
        .from("teaching")
        .select("*")
        .eq("id", id)
        .maybeSingle();

    if (courseError || !course) {
        return notFound();
    }

    // Fetch materials
    const { data: materials, error: materialsError } = await supabase
        .from("course_materials")
        .select("*")
        .eq("teaching_id", id)
        .order("order", { ascending: true });

    // Fetch related courses
    const { data: relatedItems } = await supabase
        .from("teaching")
        .select("id, course_name, semester, credits")
        .neq("id", id)
        .limit(3);

    // Calculate reading time for description
    const wordsPerMinute = 200;
    const contentText = (course.description || "").replace(/<[^>]*>/g, '');
    const wordCount = contentText.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12 overflow-hidden break-words">
            <div className="max-w-4xl mx-auto px-4">
                {/* Breadcrumbs */}
                <nav className="mb-8">
                    <Link href="/#pengajaran" className="text-blue-600 hover:underline flex items-center gap-2 group w-fit">
                        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Kembali ke Daftar Pengajaran
                    </Link>
                </nav>

                {/* Course Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-12">
                    <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="px-4 py-1 bg-blue-600 text-white rounded-full text-xs font-bold uppercase">
                            {course.semester}
                        </span>
                        <span className="px-4 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold">
                            {course.credits} SKS
                        </span>
                        <span className="flex items-center text-gray-400 text-sm ml-auto">
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {readingTime} min baca
                        </span>
                    </div>
                    
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-8 leading-tight">
                        {course.course_name}
                    </h1>
                    
                    <div className="blog-content w-full border-t pt-8">
                        <div dangerouslySetInnerHTML={{ __html: course.description }} />
                    </div>

                    {course.syllabus_file && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <a 
                                href={course.syllabus_file} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                Unduh Silabus / RPS
                            </a>
                        </div>
                    )}
                </div>

                {/* Materials Section */}
                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                    <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
                    Materi Pembelajaran
                </h2>

                {materialsError || !materials || materials.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                        <p className="text-gray-500 font-medium">Belum ada materi pembelajaran yang diunggah untuk mata kuliah ini.</p>
                    </div>
                ) : (
                    <div className="space-y-6 mb-16">
                        {materials.map((material, index) => (
                            <div key={material.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                                <details className="group">
                                    <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                                        <div className="flex items-center gap-5">
                                            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 font-bold">
                                                {index + 1}
                                            </span>
                                            <h3 className="text-xl font-bold text-gray-800">{material.title}</h3>
                                        </div>
                                        <span className="transition-transform group-open:rotate-180 bg-gray-100 p-2 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </summary>
                                    <div className="p-8 pt-0 border-t border-gray-50">
                                        <div className="blog-content w-full mb-8 mt-6">
                                            <div dangerouslySetInnerHTML={{ __html: material.content }} />
                                        </div>
                                        {material.file_url && (
                                            <a 
                                                href={material.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-3 text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-5 py-3 rounded-xl transition-all"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download Lampiran Materi
                                            </a>
                                        )}
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                )}

                {/* Related Courses Section */}
                {relatedItems && relatedItems.length > 0 && (
                    <div className="border-t pt-12 mt-12">
                        <h2 className="text-2xl font-bold mb-8 text-gray-900 flex items-center">
                            <span className="w-1.5 h-8 bg-blue-600 mr-3 rounded-full"></span>
                            Mata Kuliah Lainnya
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {relatedItems.map((item) => (
                                <Link 
                                    key={item.id} 
                                    href={`/teaching/${item.id}`}
                                    className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                            {item.semester}
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400">
                                            {item.credits} SKS
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight">
                                        {item.course_name}
                                    </h3>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
