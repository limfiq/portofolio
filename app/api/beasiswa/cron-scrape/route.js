import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import * as cheerio from "cheerio";

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Helper: ambil deskripsi teks dari halaman detail Indbeasiswa
async function fetchDetailDescription(url) {
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return null;
        const html = await res.text();
        const $ = cheerio.load(html);

        // Hapus elemen yang tidak perlu: iklan, navigasi, gambar lazyload, widget
        $(".indb-ad-bawah-snapshot, .wp-block-rank-math-toc-block, .wp-block-latest-posts, blockquote, .adsbygoogle, ins, script, style").remove();
        $("img").remove();

        // Ambil konten utama artikel
        const content = $(".indb-article-content").text();
        if (!content || content.trim().length < 50) return null;

        // Bersihkan whitespace berlebih
        return content.replace(/\s+/g, " ").trim().substring(0, 3000);
    } catch (e) {
        console.error("fetchDetailDescription error:", e.message);
        return null;
    }
}

async function runScrape(req) {
    // Verifikasi CRON_SECRET jika di-set di environment variables
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
        const authHeader = req.headers.get("authorization");
        const isVercelCron = req.headers.get("x-vercel-cron") === "1";
        
        // Izinkan jika token sesuai atau dipanggil oleh cron Vercel
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
                error: "Konfigurasi database server belum lengkap." 
            }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Scraping dari indbeasiswa.com
        const targetUrl = "https://indbeasiswa.com/category/beasiswa-terbaru/";
        const res = await fetch(targetUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Gagal mengambil data dari website tujuan" }, { status: 500 });
        }

        const html = await res.text();
        const $ = cheerio.load(html);
        const results = [];
        
        $(".beasiswa-card").each((i, el) => {
            const title = $(el).find(".beasiswa-title").text().trim();
            const link = $(el).find("a.beasiswa-detail").attr("href");
            const penyelenggara = $(el).find(".beasiswa-penyelenggara").text().replace("🏫", "").trim();
            const jenjang = $(el).find(".beasiswa-jenjang").text().replace("🎓", "").replace("Jenjang:", "").trim();
            const deadlineRaw = $(el).find(".beasiswa-deadline").text().replace("📅", "").replace("Deadline:", "").trim();
            
            let deadline = null;
            if (deadlineRaw) {
                const parts = deadlineRaw.split("/");
                if (parts.length === 3) {
                    deadline = `${parts[2]}-${parts[1]}-${parts[0]}`; // YYYY-MM-DD
                } else {
                    deadline = deadlineRaw;
                }
            }

            if (title && link) {
                results.push({
                    title,
                    url: link,
                    provider: penyelenggara,
                    level: jenjang,
                    description: `Beasiswa untuk jenjang ${jenjang}. Diambil otomatis dari Indbeasiswa.`,
                    deadline: deadline || null,
                    status: "Open"
                });
            }
        });

        if (results.length === 0) {
            return NextResponse.json({ message: "Tidak ada beasiswa terbaru yang ditemukan." }, { status: 200 });
        }

        let insertedCount = 0;
        for (const item of results) {
            // Cek apakah sudah ada di database untuk mencegah duplikasi
            const { data: existing } = await supabase
                .from("scholarships")
                .select("id")
                .eq("url", item.url)
                .single();

            if (!existing) {
                // Ambil deskripsi lengkap dari halaman detail beasiswa
                const fullDescription = await fetchDetailDescription(item.url);
                if (fullDescription) item.description = fullDescription;
                
                // Kecil delay agar tidak terlalu agresif ke server Indbeasiswa
                await new Promise(r => setTimeout(r, 500));

                const { error } = await supabase.from("scholarships").insert([item]);
                if (!error) insertedCount++;
            }
        }

        return NextResponse.json({ 
            success: true,
            message: `Berhasil scrape ${results.length} beasiswa. ${insertedCount} data baru ditambahkan ke database.`,
            addedCount: insertedCount
        }, { status: 200 });

    } catch (error) {
        console.error("Cron Scraping error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan saat melakukan cron scraping massal" },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    return runScrape(req);
}

export async function GET(req) {
    return runScrape(req);
}
