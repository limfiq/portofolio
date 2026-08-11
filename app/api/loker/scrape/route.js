import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Helper function to clean and sanitize HTML descriptions before saving to DB
function cleanHtmlDescription(html) {
    if (!html) return "";
    
    let clean = html;
    
    // Remove scripts, styles, iframes, embeds, and object tags completely
    clean = clean.replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "");
    clean = clean.replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "");
    clean = clean.replace(/<iframe[^>]*>([\s\S]*?)<\/iframe>/gi, "");
    clean = clean.replace(/<embed[^>]*>([\s\S]*?)<\/embed>/gi, "");
    clean = clean.replace(/<object[^>]*>([\s\S]*?)<\/object>/gi, "");
    
    // Remove HTML comments
    clean = clean.replace(/<!--[\s\S]*?-->/g, "");
    
    // Remove inline event handlers (e.g. onclick, onload, onerror, etc)
    clean = clean.replace(/\s+on\w+\s*=\s*(["'])(.*?)\2/gi, "");
    clean = clean.replace(/\s+on\w+\s*=\s*([^\s>]+)/gi, "");
    
    // Remove javascript: links
    clean = clean.replace(/href\s*=\s*(["'])javascript:(.*?)\3/gi, 'href="#"');
    
    // Normalize excessive line breaks/br tags
    clean = clean.replace(/(<br\s*\/?>\s*){3,}/gi, "<br><br>");
    
    // Trim extra spaces and newlines
    clean = clean.trim();
    return clean;
}

// Helper function to clean gender indicators from job titles
function cleanJobTitle(title) {
    if (!title) return "";
    
    let clean = title;
    
    // Pattern to match gender indicator suffixes like (m/w/d), (f/m/x), (all genders), (gn), (m/f/*)
    const patterns = [
        /\s*[\(\[-]\s*(m\/w\/d|f\/m\/d|m\/f\/d|w\/m\/d|m\/f\/x|w\/m\/x|m\/w\/x|f\/m\/x|m\/f\/o|gn|all genders|m\/w\/d\/x|m\/w\/x\/d|all|f\/m\/div)\s*[\)\]-]?/gi,
        /\s*[\(\[-]\s*[mwdfx](\/[mwdfx]){1,3}\s*[\)\]]/gi, // generic patterns like (m/f), (m/w/d/x)
        /\s*-\s*all genders\b/gi,
        /\s*\|\s*all genders\b/gi,
    ];
    
    patterns.forEach(pattern => {
        clean = clean.replace(pattern, "");
    });
    
    // Clean up trailing dashes, vertical bars, slashes, or whitespace that might be left over
    clean = clean.replace(/\s*[-|/]\s*$/g, "");
    clean = clean.trim();
    
    return clean;
}

async function runScrape(req) {
    // Verified CRON_SECRET if set in environment variables
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
        const authHeader = req.headers.get("authorization");
        if (authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
        }
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        // Gunakan SERVICE_ROLE key jika ada (untuk bypass RLS saat insert), 
        // tapi di project ini kita pakai ANON_KEY + policy insert = true
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "dummy-key";
        const supabase = createClient(supabaseUrl, supabaseKey);

        let newJobs = [];

        // 1. Fetch dari Remotive (Fokus ke IT / Software Dev Luar Negeri & Remote)
        try {
            const remotiveRes = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=15");
            if (remotiveRes.ok) {
                const remotiveData = await remotiveRes.json();
                const jobs = remotiveData.jobs.map(job => ({
                    title: cleanJobTitle(job.title),
                    company: job.company_name,
                    location: job.candidate_required_location || "Remote",
                    type: job.job_type ? job.job_type.replace("_", " ") : "Full-time",
                    link: job.url,
                    source: "Remotive (Luar Negeri)",
                    description: cleanHtmlDescription(job.description)
                }));
                newJobs = [...newJobs, ...jobs];
            }
        } catch (e) {
            console.error("Error fetching Remotive:", e);
        }

        // 2. Fetch dari Arbeitnow (Global / Umum)
        try {
            const arbeitnowRes = await fetch("https://www.arbeitnow.com/api/job-board-api");
            if (arbeitnowRes.ok) {
                const arbeitnowData = await arbeitnowRes.json();
                // Filter top 15 IT-related jobs
                const itJobs = arbeitnowData.data
                    .filter(job => job.title.toLowerCase().match(/developer|engineer|programmer|data|it|software|tech|frontend|backend|fullstack/))
                    .slice(0, 15)
                    .map(job => ({
                        title: cleanJobTitle(job.title),
                        company: job.company_name,
                        location: job.location || "Remote",
                        type: "Full-time", // Arbeitnow tidak selalu memiliki tipe terstruktur
                        link: job.url,
                        source: "Arbeitnow (Global)",
                        description: cleanHtmlDescription(job.description)
                    }));
                newJobs = [...newJobs, ...itJobs];
            }
        } catch (e) {
            console.error("Error fetching Arbeitnow:", e);
        }

        // 3. Fetch dari Jobicy (Fokus ke APAC / Asia)
        try {
            const jobicyRes = await fetch("https://jobicy.com/api/v2/remote-jobs?industry=engineering");
            if (jobicyRes.ok) {
                const jobicyData = await jobicyRes.json();
                if (jobicyData.jobs) {
                    const apacJobs = jobicyData.jobs
                        .filter(job => job.jobGeo && (job.jobGeo.toLowerCase().includes("apac") || job.jobGeo.toLowerCase().includes("asia") || job.jobGeo.toLowerCase().includes("indonesia") || job.jobGeo.toLowerCase().includes("anywhere")))
                        .slice(0, 10)
                        .map(job => ({
                            title: cleanJobTitle(job.jobTitle),
                            company: job.companyName,
                            location: job.jobGeo || "Remote APAC",
                            type: job.jobType ? job.jobType.join(", ") : "Full-time",
                            link: job.url,
                            source: "Jobicy (Asia/Global)",
                            description: cleanHtmlDescription(job.jobDescription || job.description)
                        }));
                    newJobs = [...newJobs, ...apacJobs];
                }
            }
        } catch (e) {
            console.error("Error fetching Jobicy:", e);
        }

        if (newJobs.length === 0) {
            return NextResponse.json({ message: "Tidak ada data loker baru yang didapatkan dari sumber." }, { status: 200 });
        }

        // Insert ke Supabase
        let insertedCount = 0;
        for (const job of newJobs) {
            const { error } = await supabase
                .from("job_vacancies")
                .insert([job]);
            
            // Jika error code BUKAN 23505 (unique violation/duplikat link), dan BUKAN error RLS
            if (!error) {
                insertedCount++;
            }
        }

        // Hapus loker yang sudah kadaluarsa (berumur lebih dari 30 hari)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const { count: deletedCount, error: deleteError } = await supabase
            .from("job_vacancies")
            .delete()
            .lt("created_at", thirtyDaysAgo.toISOString())
            .select("id", { count: 'exact' });

        if (deleteError) {
            console.error("Error deleting expired jobs:", deleteError);
        }

        return NextResponse.json({ 
            message: `Berhasil mengambil ${newJobs.length} loker dari sumber. ${insertedCount} loker baru ditambahkan. ${deletedCount || 0} loker kadaluarsa (lebih dari 30 hari) telah dihapus.`,
            count: insertedCount,
            deletedCount: deletedCount || 0
        }, { status: 200 });

    } catch (error) {
        console.error("Scraping error:", error);
        return NextResponse.json({ error: "Gagal memproses scraping." }, { status: 500 });
    }
}

export async function POST(req) {
    return runScrape(req);
}

export async function GET(req) {
    return runScrape(req);
}

