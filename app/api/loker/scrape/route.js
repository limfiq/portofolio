import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";

// Helper function to clean and sanitize HTML descriptions before saving to DB
function cleanHtmlDescription(rawHtml) {
    if (!rawHtml) return "";
    
    try {
        const $ = cheerio.load(rawHtml, null, false); // fragments mode
        
        // 1. Remove dangerous and unnecessary tags completely
        $('script, style, iframe, embed, object, meta, link, noscript, svg, form, input, button').remove();
        
        // 2. Remove footer promotional links/ads (e.g. Arbeitnow, Jobicy promo text)
        $('a[href*="arbeitnow.com"]').each((_, el) => {
            const p = $(el).closest('p');
            if (p.length && /find more|english speaking jobs|arbeitnow/i.test(p.text())) {
                p.remove();
            } else {
                $(el).remove();
            }
        });
        
        // Remove promotional text matching Arbeitnow / Jobicy patterns
        $('p, div, span').each((_, el) => {
            const text = $(el).text().trim();
            if (/^find more .* on arbeitnow$/i.test(text) || /^apply on .*$/i.test(text)) {
                $(el).remove();
            }
        });
        
        // 3. Strip all style, class, id, and data-* attributes (like data-contrast, data-ccp-props)
        $('*').each((_, el) => {
            const attribs = el.attribs || {};
            for (const attr of Object.keys(attribs)) {
                if (attr === 'href') {
                    // Sanitize href
                    const val = attribs[attr];
                    if (val && val.toLowerCase().startsWith('javascript:')) {
                        $(el).attr('href', '#');
                    }
                } else if (attr === 'target') {
                    $(el).attr('target', '_blank').attr('rel', 'noopener noreferrer');
                } else {
                    // Remove all other attributes (data-*, style, class, id, on*, etc.)
                    $(el).removeAttr(attr);
                }
            }
        });
        
        // 4. Unwrap useless wrapper tags (span, font)
        $('span, font').each((_, el) => {
            $(el).replaceWith($(el).contents());
        });
        
        // 5. Remove empty elements (paragraphs, list items, headers with only whitespace or &nbsp;)
        let removedEmpty = true;
        while (removedEmpty) {
            removedEmpty = false;
            $('p, li, h1, h2, h3, h4, h5, h6, div, b, strong, i, em').each((_, el) => {
                const text = $(el).text().replace(/\u00a0/g, ' ').trim();
                const children = $(el).children();
                if (!text && children.length === 0) {
                    $(el).remove();
                    removedEmpty = true;
                }
            });
        }
        
        let cleanedHtml = $.html().trim();
        
        // Normalize redundant line breaks
        cleanedHtml = cleanedHtml.replace(/(<br\s*\/?>\s*){3,}/gi, "<br><br>");
        // Remove trailing or leading break tags
        cleanedHtml = cleanedHtml.replace(/^(<br\s*\/?>)+|(<br\s*\/?>)+$/gi, "").trim();
        
        return cleanedHtml;
    } catch (err) {
        console.error("Error sanitizing HTML with cheerio:", err);
        // Fallback basic regex cleaning
        return rawHtml
            .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
            .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
            .replace(/<span[^>]*>/gi, "")
            .replace(/<\/span>/gi, "")
            .trim();
    }
}

// Helper function to clean gender indicators and formatting from job titles
function cleanJobTitle(title) {
    if (!title) return "";
    
    let clean = title;
    
    // Normalize parenthesized levels: "(Senior)" -> "Senior", "(Junior)" -> "Junior", "(Lead)" -> "Lead"
    clean = clean.replace(/\((Senior|Junior|Lead|Mid|Entry|Principal|Intern|Staff)\)/gi, "$1");
    
    // Pattern to match gender indicator suffixes like (m/w/d), (f/m/x), (all genders), (gn), (m/f/*)
    const patterns = [
        /\s*[\(\[-]\s*(m\/w\/d|f\/m\/d|m\/f\/d|w\/m\/d|m\/f\/x|w\/m\/x|m\/w\/x|f\/m\/x|m\/f\/o|gn|all genders|m\/w\/d\/x|m\/w\/x\/d|all|f\/m\/div)\s*[\)\]-]?/gi,
        /\s*[\(\[-]\s*[mwdfx](\/[mwdfx]){1,3}\s*[\)\]]/gi,
        /\s*-\s*all genders\b/gi,
        /\s*\|\s*all genders\b/gi,
        /\s*-\s*Remote\b/gi,
    ];
    
    patterns.forEach(pattern => {
        clean = clean.replace(pattern, "");
    });
    
    // Clean up trailing dashes, vertical bars, slashes, or whitespace
    clean = clean.replace(/\s*[-|/]\s*$/g, "");
    clean = clean.replace(/\s{2,}/g, " ");
    clean = clean.trim();
    
    return clean;
}

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

