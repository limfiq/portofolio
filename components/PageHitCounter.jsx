"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

// Helper to map pathname to friendly page names matching DB seeds
function getPageNameFromPath(pathname) {
  if (!pathname || pathname === "/") return "Home";
  if (pathname.startsWith("/publications")) return "Publikasi";
  if (pathname.startsWith("/penelitian-pengabdian")) return "Penelitian & Pengabdian";
  if (pathname.startsWith("/penelitian")) return "Penelitian";
  if (pathname.startsWith("/pengabdian")) return "Pengabdian";
  if (pathname.startsWith("/project")) return "Proyek";
  if (pathname.startsWith("/blog")) return "Blog";
  if (pathname.startsWith("/activity")) return "Aktivitas";
  if (pathname.startsWith("/awards")) return "Penghargaan";
  if (pathname.startsWith("/gallery")) return "Galeri";
  if (pathname.startsWith("/lecturer")) return "Pengajaran";
  if (pathname.startsWith("/loker")) return "Loker";
  if (pathname.startsWith("/contact")) return "Kontak";
  if (pathname.startsWith("/about")) return "Tentang";

  const segment = pathname.split("/").filter(Boolean)[0] || "Home";
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

// Quick fallback country detection from client timezone
function detectClientCountry() {
  if (typeof window === "undefined") return "ID";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Jakarta") || tz.includes("Makassar") || tz.includes("Jayapura") || tz.includes("Pontianak")) return "ID";
    if (tz.includes("Singapore")) return "SG";
    if (tz.includes("Kuala_Lumpur") || tz.includes("Kuching")) return "MY";
    if (tz.includes("Tokyo")) return "JP";
    if (tz.includes("London")) return "GB";
    if (tz.includes("Sydney") || tz.includes("Melbourne") || tz.includes("Brisbane") || tz.includes("Perth")) return "AU";
    if (tz.includes("Berlin") || tz.includes("Frankfurt")) return "DE";
    if (tz.includes("Amsterdam")) return "NL";
    if (tz.includes("Paris")) return "FR";
    if (tz.includes("Seoul")) return "KR";
    if (tz.includes("New_York") || tz.includes("Chicago") || tz.includes("Los_Angeles") || tz.includes("Denver")) return "US";
  } catch (_) {}
  return "ID";
}

