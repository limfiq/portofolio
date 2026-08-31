import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const { title, description } = await request.json();

        if (!title && !description) {
            return NextResponse.json({ error: "Tidak ada konten yang bisa diterjemahkan." }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: "Layanan translate belum aktif karena GEMINI_API_KEY belum dikonfigurasi di environment variables server." }, { status: 503 });
        }

        // Batasi panjang konten agar tidak membebani model
        const maxDescChars = 8000;
        const truncatedDescription = (description || "").slice(0, maxDescChars);

        const systemInstruction = `You are a professional job posting translator (English/any language to Indonesian).
Translate the job title and HTML description into natural, professional Indonesian.

STRICT RULES:
1. PRESERVE the HTML structure exactly: keep all tags, attributes (href, src), lists, bold text, and paragraphs unchanged. Only translate the visible text content inside tags.
2. DO NOT translate: company names, brand names, technology names (e.g. React, Python, AWS, Kubernetes, MySQL), programming languages, acronyms (API, SQL, HTML, SaaS), URLs, email addresses, currency symbols, or numbers.
3. Common IT job terms may stay in English where natural in Indonesian job postings (e.g. "Senior Software Engineer", "Fullstack Developer").
4. Output ONLY valid JSON with exactly two keys: "title" and "description". No markdown, no code fences, no extra text.`;

        const prompt = `Translate the following job posting to Indonesian.

Title:
${title || ""}

Description (HTML):
${truncatedDescription}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    systemInstruction: {
                        parts: [{ text: systemInstruction }]
                    },
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 8192,
                    }
                }),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini translate API error details:", response.status, errorText.slice(0, 500));
            throw new Error(`Gemini API responded with status ${response.status}`);
        }

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        // Ekstrak JSON dari respons (bisa terbungkus code fence)
        let jsonText = rawText.trim();
        const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (fenceMatch) {
            jsonText = fenceMatch[1].trim();
        } else {
            // Fallback: ambil bagian terbesar yang valid JSON
            const firstBrace = jsonText.indexOf("{");
            const lastBrace = jsonText.lastIndexOf("}");
            if (firstBrace !== -1 && lastBrace > firstBrace) {
                jsonText = jsonText.slice(firstBrace, lastBrace + 1);
            }
        }

        let parsed;
        try {
            parsed = JSON.parse(jsonText);
        } catch (parseErr) {
            console.error("Failed to parse Gemini translate response:", parseErr.message);
            return NextResponse.json({ error: "Gagal memproses hasil terjemahan dari model AI." }, { status: 502 });
        }

        return NextResponse.json({
            title: parsed.title || title,
            description: parsed.description || description
        });

    } catch (err) {
        console.error("Translate loker error:", err);
        return NextResponse.json({ error: "Gagal menerjemahkan loker: " + (err.message || "Unknown error") }, { status: 500 });
    }
}
