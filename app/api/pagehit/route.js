import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const LOCAL_DATA_PATH = path.join(process.cwd(), "data", "visitor_countries.json");

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

function getCountryName(code) {
  if (!code) return "Unknown";
  try {
    const regionNames = new Intl.DisplayNames(["id"], { type: "region" });
    return regionNames.of(code.toUpperCase()) || code;
  } catch (_) {
    return code;
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
  return "ID";
}

// Local file persistence helpers
function readLocalCountryData() {
  try {
    if (fs.existsSync(LOCAL_DATA_PATH)) {
      const content = fs.readFileSync(LOCAL_DATA_PATH, "utf-8");
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn("Failed to read local country data:", e.message);
  }
  return [];
}

function saveLocalCountryVisit(countryCode, countryName, flagEmoji) {
  try {
    const list = readLocalCountryData();
    const existing = list.find((c) => c.code.toUpperCase() === countryCode.toUpperCase());
    const now = new Date().toISOString();

    if (existing) {
      existing.views = (existing.views || 0) + 1;
      existing.last_visited = now;
      if (!existing.flag) existing.flag = flagEmoji;
      if (!existing.name) existing.name = countryName;
    } else {
      list.push({
        code: countryCode.toUpperCase(),
        name: countryName,
        flag: flagEmoji,
        views: 1,
        first_visited: now,
        last_visited: now
      });
    }

    const dir = path.dirname(LOCAL_DATA_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DATA_PATH, JSON.stringify(list, null, 2), "utf-8");
    return list;
  } catch (e) {
    console.warn("Failed to save local country visit:", e.message);
  }
  return [];
}

// Fetch saved countries from Supabase or local fallback
async function getSavedCountries(supabase) {
  try {
    // 1. Try dedicated visitor_countries table in Supabase
    const { data: dbData, error: dbError } = await supabase
      .from("visitor_countries")
      .select("*")
      .order("view_count", { ascending: false });

    if (!dbError && dbData && dbData.length > 0) {
      const totalViews = dbData.reduce((acc, curr) => acc + (Number(curr.view_count) || 0), 0) || 1;
      return dbData.map((c) => ({
        code: c.country_code,
        name: c.country_name || getCountryName(c.country_code),
        flag: c.flag_emoji || getFlagEmoji(c.country_code),
        views: Number(c.view_count) || 0,
        lastVisited: c.last_visited,
        percentage: Math.round(((Number(c.view_count) || 0) / totalViews) * 1000) / 10
      }));
    }
  } catch (_) {}

  try {
    // 2. Try page_views table for rows starting with "country:"
    const { data: pvData, error: pvError } = await supabase
      .from("page_views")
      .select("page_name, view_count, last_updated");

    if (!pvError && pvData) {
      const countryRows = pvData.filter((r) =>
        r.page_name?.toLowerCase().startsWith("country:")
      );

      if (countryRows.length > 0) {
        const totalViews = countryRows.reduce((acc, curr) => acc + (Number(curr.view_count) || 0), 0) || 1;
        const list = countryRows.map((r) => {
          const code = r.page_name.split(":")[1]?.toUpperCase() || "XX";
          return {
            code,
            name: getCountryName(code),
            flag: getFlagEmoji(code),
            views: Number(r.view_count) || 0,
            lastVisited: r.last_updated,
            percentage: Math.round(((Number(r.view_count) || 0) / totalViews) * 1000) / 10
          };
        });
        list.sort((a, b) => b.views - a.views);
        return list;
      }
    }
  } catch (_) {}

  // 3. Fallback to local persisted file data
  const localList = readLocalCountryData();
  if (localList.length > 0) {
    localList.sort((a, b) => (b.views || 0) - (a.views || 0));
    const totalViews = localList.reduce((acc, curr) => acc + (Number(curr.views) || 0), 0) || 1;
    return localList.map((c) => ({
      code: c.code,
      name: c.name || getCountryName(c.code),
      flag: c.flag || getFlagEmoji(c.code),
      views: Number(c.views) || 0,
      lastVisited: c.last_visited,
      percentage: Math.round(((Number(c.views) || 0) / totalViews) * 1000) / 10
    }));
  }

  // Initial default if empty
  return [
    {
      code: "ID",
      name: "Indonesia",
      flag: "🇮🇩",
      views: 120,
      percentage: 100
    }
  ];
}

export async function GET(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { searchParams } = new URL(request.url);
    const pageName = searchParams.get("page") || "Home";
    const visitorCountry = detectCountryFromRequest(request);

    const savedCountries = await getSavedCountries(supabase);
    const totalHits = savedCountries.reduce((acc, curr) => acc + curr.views, 0);

    // Fetch views for this particular page
    let pageHits = 1;
    try {
      const { data: pageRow } = await supabase
        .from("page_views")
        .select("view_count")
        .eq("page_name", pageName)
        .maybeSingle();
      if (pageRow) {
        pageHits = Number(pageRow.view_count) || 1;
      }
    } catch (_) {}

    return NextResponse.json({
      totalHits: Math.max(totalHits, 1),
      pageHits: Math.max(pageHits, 1),
      pageName,
      visitorCountry,
      visitorFlag: getFlagEmoji(visitorCountry),
      visitorCountryName: getCountryName(visitorCountry),
      countries: savedCountries
    });
  } catch (err) {
    console.error("GET pagehit error:", err);
    return NextResponse.json({
      totalHits: 120,
      pageHits: 1,
      pageName: "Home",
      visitorCountry: "ID",
      visitorFlag: "🇮🇩",
      visitorCountryName: "Indonesia",
      countries: [
        {
          code: "ID",
          name: "Indonesia",
          flag: "🇮🇩",
          views: 120,
          percentage: 100
        }
      ]
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
    const countryCode = (body.countryCode || detectCountryFromRequest(request)).toUpperCase();
    const countryName = getCountryName(countryCode);
    const flagEmoji = getFlagEmoji(countryCode);
    const now = new Date().toISOString();

    // 1. Persist to local file storage (ensures immediate persistence)
    saveLocalCountryVisit(countryCode, countryName, flagEmoji);

    // 2. Persist to Supabase visitor_countries table
    try {
      const { data: existingCountry } = await supabase
        .from("visitor_countries")
        .select("country_code, view_count")
        .eq("country_code", countryCode)
        .maybeSingle();

      if (!existingCountry) {
        await supabase.from("visitor_countries").insert({
          country_code: countryCode,
          country_name: countryName,
          flag_emoji: flagEmoji,
          view_count: 1,
          first_visited: now,
          last_visited: now
        });
      } else {
        await supabase
          .from("visitor_countries")
          .update({
            view_count: (Number(existingCountry.view_count) || 0) + 1,
            last_visited: now
          })
          .eq("country_code", countryCode);
      }
    } catch (e) {
      console.warn("visitor_countries table insert/update failed:", e.message);
    }

    // 3. Persist to Supabase page_views (both country key and page name)
    try {
      // Country key in page_views
      const countryKey = `country:${countryCode}`;
      const { data: existingPVCountry } = await supabase
        .from("page_views")
        .select("view_count")
        .eq("page_name", countryKey)
        .maybeSingle();

      if (!existingPVCountry) {
        await supabase.from("page_views").insert({
          page_name: countryKey,
          view_count: 1,
          last_updated: now
        });
      } else {
        await supabase
          .from("page_views")
          .update({
            view_count: (Number(existingPVCountry.view_count) || 0) + 1,
            last_updated: now
          })
          .eq("page_name", countryKey);
      }

      // Page name in page_views
      const { data: existingPage } = await supabase
        .from("page_views")
        .select("view_count")
        .eq("page_name", pageName)
        .maybeSingle();

      if (!existingPage) {
        await supabase.from("page_views").insert({
          page_name: pageName,
          view_count: 1,
          last_updated: now
        });
      } else {
        await supabase
          .from("page_views")
          .update({
            view_count: (Number(existingPage.view_count) || 0) + 1,
            last_updated: now
          })
          .eq("page_name", pageName);
      }
    } catch (e) {
      console.warn("page_views table update failed:", e.message);
    }

    // 4. Return updated saved countries list
    const updatedCountries = await getSavedCountries(supabase);
    const totalHits = updatedCountries.reduce((acc, curr) => acc + curr.views, 0);

    return NextResponse.json({
      success: true,
      totalHits: Math.max(totalHits, 1),
      pageHits: 1,
      pageName,
      visitorCountry: countryCode,
      visitorFlag: flagEmoji,
      visitorCountryName: countryName,
      countries: updatedCountries
    });
  } catch (err) {
    console.error("POST pagehit error:", err);
    return NextResponse.json({
      success: false,
      totalHits: 120,
      pageHits: 1,
      pageName: "Home",
      visitorCountry: "ID",
      visitorFlag: "🇮🇩",
      visitorCountryName: "Indonesia",
      countries: readLocalCountryData()
    });
  }
}