export default function PageHitCounter() {
  const pathname = usePathname();
  const [stats, setStats] = useState({
    totalHits: 0,
    pageHits: 0,
    pageName: "Home",
    visitorCountry: "ID",
    visitorFlag: "🇮🇩",
    visitorCountryName: "Indonesia",
    countries: []
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const pageName = getPageNameFromPath(pathname);

  useEffect(() => {
    let isMounted = true;

    async function loadHits() {
      try {
        const sessionKey = `visited_${pageName}`;
        const hasVisited = typeof window !== "undefined" && sessionStorage.getItem(sessionKey);
        const localCountry = detectClientCountry();

        let res;
        if (!hasVisited) {
          // Record hit (POST) with country code
          res = await fetch("/api/pagehit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pageName, countryCode: localCountry })
          });
          if (typeof window !== "undefined") {
            sessionStorage.setItem(sessionKey, "true");
          }
        } else {
          // Only read (GET) to avoid duplicate increments
          res = await fetch(`/api/pagehit?page=${encodeURIComponent(pageName)}`);
        }

        if (res.ok && isMounted) {
          const data = await res.json();
          setStats({
            totalHits: data.totalHits || 0,
            pageHits: data.pageHits || 0,
            pageName: data.pageName || pageName,
            visitorCountry: data.visitorCountry || "ID",
            visitorFlag: data.visitorFlag || "🇮🇩",
            visitorCountryName: data.visitorCountryName || "Indonesia",
            countries: data.countries || []
          });
        }
      } catch (err) {
        console.error("Failed to load Flag Counter data:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadHits();

    return () => {
      isMounted = false;
    };
  }, [pageName]);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/pagehit?page=${encodeURIComponent(pageName)}`);
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalHits: data.totalHits || 0,
          pageHits: data.pageHits || 0,
          pageName: data.pageName || pageName,
          visitorCountry: data.visitorCountry || "ID",
          visitorFlag: data.visitorFlag || "🇮🇩",
          visitorCountryName: data.visitorCountryName || "Indonesia",
          countries: data.countries || []
        });
      }
    } catch (err) {
      console.error("Failed to refresh Flag Counter:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num && num !== 0) return "...";
    return Number(num).toLocaleString("id-ID");
  };

  const topCountry = stats.countries[0] || { flag: "🇮🇩", code: "ID" };

  // 1. Minimized State (tiny button on right edge)
  if (isMinimized) {
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <button
          onClick={() => setIsMinimized(false)}
          className="group flex flex-col items-center justify-center gap-1 w-8 h-16 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-l border-t border-b border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-l-xl shadow-xl hover:w-10 transition-all focus:outline-none"
          title="Buka Flag Counter"
          aria-label="Buka Flag Counter"
        >
          <span className="text-sm">{topCountry.flag}</span>
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none flex items-center">
      {/* 2. Expanded Flag Counter Window (Like WordPress FlagCounter) */}
      {isOpen && (
        <div className="absolute right-full mr-2 w-80 sm:w-96 max-h-[85vh] flex flex-col rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden transition-all animate-in fade-in slide-in-from-right-4 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center text-sm shadow-sm">
                🚩
              </div>
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-1.5">
                  Flag Counter
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded-full">
                    Live
                  </span>
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Pengunjung Berdasarkan Negara</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                title="Perbarui Data"
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                aria-label="Perbarui data"
              >
                <svg className={`w-3.5 h-3.5 ${isLoading ? "animate-spin text-blue-600" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Tutup"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                aria-label="Tutup Flag Counter"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Top Summary Bar */}
          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-center">
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Total Hits</div>
              <div className="text-sm font-black text-blue-700 dark:text-blue-400">
                {formatNumber(stats.totalHits)}
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Negara</div>
              <div className="text-sm font-black text-amber-600 dark:text-amber-400">
                {stats.countries.length} 🏳️
              </div>
            </div>
            <div className="p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
              <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">Halaman Ini</div>
              <div className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                {formatNumber(stats.pageHits)}
              </div>
            </div>
          </div>

          {/* Country Leaderboard List */}
          <div className="p-3 overflow-y-auto max-h-64 space-y-2 divide-y divide-slate-100 dark:divide-slate-800/60">
            {stats.countries.map((item, idx) => (
              <div key={item.code} className="pt-2 first:pt-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`w-4 text-[10px] font-bold ${idx === 0 ? "text-amber-500" : "text-slate-400"}`}>
                      {idx === 0 ? "🥇" : `#${idx + 1}`}
                    </span>
                    <span className="text-base leading-none">{item.flag}</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {item.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">({item.code})</span>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0 text-right">
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">
                      {formatNumber(item.views)}
                    </span>
                    <span className="text-[10px] text-slate-400 w-10 text-right">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600"
                        : "bg-blue-400 dark:bg-blue-500"
                    }`}
                    style={{ width: `${Math.min(Math.max(item.percentage, 4), 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          {/* Current Visitor Location Badge */}
          <div className="px-3 py-2 bg-blue-50/70 dark:bg-blue-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">
              <span>📍 Lokasi Anda:</span>
              <span className="text-base leading-none">{stats.visitorFlag}</span>
              <span className="font-bold text-blue-700 dark:text-blue-400">{stats.visitorCountryName}</span>
            </span>
            <span className="text-[9px] uppercase font-bold text-blue-600 dark:text-blue-300 bg-blue-100/80 dark:bg-blue-900/60 px-1.5 py-0.5 rounded">
              Detected
            </span>
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50/90 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <span>⚡</span> Flag Counter Widget
            </span>
            <button
              onClick={() => {
                setIsOpen(false);
                setIsMinimized(true);
              }}
              className="hover:underline text-slate-500 dark:text-slate-400 hover:text-blue-600"
            >
              Kecilkan Tab
            </button>
          </div>
        </div>
      )}

      {/* 3. Floating Trigger Pill on Right Edge */}
      <div className="group relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 pl-3 pr-2.5 py-2.5 rounded-l-2xl border-l border-t border-b shadow-2xl transition-all transform hover:-translate-x-1 duration-200 focus:outline-none ${
            isOpen
              ? "bg-blue-600 text-white border-blue-500 shadow-blue-500/20"
              : "bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
          title="Klik untuk membuka statistik pengunjung per negara (Flag Counter)"
          aria-label="Buka Flag Counter"
        >
          {/* Live pulsing dot */}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>

          {/* Flags Preview */}
          <div className="flex items-center -space-x-1 text-sm">
            <span className="relative z-10 leading-none">{topCountry.flag}</span>
            {stats.countries[1] && (
              <span className="relative z-0 leading-none opacity-80 scale-90">{stats.countries[1].flag}</span>
            )}
          </div>

          {/* Counter Text */}
          <div className="flex flex-col items-start leading-none pr-0.5">
            <div className="flex items-center gap-1">
              <span className={`text-[8px] font-extrabold uppercase tracking-wider ${isOpen ? "text-blue-100" : "text-amber-600 dark:text-amber-400"}`}>
                🚩 Flags
              </span>
              <span className={`text-[9px] font-bold ${isOpen ? "text-blue-200" : "text-slate-400 dark:text-slate-500"}`}>
                ({stats.countries.length || 1})
              </span>
            </div>
            <span className="text-xs font-black tracking-tight mt-0.5">
              {isLoading && stats.totalHits === 0 ? "..." : formatNumber(stats.totalHits)}
            </span>
          </div>

          {/* Chevron Indicator */}
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-white" : "text-slate-400 group-hover:-translate-x-0.5"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
