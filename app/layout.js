import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SupabaseProvider } from "./supabase-provider";
import LayoutWrapper from "@/components/LayoutWrapper";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Portofolio M. Taufiq, M.Kom",
  description: "Welcome to my personal portfolio website!",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Portofolio M. Taufiq, M.Kom",
    description: "Welcome to my personal portfolio website!",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Portfolio Preview",
      },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning={true}
      >
        <SupabaseProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </SupabaseProvider>
      </body>
    </html>
  );
}