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

// Helper untuk mengekstrak nama perusahaan dari judul artikel (mis. "PT Freeport Indonesia")
function extractCompany(title) {
    if (!title) return "";
    const t = title.trim();
    // Cari pola "PT/Nama" — utamakan setelah "Lowongan Kerja" atau di akhir judul
    const patterns = [
        /(?:Lowongan (?:Kerja|Pekerjaan)|Rekrutmen|Open Recruitment)[^A-Za-z0-9]*(PT\.?\s*[A-Z][A-Za-z0-9&.\- ]{2,}?)(?=\s*(?:Tahun|Periode|di\s+[A-Z]|\(|\d{4})|$)/i,
        /(PT\s*\.?\s*[A-Z][A-Za-z0-9&.\- ]{2,}?)(?=\s*(?:Tahun|Periode|di\s+[A-Z]|\(|\d{4})|$)/i,
        /(?:Lowongan (?:Kerja|Pekerjaan)|Rekrutmen|Open Recruitment)[^A-Za-z0-9]*([A-Z][A-Za-z0-9&.\- ]{2,})/i
    ];
    for (const pattern of patterns) {
        const match = t.match(pattern);
        if (match && match[1]) {
            let company = match[1].trim().replace(/\s+/g, " ");
            // Hapus bagian yang jelas bukan nama perusahaan: lokasi dalam kurung, tahun, "di <kota>"
            company = company.replace(/\s*(?:\([^)]*\)|\d{4}|di\s+[A-Za-z][A-Za-z ]+)$/i, "").trim();
            // Potong sisa kata kunci generic yang menempel di ujung (mis. "RSUD Pontianak Utara Tahun 2026")
            company = company.replace(/\s+(?:Tahun|Periode)\s+\d{4}$/i, "").trim();
            if (company.length >= 4) {
                return company;
            }
            return company;
        }
    }
    return t;
}

// Helper untuk mengekstrak lokasi dari judul / konten artikel
function extractLocation(title, description) {
    const locPatterns = [
        /(?:di|penempatan[:\s]*)[:\s]*(jakarta|bandung|surabaya|yogyakarta|jogja|semarang|medan|makassar|malang|tangerang|bekasi|depok|bogor|batam|palembang|pekanbaru|denpasar|solo|surakarta|pontianak|gresik|timika|tembagapura|balikpapan|samarinda|bali|lombok|papua|kalimantan|sumatera|sulawesi|jawa\s+\w+)/i,
        /\(([^)]*(?:jakarta|bandung|surabaya|jogja|jawa|indonesia)[^)]*)\)/i,
        /(?:jakarta|bandung|surabaya|yogyakarta|jogja|semarang|medan|makassar|malang|tangerang|bekasi|depok|bogor|batam|palembang|denpasar|pontianak|gresik|timika|tembagapura)\s*(?:,|\.|$|\))/i
    ];
    for (const pattern of locPatterns) {
        const match = (title + " " + (description || "")).match(pattern);
        if (match && match[0]) {
            let loc = match[0].replace(/^(di|penempatan[:\s]*)[:\s]*/i, "").replace(/[(),.\s]+$/g, "").trim();
            // Hapus kurung pembuka yang nyangkut (mis. "(Surabaya")
            loc = loc.replace(/^[()]+/, "").trim();
            if (loc.length > 3 && loc.length < 60) {
                return loc;
            }
        }
    }
    return "Indonesia";
}

