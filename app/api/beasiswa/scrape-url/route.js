import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

export async function POST(req) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        let title = "";
        let description = "";
        let provider = "Website Beasiswa";
        
        try {
            // Determine provider name from hostname
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.replace('www.', '');
            if (hostname.includes('lpdp.kemenkeu.go.id')) provider = "LPDP Kemenkeu";
            else if (hostname.includes('beasiswa.kemdikbud.go.id')) provider = "Kemdikbud";
            else if (hostname.includes('kampusmerdeka')) provider = "Kampus Merdeka";
            else provider = hostname;

            // Fetch HTML
            const response = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                    'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
                }
            });

            if (response.ok) {
                const html = await response.text();
                const $ = cheerio.load(html);

                // Try to get Title
                title = $('meta[property="og:title"]').attr('content') || 
                        $('meta[name="twitter:title"]').attr('content') ||
                        $('h1').first().text() || 
                        $('title').text();

                // Try to get Description
                description = $('meta[property="og:description"]').attr('content') || 
                              $('meta[name="twitter:description"]').attr('content') ||
                              $('meta[name="description"]').attr('content');

                // Fallback for description
                if (!description) {
                    let pText = "";
                    $('p').each((i, el) => {
                        if (i < 3) pText += $(el).text() + "\n\n";
                    });
                    description = pText.trim();
                }

                // Clean up title
                if (title) {
                    title = title.replace(/\s*[-|]\s*(LPDP|Kemdikbud).*$/i, '').trim();
                }

            } else {
                console.warn("Failed to fetch URL, status:", response.status);
            }
        } catch (fetchError) {
            console.error("Error fetching URL:", fetchError.message);
        }

        return NextResponse.json({
            title: title || "",
            description: description || "",
            provider: provider || "",
            url: url
        }, { status: 200 });

    } catch (error) {
        console.error("Scrape URL error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan saat memproses URL beasiswa." }, { status: 500 });
    }
}