async function runScrape(req) {
    // Verified CRON_SECRET if set in environment variables
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
        const authHeader = req.headers.get("authorization");
        const isVercelCron = req.headers.get("x-vercel-cron") === "1";
        
        // Allow if matching Bearer token OR verified Vercel cron invocation
        if (authHeader !== `Bearer ${cronSecret}` && !isVercelCron) {
            return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
        }
    }

    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
            console.error("Missing Supabase credentials in server environment");
            return NextResponse.json({ 
                error: "Konfigurasi database server belum lengkap (NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY tidak ditemukan)." 
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        let newJobs = [];
        const sourceErrors = [];

        // 1. Fetch dari Remotive (Fokus ke IT / Software Dev Luar Negeri & Remote)
        try {
            const remotiveRes = await fetch("https://remotive.com/api/remote-jobs?category=software-dev&limit=15", {
                signal: AbortSignal.timeout(10000),
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
            });
            if (remotiveRes.ok) {
                const remotiveData = await remotiveRes.json();
                if (remotiveData.jobs && Array.isArray(remotiveData.jobs)) {
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
            } else {
                sourceErrors.push(`Remotive status: ${remotiveRes.status}`);
            }
        } catch (e) {
            console.error("Error fetching Remotive:", e.message);
            sourceErrors.push(`Remotive: ${e.message}`);
        }

        // 2. Fetch dari Arbeitnow (Global / Umum)
        try {
            const arbeitnowRes = await fetch("https://www.arbeitnow.com/api/job-board-api", {
                signal: AbortSignal.timeout(10000),
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
            });
            if (arbeitnowRes.ok) {
                const arbeitnowData = await arbeitnowRes.json();
                if (arbeitnowData.data && Array.isArray(arbeitnowData.data)) {
                    // Filter top 15 IT-related jobs
                    const itJobs = arbeitnowData.data
                        .filter(job => job.title && job.title.toLowerCase().match(/developer|engineer|programmer|data|it|software|tech|frontend|backend|fullstack/))
                        .slice(0, 15)
                        .map(job => ({
                            title: cleanJobTitle(job.title),
                            company: job.company_name,
                            location: job.location || "Remote",
                            type: "Full-time",
                            link: job.url,
                            source: "Arbeitnow (Global)",
                            description: cleanHtmlDescription(job.description)
                        }));
                    newJobs = [...newJobs, ...itJobs];
                }
            } else {
                sourceErrors.push(`Arbeitnow status: ${arbeitnowRes.status}`);
            }
        } catch (e) {
            console.error("Error fetching Arbeitnow:", e.message);
            sourceErrors.push(`Arbeitnow: ${e.message}`);
        }

        // 3. Fetch dari Jobicy (Fokus ke APAC / Asia)
        try {
            const jobicyRes = await fetch("https://jobicy.com/api/v2/remote-jobs?industry=engineering", {
                signal: AbortSignal.timeout(10000),
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
            });
            if (jobicyRes.ok) {
                const jobicyData = await jobicyRes.json();
                if (jobicyData.jobs && Array.isArray(jobicyData.jobs)) {
                    const apacJobs = jobicyData.jobs
                        .filter(job => job.jobGeo && (job.jobGeo.toLowerCase().includes("apac") || job.jobGeo.toLowerCase().includes("asia") || job.jobGeo.toLowerCase().includes("indonesia") || job.jobGeo.toLowerCase().includes("anywhere")))
                        .slice(0, 10)
                        .map(job => ({
                            title: cleanJobTitle(job.jobTitle),
                            company: job.companyName,
                            location: job.jobGeo || "Remote APAC",
                            type: job.jobType ? (Array.isArray(job.jobType) ? job.jobType.join(", ") : job.jobType) : "Full-time",
                            link: job.url,
                            source: "Jobicy (Asia/Global)",
                            description: cleanHtmlDescription(job.jobDescription || job.description)
                        }));
                    newJobs = [...newJobs, ...apacJobs];
                }
            } else {
                sourceErrors.push(`Jobicy status: ${jobicyRes.status}`);
            }
        } catch (e) {
            console.error("Error fetching Jobicy:", e.message);
            sourceErrors.push(`Jobicy: ${e.message}`);
        }

        if (newJobs.length === 0) {
            return NextResponse.json({ 
                message: "Tidak ada data loker baru yang didapatkan dari sumber.",
                sourceErrors: sourceErrors.length > 0 ? sourceErrors : undefined
            }, { status: 200 });
        }

        // Insert ke Supabase
        let insertedCount = 0;
        for (const job of newJobs) {
            const { error } = await supabase
                .from("job_vacancies")
                .insert([job]);
            
            // Jika tidak error (duplikat link atau insert berhasil)
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
            deletedCount: deletedCount || 0,
            sourceErrors: sourceErrors.length > 0 ? sourceErrors : undefined
        }, { status: 200 });

    } catch (error) {
        console.error("Scraping error:", error);
        return NextResponse.json({ error: "Gagal memproses scraping: " + (error.message || "Unknown error") }, { status: 500 });
    }
}

export async function POST(req) {
    return runScrape(req);
}

export async function GET(req) {
    return runScrape(req);
}

