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
  title: "Portofolio M. Taufiq, M.Kom - Lecturer and Developer",
  description: "Discover M. Taufiq, M.Kom's portfolio showcasing teaching, research, publications, projects, and academic activities in computer science and innovation.",
  metadataBase: new URL("https://limfiq.my.id"),
  alternates: {
    canonical: "/",
    languages: {
      en: "/",
    },
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Portofolio M. Taufiq, M.Kom - Lecturer and Developer",
    description: "Discover M. Taufiq, M.Kom's portfolio showcasing teaching, research, publications, projects, and academic activities in computer science and innovation.",
    url: "https://limfiq.my.id",
    siteName: "Portofolio M. Taufiq, M.Kom",
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
    <html lang="en" className="scroll-smooth" suppressHydrationWarning={true}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
        suppressHydrationWarning={true}
      >
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var theme = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {
                console.warn('Theme init failed', e);
              }
            })();`,
          }}
        />
        <SupabaseProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@graph": [
                  {
                    "@type": "Person",
                    name: "M. Taufiq, M.Kom",
                    url: "https://limfiq.my.id",
                    jobTitle: "Lecturer and Developer",
                    description:
                      "M. Taufiq, M.Kom is a computer science lecturer and developer showcasing teaching, research, publications, projects, and academic activities.",
                    sameAs: [
                      "https://limfiq.my.id"
                    ],
                  },
                  {
                    "@type": "Organization",
                    name: "Portofolio M. Taufiq, M.Kom",
                    url: "https://limfiq.my.id",
                    sameAs: [
                      "https://limfiq.my.id"
                    ],
                    logo: "https://limfiq.my.id/logo.png",
                    contactPoint: [
                      {
                        "@type": "ContactPoint",
                        contactType: "customer support",
                        email: "info@limfiq.my.id"
                      }
                    ]
                  }
                ]
              }),
            }}
          />
        </SupabaseProvider>
      </body>
    </html>
  );
}