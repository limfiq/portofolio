import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

const COUNTRY_MAP = {
  ID: "Indonesia",
  US: "United States",
  SG: "Singapura",
  MY: "Malaysia",
  JP: "Jepang",
  GB: "United Kingdom",
  AU: "Australia",
  DE: "Jerman",
  NL: "Belanda",
  FR: "Prancis",
  KR: "Korea Selatan",
  IN: "India",
  CA: "Kanada",
  BR: "Brasil",
  SA: "Arab Saudi",
  AE: "Uni Emirat Arab",
  TR: "Turki",
  RU: "Rusia",
  TH: "Thailand",
  VN: "Vietnam",
  PH: "Filipina",
  CN: "Tiongkok",
  HK: "Hong Kong",
  TW: "Taiwan"
};

const DEFAULT_COUNTRY_SEED = [
  { code: "ID", views: 980 },
  { code: "US", views: 145 },
  { code: "SG", views: 72 },
  { code: "MY", views: 54 },
  { code: "JP", views: 36 },
  { code: "AU", views: 22 },
  { code: "GB", views: 18 },
  { code: "DE", views: 12 }
];

function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode.length !== 2) return "🌐";
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch (_) {
    return "🌐";
  }
}

function detectCountryFromRequest(request) {
  const headerCountry =
    request.headers.get("x-vercel-ip-country") ||
    request.headers.get("cf-ipcountry") ||
    request.headers.get("x-country-code") ||
    request.headers.get("x-country");

  if (headerCountry && headerCountry !== "XX" && headerCountry.length === 2) {
    return headerCountry.toUpperCase();
  }
  return "ID"; // Default fallback
}

function processCountryStats(allViews) {
  // Extract all rows starting with "country:"
  const countryRows = allViews.filter((item) =>
    item.page_name?.toLowerCase().startsWith("country:")
  );

  let rawList = [];

  if (countryRows.length > 0) {
    rawList = countryRows.map((r) => {
      const code = r.page_name.split(":")[1]?.toUpperCase() || "XX";
      return {
        code,
        name: COUNTRY_MAP[code] || code,
        flag: getFlagEmoji(code),
        views: Number(r.view_count) || 0
      };
    });
  } else {
    // Fallback if country rows haven't been seeded
    rawList = DEFAULT_COUNTRY_SEED.map((s) => ({
      code: s.code,
      name: COUNTRY_MAP[s.code] || s.code,
      flag: getFlagEmoji(s.code),
      views: s.views
    }));
  }

  // Sort descending by views
  rawList.sort((a, b) => b.views - a.views);

  const totalCountryViews = rawList.reduce((acc, curr) => acc + curr.views, 0) || 1;
  const countries = rawList.map((item) => ({
    ...item,
    percentage: Math.round((item.views / totalCountryViews) * 1000) / 10
  }));

  return { countries, totalCountryViews };
}

export async function GET(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const pageName = searchParams.get("page") || "Home";
    const visitorCountry = detectCountryFromRequest(request);

    const { data, error } = await supabase
      .from("page_views")
      .select("page_name, view_count");

    if (error) {
      console.warn("Error fetching page_views:", error.message);
      const { countries } = processCountryStats([]);
      return NextResponse.json({
        totalHits: 1339,
        pageHits: 120,
        pageName,
        visitorCountry,
        visitorFlag: getFlagEmoji(visitorCountry),
        visitorCountryName: COUNTRY_MAP[visitorCountry] || visitorCountry,
        countries,
        fallback: true
      });
    }

    const allViews = data || [];
    const { countries, totalCountryViews } = processCountryStats(allViews);

    // Page view for the specific page
    const currentPageRow = allViews.find(
      (item) => item.page_name?.toLowerCase() === pageName.toLowerCase()
    );
    const pageHits = currentPageRow ? Number(currentPageRow.view_count) || 0 : 0;

    return NextResponse.json({
      totalHits: totalCountryViews,
      pageHits: Math.max(pageHits, 1),
      pageName,
      visitorCountry,
      visitorFlag: getFlagEmoji(visitorCountry),
      visitorCountryName: COUNTRY_MAP[visitorCountry] || visitorCountry,
      countries,
      fallback: false
    });
  } catch (err) {
    console.error("Page hit GET error:", err);
    const { countries } = processCountryStats([]);
    return NextResponse.json({
      totalHits: 1339,
      pageHits: 120,
      pageName: "Home",
      visitorCountry: "ID",
      visitorFlag: "🇮🇩",
      visitorCountryName: "Indonesia",
      countries,
      fallback: true
    });
  }
}

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();
    let body = {};
    try {
      body = await request.json();
    } catch (_) {}

    const pageName = body.pageName || "Home";
    const visitorCountry = body.countryCode || detectCountryFromRequest(request);
    const countryKey = `country:${visitorCountry.toUpperCase()}`;

    // 1. Increment current page
    const { data: existingPage } = await supabase
      .from("page_views")
      .select("view_count")
      .eq("page_name", pageName)
      .maybeSingle();

    if (!existingPage) {
      await supabase.from("page_views").insert({
        page_name: pageName,
        view_count: 1,
        last_updated: new Date().toISOString()
      });
    } else {
      await supabase
        .from("page_views")
        .update({
          view_count: (Number(existingPage.view_count) || 0) + 1,
          last_updated: new Date().toISOString()
        })
        .eq("page_name", pageName);
    }

    // 2. Increment visitor's country
    const { data: existingCountry } = await supabase
      .from("page_views")
      .select("view_count")
      .eq("page_name", countryKey)
      .maybeSingle();

    if (!existingCountry) {
      await supabase.from("page_views").insert({
        page_name: countryKey,
        view_count: 1,
        last_updated: new Date().toISOString()
      });
    } else {
      await supabase
        .from("page_views")
        .update({
          view_count: (Number(existingCountry.view_count) || 0) + 1,
          last_updated: new Date().toISOString()
        })
        .eq("page_name", countryKey);
    }

    // 3. Fetch updated data
    const { data: allData } = await supabase
      .from("page_views")
      .select("page_name, view_count");

    const allViews = allData || [];
    const { countries, totalCountryViews } = processCountryStats(allViews);

    const currentPageRow = allViews.find(
      (item) => item.page_name?.toLowerCase() === pageName.toLowerCase()
    );
    const pageHits = currentPageRow ? Number(currentPageRow.view_count) || 0 : 1;

    return NextResponse.json({
      success: true,
      totalHits: totalCountryViews,
      pageHits: Math.max(pageHits, 1),
      pageName,
      visitorCountry,
      visitorFlag: getFlagEmoji(visitorCountry),
      visitorCountryName: COUNTRY_MAP[visitorCountry] || visitorCountry,
      countries
    });
  } catch (err) {
    console.error("Page hit POST error:", err);
    const { countries } = processCountryStats([]);
    return NextResponse.json({
      success: false,
      totalHits: 1339,
      pageHits: 120,
      pageName: "Home",
      visitorCountry: "ID",
      visitorFlag: "🇮🇩",
      visitorCountryName: "Indonesia",
      countries,
      fallback: true
    });
  }
}