// Helper untuk mengekstrak link pendaftaran asli dari konten artikel
function extractApplyLink(contentHtml) {
    if (!contentHtml) return "";
    const $ = cheerio.load(contentHtml, null, false);
    const ignored = /blogger\.googleusercontent|lokernas\.com|bit\.ly|tinyurl\.com|linktr\.ee|t\.me|whatsapp|instagram\.com|facebook\.com|youtube\.com|twitter\.com|linkedin\.com|google\.com\/file|drive\.google|feeds\./i;
    let link = "";
    $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (!href || ignored.test(href)) return;
        const text = $(el).text().trim().toLowerCase();
        // Prioritas: link berlabel daftar/pendaftaran/apply/karir, atau href non-blogger
        if (/daftar|pendaftaran|apply|karir|career|recruitment|melamar/.test(text) || /(?:jobs?|career|karir|recruitment|lowongan)/i.test(href)) {
            link = href;
            return false; // stop setelah dapat yang paling relevan
        }
    });
    if (!link) {
        // Fallback: link eksternal pertama (non-blogger)
        $("a[href]").each((_, el) => {
            const href = $(el).attr("href");
            if (!href || ignored.test(href)) return;
            link = href;
            return false;
        });
    }
    return link;
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

        // 4. Fetch dari Lokernas (Loker Dalam Negeri / BUMN, CPNS, Swasta Indonesia)
        try {
            const lokernasRes = await fetch("https://www.lokernas.com/feeds/posts/default?alt=rss&max-results=25", {
                signal: AbortSignal.timeout(15000),
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
            });
            if (lokernasRes.ok) {
                const xml = await lokernasRes.text();
                const $ = cheerio.load(xml, { xmlMode: true });
                const entries = $("entry, item");
                // Filter lowongan yang relevan untuk mahasiswa/calon pekerja IT (strict + umum)
                const strictIt = /developer|engineer|programmer|data scientist|data engineer|data analyst|software|frontend|backend|fullstack|devops|cloud|cyber|network engineer|security|mobile|ui\/ux|qa tester|analyst|sistem informasi|informatika|komputer|staff ti|teknisi|it |web|it$/i;
                const looseIt = /digital|teknologi|telekomunikasi|startup|e-commerce|fintech|bank|perbankan|bumn|cpns|pppk|kementerian|lembaga|rsud|rumah sakit|universitas|dosen|guru|pt .* (indonesia|tbk)|lowongan kerja (staff|admin|magang|internship)/i;
                const isItRelated = (t) => strictIt.test(t) || looseIt.test(t);

                const lokernasJobs = [];
                entries.each((_, el) => {
                    const $el = $(el);
                    const title = $el.find("title").first().text().trim();
                    if (!title || !isItRelated(title)) return;

                    const rawContent = $el.find("content, description").first().text();
                    const cleanedDesc = cleanHtmlDescription(rawContent);
                    // Ambil teks bersih untuk pencarian lokasi (hapus tag & entity)
                    const textOnly = (rawContent || "")
                        .replace(/<[^>]*>/g, " ")
                        .replace(/&nbsp;|&amp;|&quot;|&#\d+;/g, " ")
                        .replace(/\s+/g, " ");

                    lokernasJobs.push({
                        title: cleanJobTitle(title),
                        company: extractCompany(title),
                        location: extractLocation(title, textOnly),
                        type: "Full-time",
                        link: extractApplyLink(rawContent) || ($el.find("link[rel='alternate']").attr("href") || "").replace(/^http:/, "https:"),
                        source: "Lokernas (Dalam Negeri)",
                        description: cleanedDesc
                    });
                });
                newJobs = [...newJobs, ...lokernasJobs.slice(0, 15)];
            } else {
                sourceErrors.push(`Lokernas status: ${lokernasRes.status}`);
            }
        } catch (e) {
            console.error("Error fetching Lokernas:", e.message);
            sourceErrors.push(`Lokernas: ${e.message}`);
        }

        // 5. Fetch dari Karirhub Kemnaker (Loker Dalam Negeri — API Resmi Kementerian Ketenagakerjaan RI)
        try {
            const khHeaders = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" };
            // Ambil 2 halaman pertama (50 lowongan/halaman) untuk memperbanyak kandidat lowongan IT
            const khPageUrls = [
                "https://api.kemnaker.go.id/karirhub/vacancy/v2/published-industrial-vacancies?page=1&limit=50",
                "https://api.kemnaker.go.id/karirhub/vacancy/v2/published-industrial-vacancies?page=2&limit=50"
            ];
            const khItems = [];
            for (const url of khPageUrls) {
                try {
                    const pageRes = await fetch(url, { signal: AbortSignal.timeout(15000), headers: khHeaders });
                    if (pageRes.ok) {
                        const pageData = await pageRes.json();
                        if (pageData.data && Array.isArray(pageData.data)) {
                            khItems.push(...pageData.data);
                        }
                    } else {
                        sourceErrors.push(`Karirhub status: ${pageRes.status}`);
                    }
                } catch (e) {
                    console.error("Error fetching Karirhub page:", e.message);
                    sourceErrors.push(`Karirhub page: ${e.message}`);
                }
            }

            if (khItems.length > 0) {
                // Filter lowongan IT yang relevan (judul/industri/fungsi/job type)
                const itKeywords = /developer|engineer|programmer|data scientist|data engineer|data analyst|software|frontend|backend|fullstack|devops|cloud|cyber|network|security|mobile|ui\/ux|qa tester|qa |analyst|sistem informasi|informatika|komputer|staff it|teknisi|it support|web developer|it$/i;
                const karirhubJobs = [];
                for (const item of khItems) {
                    const title = (item.title || "").trim();
                    if (!title || !itKeywords.test(title)) continue;

                    // Ambil detail untuk deskripsi lengkap (deskripsi + kualifikasi) dan lokasi
                    let description = "";
                    try {
                        const detailRes = await fetch(`https://api.kemnaker.go.id/karirhub/vacancy/v2/published-industrial-vacancies/${item.id}`, {
                            signal: AbortSignal.timeout(10000),
                            headers: khHeaders
                        });
                        if (detailRes.ok) {
                            const detailData = await detailRes.json();
                            const detail = detailData.data || {};
                            const descHtml = detail.description || "";
                            const qualHtml = detail.qualification ? `<p><b>Kualifikasi:</b></p>${detail.qualification}` : "";
                            description = cleanHtmlDescription(`${descHtml}${qualHtml}`);
                            // Lokasi dari objek region detail (mis. "Kota Adm. Jakarta Selatan, DKI Jakarta")
                            if (detail.region && detail.region.name) {
                                item._location = detail.region.name;
                            }
                        }
                    } catch (e) {
                        console.error(`Error fetching Karirhub detail ${item.id}:`, e.message);
                    }

                    // Konversi lokasi (array "city:<uuid>") — biarkan default "Indonesia" jika tidak bisa di-resolve
                    const location = item._location || item.city_name || "Indonesia";

                    // Link asli lowongan (mis. Kalibrr, Toploker) atau fallback detail Karirhub
                    const link = item.platform_link || `https://karirhub.kemnaker.go.id/lowongan/${item.id}`;

                    karirhubJobs.push({
                        title: cleanJobTitle(title),
                        company: item.company_name || "",
                        location,
                        type: item.job_type_name || "Full-time",
                        link,
                        source: "Karirhub Kemnaker (Dalam Negeri)",
                        description
                    });
                }
                newJobs = [...newJobs, ...karirhubJobs.slice(0, 15)];
            }
        } catch (e) {
            console.error("Error fetching Karirhub:", e.message);
            sourceErrors.push(`Karirhub: ${e.message}`);
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

