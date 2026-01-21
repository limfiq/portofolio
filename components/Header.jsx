"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/about", label: "Tentang" },
    { href: "/publications", label: "Publikasi" },
    { href: "/activity", label: "Kegiatan" },
    { href: "/lecturer", label: "Pengajaran" },
    { href: "/project", label: "Proyek" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? "bg-white/70 backdrop-blur-md shadow-sm border-b border-white/20"
          : "bg-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          Portofolio
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 items-center">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors relative group ${isActive ? "text-blue-700" : "text-slate-600 hover:text-blue-700"
                  }`}
              >
                {link.label}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-700 transition-all duration-300 group-hover:w-full ${isActive ? "w-full" : ""}`}></span>
              </Link>
            )
          })}
          <Link
            href="/#contact"
            className="px-5 py-2.5 bg-blue-700 text-white text-sm font-medium rounded-full shadow-lg shadow-blue-700/20 hover:bg-blue-800 transform hover:-translate-y-0.5 transition-all"
          >
            Hubungi Saya
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-slate-700 hover:text-blue-700 focus:outline-none p-2"
        >
          <div className="w-6 h-5 relative flex flex-col justify-between">
            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`}></span>
            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? "opacity-0" : ""}`}></span>
            <span className={`w-full h-0.5 bg-current rounded-full transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-2.5" : ""}`}></span>
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-white/95 backdrop-blur-xl z-40 transition-transform duration-300 ease-in-out ${isMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        style={{ top: "80px" }}
      >
        <div className="flex flex-col p-8 gap-6 text-center">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-lg font-medium text-slate-700 hover:text-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/#contact"
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
