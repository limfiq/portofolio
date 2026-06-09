-- ============================================================
-- Consolidated Seeder Script (Initial Default Data)
-- ============================================================

-- ============================================================
-- 1. STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-images', 'portfolio-images', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. USER PROFILE (Single User Portfolio)
-- PENTING:
-- UUID dummy di bawah ini digunakan agar seluruh relasi data awal terhubung.
-- Disarankan untuk mengganti UUID '00000000-0000-0000-0000-000000000000'
-- dengan UUID real milik user admin Anda dari tabel `auth.users` Supabase.
-- ============================================================

-- Catatan: Agar foreign key constraint pada public.users tidak melanggar 
-- referensi ke auth.users, kita perlu membuat dummy user di auth.users terlebih dahulu,
-- ATAU pastikan tabel auth.users sudah memiliki user bersangkutan sebelum menjalankan seeder ini.
-- Jika dijalankan di database kosong, buat entry dummy di auth.users (Supabase otomatis menangani password):
INSERT INTO auth.users (id, email, raw_app_meta_data, raw_user_meta_data, is_super_admin, role)
VALUES (
    '00000000-0000-0000-0000-000000000000', 
    'mtaufiq39@gmail.com', 
    '{"provider":"email","providers":["email"]}', 
    '{"name":"M. Taufiq, M.Kom"}', 
    false, 
    'authenticated'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.users (
    id,
    name,
    email,
    password,
    photo,
    title,
    institution,
    biography,
    social_links
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'M. Taufiq, M.Kom',
    'mtaufiq39@gmail.com',
    md5('password123'),
    '/profile.jpg',
    'Asisten Ahli',
    'Sekolah Tinggi Ilmu Komputer Banyuwangi',
    'Dosen dan peneliti di bidang pengembangan perangkat lunak, kecerdasan buatan, dan sistem informasi. Aktif melakukan penelitian dan pengabdian masyarakat berbasis digitalisasi pendidikan.',
    jsonb_build_object(
        'google_scholar', 'https://scholar.google.com/citations?user=IuAv028AAAAJ&hl=id',
        'orcid', 'https://orcid.org/0000-0003-3473-7847',
        'sinta', 'https://sinta.kemdiktisaintek.go.id/authors/profile/6000762',
        'linkedin', 'https://linkedin.com/in/limfiq',
        'github', 'https://github.com/limfiq'
    )
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 3. EDUCATIONS
-- ============================================================
INSERT INTO public.educations (
    user_id,
    degree,
    major,
    institution,
    start_year,
    end_year,
    thesis_title
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'S1',
    'Teknik Informatika',
    'Sekolah Tinggi Ilmu Komputer PGRI Banyuwangi',
    2009,
    2012,
    'Sistem Informasi data siswa dengan Java dan MySQL'
),
(
    '00000000-0000-0000-0000-000000000000',
    'S2',
    'Teknologi Informasi',
    'Universitas Dian Nuswantoro',
    2014,
    2016,
    'Implementasi Neural Network untuk Klasifikasi Data Pendidikan'
),
(
    '00000000-0000-0000-0000-000000000000',
    'S3',
    'Ilmu Komputer',
    'Universitas Gadjah Mada',
    2017,
    2021,
    'Optimasi Deep Learning untuk Deteksi Citra Pertanian'
);

-- ============================================================
-- 4. TEACHING
-- ============================================================
INSERT INTO public.teaching (
    user_id,
    course_name,
    semester,
    credits,
    description,
    syllabus_file
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Pengembangan Backend',
    'Ganjil 2024/2025',
    3,
    'Mata kuliah ini membahas dasar hingga lanjut pengembangan backend menggunakan Express.js dan MySQL.',
    'https://example.com/files/syllabus-backend.pdf'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Software Quality Assurance',
    'Genap 2024/2025',
    4,
    'Mata kuliah ini mempelajari penerapan standar kualitas perangkat lunak (ISO/IEC 25010) dan praktik pengujian perangkat lunak.',
    'https://example.com/files/syllabus-sqa.pdf'
);

-- ============================================================
-- 5. PUBLICATIONS
-- ============================================================
INSERT INTO public.publications (
    user_id,
    title,
    year,
    type,
    publisher,
    doi,
    link,
    abstract,
    authors,
    cover_image
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Machine Learning-based Model for Predicting Student Performance',
    2023,
    'Journal',
    'International Journal of Computer Science',
    '10.1234/ijcs.2023.001',
    'https://journal.org/article/1234',
    'This study develops an ML model to predict academic performance using behavioral data.',
    'Limfiq, R. A., Suryono, T.',
    '/placeholder-cover.jpg'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Digital Transformation of Mosque Management System',
    2022,
    'Conference',
    'ICITEE Conference',
    '10.5678/icitee.2022.008',
    'https://conference.org/paper/5678',
    'A digitalization model for mosque management using cloud-based information systems.',
    'Limfiq, M., Hidayat, A.',
    '/placeholder-cover.jpg'
);

-- ============================================================
-- 6. RESEARCH PROJECTS
-- ============================================================
INSERT INTO public.research_projects (
    user_id,
    title,
    year_start,
    year_end,
    funding_source,
    role,
    abstract,
    link,
    cover_image
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Penerapan Kecerdasan Buatan untuk Identifikasi Tanaman Sakit',
    2023,
    2025,
    'DRPM Kemendikbud',
    'Ketua',
    'Penelitian ini mengembangkan model computer vision berbasis CNN untuk mendeteksi penyakit tanaman padi.',
    'https://example.com/research/ai-pertanian',
    '/placeholder-cover.jpg'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Digitalisasi Sistem Presensi Siswa dan Guru di Madrasah',
    2024,
    2024,
    'Internal',
    'Ketua',
    'Membangun aplikasi presensi digital berbasis QR code menggunakan AppSheet dan Supabase.',
    'https://example.com/research/presensi-digital',
    '/placeholder-cover.jpg'
);

-- ============================================================
-- 7. COMMUNITY SERVICES (Activities)
-- ============================================================
INSERT INTO public.community_services (
    user_id,
    title,
    location,
    year,
    description,
    link,
    cover_image,
    slug
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Pelatihan Pengelolaan Data Digital untuk Takmir Masjid',
    'Desa Tukangkayu, Banyuwangi',
    2024,
    'Kegiatan pengabdian untuk meningkatkan kemampuan pengurus masjid dalam manajemen data digital dan administrasi.',
    'https://example.com/community/masjid-digital',
    '/placeholder-cover.jpg',
    'pelatihan-pengelolaan-data-digital-untuk-takmir-masjid'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Workshop Literasi Digital bagi Guru MI',
    'MI Darul Ulum Grogol',
    2025,
    'Pengabdian dalam bentuk pelatihan digitalisasi absensi guru dan siswa menggunakan aplikasi AppSheet.',
    'https://example.com/community/mi-digital',
    '/placeholder-cover.jpg',
    'workshop-literasi-digital-bagi-guru-mi'
);

-- ============================================================
-- 8. AWARDS
-- ============================================================
INSERT INTO public.awards (
    user_id,
    title,
    institution,
    year,
    description
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Best Paper Award',
    'ICITEE Conference',
    2023,
    'Penghargaan atas kontribusi penelitian bidang sistem informasi pendidikan.'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Dosen Berprestasi 1',
    'Sekolah Tinggi Ilmu Komputer Banyuwangi',
    2024,
    'Penghargaan atas inovasi dan publikasi penelitian.'
);

-- ============================================================
-- 9. PROJECTS
-- ============================================================
INSERT INTO public.projects (
    user_id,
    title,
    tech_stack,
    description,
    link,
    image
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Sistem Presensi Digital MI Darul Ulum',
    'AppSheet, Supabase, Canva',
    'Aplikasi digitalisasi presensi siswa dan guru berbasis QR Code.',
    'https://example.com/projects/presensi',
    'https://example.com/images/project-presensi.png'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Website Portofolio Dosen & Peneliti',
    'Next.js, Supabase, TailwindCSS',
    'Platform personal branding dosen untuk publikasi kegiatan akademik dan penelitian.',
    'https://example.com/projects/portfolio',
    'https://example.com/images/project-portfolio.png'
);

-- ============================================================
-- 10. GALLERY
-- ============================================================
INSERT INTO public.gallery (
    user_id,
    category,
    title,
    media_url,
    description
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Teaching',
    'Praktikum Express.js Mahasiswa TI',
    'https://example.com/gallery/express-class.jpg',
    'Kegiatan pembelajaran backend development menggunakan Node.js dan Express.'
),
(
    '00000000-0000-0000-0000-000000000000',
    'Community Service',
    'Digitalisasi Manajemen Masjid',
    'https://example.com/gallery/masjid-digital.jpg',
    'Kegiatan pengabdian untuk mendigitalisasi administrasi masjid di Banyuwangi.'
);

-- ============================================================
-- 11. BLOGS
-- ============================================================
INSERT INTO public.blogs (
    user_id,
    title,
    slug,
    content,
    tags,
    cover_image,
    status,
    views
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    'Mengapa Dosen Harus Punya Portofolio Digital?',
    'mengapa-dosen-harus-punya-portofolio-digital',
    'Di era akademik modern, portofolio digital bukan hanya tempat pamer karya, tetapi juga bentuk transparansi dan branding profesional dosen. Dalam tulisan ini, saya berbagi pengalaman membangun website portofolio menggunakan Next.js dan Supabase...',
    'Pendidikan, Teknologi, Dosen',
    'https://example.com/images/blog-portfolio.jpg',
    'published',
    102
),
(
    '00000000-0000-0000-0000-000000000000',
    'Membangun Budaya Penelitian di Kampus Swasta',
    'membangun-budaya-penelitian-di-kampus-swasta',
    'Meningkatkan budaya penelitian di kampus swasta membutuhkan sinergi antara pimpinan, dosen, dan mahasiswa. Artikel ini membahas strategi praktis berbasis pengalaman di lapangan...',
    'Penelitian, Pendidikan, Akademik',
    'https://example.com/images/blog-research.jpg',
    'published',
    87
);

-- ============================================================
-- 12. BLOG COMMENTS
-- ============================================================
INSERT INTO public.blog_comments (blog_id, name, email, comment)
VALUES (
    (SELECT id FROM public.blogs WHERE slug = 'mengapa-dosen-harus-punya-portofolio-digital' LIMIT 1),
    'Andi Saputra',
    'andi@gmail.com',
    'Tulisan yang sangat menginspirasi Pak, saya tertarik membuat portofolio serupa.'
),
(
    (SELECT id FROM public.blogs WHERE slug = 'membangun-budaya-penelitian-di-kampus-swasta' LIMIT 1),
    'Rina Kusuma',
    'rina@stikom.edu',
    'Terima kasih atas pandangannya, Pak. Sangat relevan untuk kampus kami.'
);

-- ============================================================
-- 13. PAGE VIEWS
-- ============================================================
INSERT INTO public.page_views (page_name, view_count)
VALUES 
    ('Home', 120),
    ('Publikasi', 45),
    ('Proyek', 65),
    ('Blog', 88),
    ('Aktivitas', 32)
ON CONFLICT (page_name) DO NOTHING;
