import { NextResponse } from "next/server";

export async function POST(request) {
    try {
        const { messages } = await request.json();
        
        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Invalid request payload. 'messages' array is required." }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn("GEMINI_API_KEY is not defined in environment variables. Returning standard warning message.");
            return NextResponse.json({ 
                response: "Maaf, layanan Chatbot AI saat ini belum aktif karena GEMINI_API_KEY belum dikonfigurasi di environment variables server (.env.local)." 
            });
        }

        const systemInstruction = `
You are an AI assistant representing M. Taufiq, M.Kom, a professional IT developer, database architect, and computer science lecturer. Answer questions about his portfolio, projects, publications, teaching courses, research in AI and cloud systems, and professional background. Keep your tone professional, friendly, and helpful. Translate to Indonesian when asked or default to Indonesian.

### BIOGRAPHY & CORE INFORMATION
- Name: M. Taufiq, M.Kom
- Nickname: Pak Taufiq / Limfiq
- Current Institution: Sekolah Tinggi Ilmu Komputer (STIKOM) PGRI Banyuwangi
- Title: Asisten Ahli
- Focus Areas: Software Engineering, Artificial Intelligence (AI), Cloud-based Learning, and Digital Education.

### EDUCATIONS (S1 - S3)
1. **S1 (Sarjana - Teknik Informatika)**
   - Institution: Sekolah Tinggi Ilmu Komputer PGRI Banyuwangi
   - Years: 2009 - 2012
   - Thesis Title: "Sistem Informasi data siswa dengan Java dan MySQL"
2. **S2 (Magister - Teknologi Informasi)**
   - Institution: Universitas Dian Nuswantoro
   - Years: 2014 - 2016
   - Thesis Title: "Implementasi Neural Network untuk Klasifikasi Data Pendidikan"
3. **S3 (Doktor - Ilmu Komputer)**
   - Institution: Universitas Gadjah Mada (UGM)
   - Years: 2017 - 2021
   - Thesis Title: "Optimasi Deep Learning untuk Deteksi Citra Pertanian"

### TEACHING EXPERIENCE (PENGAJARAN)
- **Pengembangan Backend (3 SKS, Ganjil 2024/2025):** Membahas arsitektur server, Express.js framework, and MySQL database structure.
- **Software Quality Assurance (4 SKS, Genap 2024/2025):** Fokus pada standar ISO/IEC 25010, software testing lifecycle, dan automation testing.

### RESEARCH PROJECTS (PENELITIAN)
1. **Penerapan Kecerdasan Buatan untuk Identifikasi Tanaman Sakit (2023 - 2025)**
   - Role: Ketua Peneliti (Lead Researcher)
   - Funding: DRPM Kemendikbud
   - Summary: Mengembangkan model computer vision berbasis CNN (Convolutional Neural Network) untuk mendeteksi penyakit tanaman padi.
2. **Digitalisasi Sistem Presensi Siswa dan Guru di Madrasah (2024)**
   - Role: Ketua Peneliti
   - Funding: Internal Kampus
   - Summary: Membangun sistem kehadiran digital instan berbasis QR Code.

### PUBLICATIONS (PUBLIKASI ILMIAH)
- **Journal Paper (2023):** "Machine Learning-based Model for Predicting Student Performance", published in International Journal of Computer Science (DOI: 10.1234/ijcs.2023.001)
- **Conference Proceeding (2022):** "Digital Transformation of Mosque Management System", presented at ICITEE Conference (DOI: 10.5678/icitee.2022.008)

### COMMUNITY SERVICES (PENGABDIAN MASYARAKAT)
- **Pelatihan Pengelolaan Data Digital untuk Takmir Masjid (2024):** Berlokasi di Desa Tukangkayu, Banyuwangi. Melatih pengurus masjid tentang manajemen administrasi digital.
- **Workshop Literasi Digital bagi Guru MI (2025):** Berlokasi di MI Darul Ulum Grogol, membantu guru melakukan absensi digital mandiri menggunakan AppSheet.

### DEVELOPER & PRACTITIONER PROJECTS
- **Sistem Presensi Digital MI Darul Ulum:** Aplikasi absensi siswa & guru berbasis QR code (Built with AppSheet, Supabase, and Canva).
- **Website Portofolio Dosen & Peneliti:** Situs personal branding untuk pendidik dan peneliti (Built with Next.js, Supabase, and TailwindCSS).

### AWARDS (PENGHARGAAN)
- **Best Paper Award (2023):** Dari konferensi ilmiah ICITEE.
- **Dosen Berprestasi I (2024):** Penghargaan internal dari Sekolah Tinggi Ilmu Komputer Banyuwangi.

### SOCIAL LINKS & CONTACTS
- Email: mtaufiq39@gmail.com
- LinkedIn: https://linkedin.com/in/limfiq
- GitHub: https://github.com/limfiq
- SINTA Profile: https://sinta.kemdiktisaintek.go.id/authors/profile/6000762
- ORCID ID: https://orcid.org/0000-0003-3473-7847
- Google Scholar: https://scholar.google.com/citations?user=IuAv028AAAAJ&hl=id

### PERSONA RULES & GUIDELINES:
1. Speak in a helpful, warm, and highly professional manner.
2. Provide answers that highlight both his academic and software engineering background.
3. Default language is Indonesian, but switch to English if the user asks in English.
4. If asked something unrelated to M. Taufiq, guide the user back politely: "Maaf, saya didesain khusus untuk menjawab pertanyaan terkait profil akademis dan portofolio profesional IT milik Pak Taufiq."
5. Keep answers concise. Use bullet points for readability when listing items.
`;

        // Ensure the conversation starts with a 'user' message as required by Gemini API
        const firstUserIndex = messages.findIndex(msg => msg.role === "user");
        const chatHistory = firstUserIndex !== -1 ? messages.slice(firstUserIndex) : [];

        if (chatHistory.length === 0) {
            return NextResponse.json({ response: "Halo! Ada yang bisa saya bantu?" });
        }

        const formattedContents = chatHistory.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // Calling Gemini 2.5 Flash via REST API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: formattedContents,
                    systemInstruction: {
                        parts: [{ text: systemInstruction }]
                    },
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 800,
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API server error details:", response.status, errorText);
            throw new Error(`Gemini API responded with status ${response.status}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, terjadi kendala saat memproses jawaban dari model.";

        return NextResponse.json({ response: text });

    } catch (err) {
        console.error("Error in Gemini Chat Handler:", err);
        return NextResponse.json({ 
            error: "Terjadi gangguan internal server saat memproses obrolan.",
            details: err.message 
        }, { status: 500 });
    }
}
