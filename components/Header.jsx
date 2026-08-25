"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [theme, setTheme] = useState("light");
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Theme Toggler logic
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && systemPrefersDark)) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    } else {
      setTheme("light");
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  const navLinks = [
    { href: "/project", label: "Proyek Riset" },
    {
      label: "PPM",
      submenu: [
        { href: "/publications", label: "Publikasi" },
        { href: "/penelitian", label: "Penelitian" },
        { href: "/pengabdian", label: "Pengabdian" },
        { href: "/awards", label: "Penghargaan" },
        { href: "/gallery", label: "Galeri" },
      ]
    },
    { href: "/lecturer", label: "Pengajaran" },
    { href: "/blog", label: "Tulisan" },
    { href: "/loker", label: "Loker IT" },
    {
      label: "Aplikasi",
      submenu: [
        {
          href: "https://pos.limfiq.my.id",
          label: "Aplikasi POS",
          desc: "Point of Sale & Kasir",
          icon: "🛒",
          external: true
        },
        {
          href: "https://posyandu.limfiq.my.id",
          label: "Aplikasi Posyandu",
          desc: "Layanan Kesehatan Balita",
          icon: "👶",
          external: true
        },
        {
          href: "https://sdidarulfaizin.my.id",
          label: "SDIT Darul Faizin",
          desc: "Sistem Informasi Sekolah",
          icon: "🏛️",
          external: true
        },
      ]
    },
  ];

  const darkPages = [
    "/publications",
    "/activity",
    "/penelitian-pengabdian",
    "/lecturer",
    "/penelitian",
    "/pengabdian",
    "/loker",
    "/blog",
    "/awards",
    "/gallery",
  ];

  const isDarkPage = darkPages.includes(pathname);
  const isTextWhite = !isScrolled && isDarkPage;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/70 dark:bg-slate-900/70 backdrop-blur-md shadow-sm border-b border-slate-100 dark:border-slate-800/40"
        : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link
          href="/"
          className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent hover:opacity-80 transition-opacity ${isTextWhite ? "from-white to-blue-200" : "from-blue-700 to-indigo-600 dark:from-blue-400 dark:to-indigo-300"
            }`}
        >
          Portofolio
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-7 items-center">
          {navLinks.map((link) => {
            if (link.submenu) {
              const isSubActive = link.submenu.some(sub => pathname === sub.href);
              const hasExternal = link.submenu.some(sub => sub.external);
              return (
                <div key={link.label} className="relative group">
                  <button className={`flex items-center gap-1 text-sm font-medium transition-colors py-2 ${isTextWhite
                    ? isSubActive ? "text-white" : "text-white/80 hover:text-white"
                    : isSubActive ? "text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400"
                    }`}>
                    {link.label}
                    <svg className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isTextWhite ? "bg-white" : "bg-blue-700 dark:bg-blue-400"
                      } ${isSubActive ? "w-full" : ""}`}></span>
                  </button>
                  <div className={`absolute top-full left-0 mt-2 ${hasExternal ? 'w-60 p-1.5' : 'w-48'} bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 overflow-hidden transform origin-top-left scale-95 group-hover:scale-100 flex flex-col z-50`}>
                    {link.submenu.map(sub => {
                      if (sub.external) {
                        return (
                          <a
                            key={sub.href}
                            href={sub.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 flex items-center justify-between group/item transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              {sub.icon && <span className="text-base">{sub.icon}</span>}
                              <div className="text-left">
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover/item:text-blue-600 dark:group-hover/item:text-blue-400 transition-colors">
                                  {sub.label}
                                </div>
                                {sub.desc && (
                                  <div className="text-[10px] text-slate-400 dark:text-slate-400 font-normal">
                                    {sub.desc}
                                  </div>
                                )}
                              </div>
                            </div>
                            <svg className="w-3.5 h-3.5 text-slate-400 group-hover/item:text-blue-500 group-hover/item:translate-x-0.5 group-hover/item:-translate-y-0.5 transition-all flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        );
                      }
                      return (
                        <Link key={sub.href} href={sub.href} className={`px-4 py-3 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 ${pathname === sub.href ? 'text-blue-700 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-slate-700 dark:text-slate-300'}`}>
                          {sub.label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors relative group py-2 ${isTextWhite
                  ? isActive ? "text-white" : "text-white/80 hover:text-white"
                  : isActive ? "text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400"
                  }`}
              >
                {link.label}
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 transition-all duration-300 group-hover:w-full ${isTextWhite ? "bg-white" : "bg-blue-700 dark:bg-blue-400"
                  } ${isActive ? "w-full" : ""}`}></span>
              </Link>
            )
          })}

          {/* Theme Toggler */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-all duration-300 hover:scale-105 active:scale-95 ${isTextWhite
              ? "border-white/20 text-white hover:bg-white/10"
              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <Link
            href="/contact"
            className="px-5 py-2.5 bg-blue-700 text-white text-sm font-medium rounded-full shadow-lg shadow-blue-700/20 hover:bg-blue-800 transform hover:-translate-y-0.5 transition-all"
          >
            Hubungi Saya
          </Link>
        </div>

        {/* Mobile Menu Controls */}
        <div className="flex md:hidden items-center gap-4">
          {/* Mobile Theme Toggler */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-full border transition-all duration-300 ${isTextWhite
              ? "border-white/20 text-white hover:bg-white/10"
              : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
              }`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 7a5 5 0 100 10 5 5 0 000-10z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Burger Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`focus:outline-none p-2 ${isTextWhite ? "text-white hover:text-white/80" : "text-slate-700 dark:text-slate-300 hover:text-blue-700"
              }`}
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
              <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`}></span>
              <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2.5" : ""}`}></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl z-40 transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        style={{ top: "80px" }}
      >
        <div className="flex flex-col p-8 gap-6 text-center overflow-y-auto h-full pb-32">
          {navLinks.map((link) => {
            if (link.submenu) {
              return (
                <div key={link.label} className="flex flex-col items-center gap-4">
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{link.label}</span>
                  {link.submenu.map(sub => {
                    if (sub.external) {
                      return (
                        <a
                          key={sub.href}
                          href={sub.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-medium text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 flex items-center justify-center gap-2"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          {sub.icon && <span>{sub.icon}</span>}
                          <span>{sub.label}</span>
                          <svg className="w-3.5 h-3.5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      );
                    }
                    return (
                      <Link
                        key={sub.href}
                        href={sub.href}
                        className="text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                  <div className="w-12 h-px bg-slate-200 dark:bg-slate-700 mt-2"></div>
                </div>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className="text-lg font-medium text-slate-700 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="px-6 py-3 bg-blue-700 text-white font-medium rounded-full shadow-lg shadow-blue-700/20 active:scale-95 transition-transform"
          >
            Hubungi Saya
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
