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
        let sourceName = "Manual / Sosial Media";
        let company = "";

        try {
            // Determine source name from hostname
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.replace('www.', '');
            if (hostname.includes('projects.co.id')) sourceName = "projects.co.id";
            else if (hostname.includes('upwork.com')) sourceName = "Upwork";
            else if (hostname.includes('freelancer.co.id') || hostname.includes('freelancer.com')) sourceName = "Freelancer";
            else if (hostname.includes('jobstreet')) sourceName = "Jobstreet";
            else sourceName = hostname;

            // Fetch HTML with a common User-Agent to avoid basic bot blocks
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

                // Try to get Title (priority: og:title -> h1 -> title)
                title = $('meta[property="og:title"]').attr('content') || 
                        $('meta[name="twitter:title"]').attr('content') ||
                        $('h1').first().text() || 
                        $('title').text();

                // Try to get Description (priority: og:description -> meta description -> first meaningful paragraph)
                description = $('meta[property="og:description"]').attr('content') || 
                              $('meta[name="twitter:description"]').attr('content') ||
                              $('meta[name="description"]').attr('content');

                // Platform specific fallbacks if meta tags are insufficient
                if (sourceName === "projects.co.id" && !description) {
                    description = $('.project-description').text() || description;
                }

                // Clean up title (remove site names often appended)
                if (title) {
                    title = title.replace(/\s*[-|]\s*(projects\.co\.id|Upwork|Freelancer|Jobstreet).*$/i, '').trim();
                    title = title.replace(/\s*-\s*Cari Pekerjaan.*$/i, '').trim();
                }

                // If description is still empty, grab some paragraphs
                if (!description) {
                    let pText = "";
                    $('p').each((i, el) => {
                        if (i < 3) pText += $(el).text() + "\n\n";
                    });
                    description = pText.trim();
                }

            } else {
                console.warn("Failed to fetch URL, status:", response.status);
            }
        } catch (fetchError) {
            console.error("Error fetching URL:", fetchError.message);
            // We don't fail completely, just return what we have (empty strings)
        }

        return NextResponse.json({
            title: title || "",
            description: description || "",
            company: company || "",
            source: sourceName,
            url: url
        }, { status: 200 });

    } catch (error) {
        console.error("Scrape URL error:", error);
        return NextResponse.json({ error: "Terjadi kesalahan saat memproses URL." }, { status: 500 });
    }
}
