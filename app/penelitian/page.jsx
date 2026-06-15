import { Suspense } from "react";
import PageTracker from "@/components/PageTracker";
import PenelitianPengabdianClient from "@/components/PenelitianPengabdianClient";

export const metadata = {
    title: "Penelitian & Proyek Riset - M. Taufiq, M.Kom",
    description: "Portal dokumentasi penelitian dan proyek riset oleh M. Taufiq, M.Kom. Menyajikan kontribusi akademik nyata bagi perkembangan teknologi informasi.",
    alternates: {
        canonical: "/penelitian",
    },
};

export default function PenelitianPage() {
    return (
        <div className="bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 min-h-screen">
            <Suspense fallback={null}>
                <PageTracker name="Penelitian" />
            </Suspense>

            <main>
                {/* Header Banner (Server Side) */}
                <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white pt-32 pb-16 px-6 shadow-xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
                    
                    <div className="max-w-6xl mx-auto relative z-10 text-center">
                        <span className="px-4 py-1.5 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/30">
                            Tri Dharma Perguruan Tinggi
                        </span>
                        <h1 className="text-4xl md:text-5xl font-black mt-4 mb-3 tracking-tight">
                            Penelitian & Proyek Riset
                        </h1>
                        <p className="text-slate-300 max-w-2xl mx-auto font-medium text-sm md:text-base leading-relaxed">
                            Dokumentasi proyek riset dan publikasi ilmiah dalam pengembangan inovasi teknologi informasi.
                        </p>
                    </div>
                </div>

                {/* Main Client Content */}
                <div className="max-w-6xl mx-auto px-6 -mt-8 pb-24 relative z-20">
                    <Suspense fallback={
                        <div className="w-full py-24 flex items-center justify-center bg-white dark:bg-slate-900 rounded-3xl shadow-md border border-slate-100 dark:border-slate-800/50">
                            <div className="text-center">
                                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">Memuat modul interaktif...</p>
                            </div>
                        </div>
                    }>
                        <PenelitianPengabdianClient defaultTab="penelitian" hideTabs={true} />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
