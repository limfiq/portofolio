import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Helper: ambil deskripsi dari halaman detail Indbeasiswa
async function fetchDetailDescription(url) {
    try {
        const res = await fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" },
            signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) return null;
        const html = await res.text();
        const $ = cheerio.load(html);
        $(".indb-ad-bawah-snapshot, .wp-block-rank-math-toc-block, .wp-block-latest-posts, blockquote, .adsbygoogle, ins, script, style").remove();
        $("img").remove();
        const content = $(".indb-article-content").text();
        if (!content || content.trim().length < 50) return null;
        return content.replace(/\s+/g, " ").trim().substring(0, 3000);
    } catch (e) {
        return null;
    }
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";
        
        const targetUrl = page === "1" 
            ? "https://indbeasiswa.com/category/beasiswa-terbaru/" 
            : `https://indbeasiswa.com/category/beasiswa-terbaru/page/${page}/`;

        const res = await fetch(targetUrl, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            },
        });

        if (!res.ok) {
            return NextResponse.json(
                { error: "Gagal mengambil data dari website tujuan" },
                { status: 500 }
            );
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
            
            // Format deadline jika perlu
            let deadline = null;
            if (deadlineRaw) {
                // Biasanya format DD/MM/YYYY
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
                    deadline: deadline || null,
                });
            }
        });

        // Ambil deskripsi dari halaman detail masing-masing beasiswa
        for (const item of results) {
            const desc = await fetchDetailDescription(item.url);
            item.description = desc || `Beasiswa untuk jenjang ${item.level}.`;
            await new Promise(r => setTimeout(r, 300)); // delay kecil
        }

        return NextResponse.json({
            success: true,
            total: results.length,
            page: parseInt(page),
            data: results
        });
    } catch (error) {
        console.error("Scraping error:", error);
        return NextResponse.json(
            { error: "Terjadi kesalahan saat melakukan scraping" },
            { status: 500 }
        );
    }
}
