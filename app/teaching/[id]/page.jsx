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

    return (
        <div className="min-h-screen bg-gray-50 pt-24 pb-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Breadcrumbs */}
                <nav className="mb-8">
                    <Link href="/#pengajaran" className="text-blue-600 hover:underline flex items-center gap-2">
                        &larr; Kembali ke Daftar Pengajaran
                    </Link>
                </nav>

                {/* Course Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                            {course.semester}
                        </span>
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            {course.credits} SKS
                        </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                        {course.course_name}
                    </h1>
                    
                    <div className="prose prose-blue max-w-none text-gray-600">
                        <div dangerouslySetInnerHTML={{ __html: course.description }} />
                    </div>

                    {course.syllabus_file && (
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <a 
                                href={course.syllabus_file} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
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
                <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Materi Pembelajaran
                </h2>

                {materialsError || !materials || materials.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
                        <p className="text-gray-500">Belum ada materi pembelajaran yang diunggah untuk mata kuliah ini.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {materials.map((material, index) => (
                            <div key={material.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                <details className="group">
                                    <summary className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors list-none">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold text-sm">
                                                {index + 1}
                                            </span>
                                            <h3 className="text-lg font-semibold text-gray-800">{material.title}</h3>
                                        </div>
                                        <span className="transition-transform group-open:rotate-180">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="19 9l-7 7-7-7" />
                                            </svg>
                                        </span>
                                    </summary>
                                    <div className="p-6 pt-0 border-t border-gray-50">
                                        <div className="prose prose-blue max-w-none text-gray-600 mb-6">
                                            <div dangerouslySetInnerHTML={{ __html: material.content }} />
                                        </div>
                                        {material.file_url && (
                                            <a 
                                                href={material.file_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg transition-colors"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download Lampiran
                                            </a>
                                        )}
                                    </div>
                                </details>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
