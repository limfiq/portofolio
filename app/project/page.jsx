import { Suspense } from "react";
import RecentProject from "@/components/RecentProject"
import DeveloperProjectClient from "@/components/DeveloperProjectClient"
import PageTracker from "@/components/PageTracker";


export default function Project() {
    return (
        <div className="bg-gray-50 text-gray-800">
            <Suspense fallback={null}>
                <PageTracker name="Proyek" />
            </Suspense>

            <main>
                <DeveloperProjectClient />
                <Suspense fallback={<div className="text-center py-10">Memuat proyek...</div>}>
                    <RecentProject />
                </Suspense>
            </main>
        </div>
    );
}
