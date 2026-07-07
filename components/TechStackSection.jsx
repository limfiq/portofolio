import React from "react";

const techCategories = [
    {
        title: "Frontend Engineering",
        description: "Membangun antarmuka pengguna web interaktif dan responsif.",
        skills: [
            { name: "React", color: "hover:border-cyan-400 hover:text-cyan-500 hover:shadow-cyan-500/10" },
            { name: "Next.js", color: "hover:border-slate-800 dark:hover:border-slate-100 hover:text-slate-800 dark:hover:text-white" },
            { name: "Tailwind CSS", color: "hover:border-teal-400 hover:text-teal-500 hover:shadow-teal-500/10" },
            { name: "JavaScript", color: "hover:border-yellow-400 hover:text-yellow-500 hover:shadow-yellow-500/10" },
            { name: "HTML5 & CSS3", color: "hover:border-orange-400 hover:text-orange-500 hover:shadow-orange-500/10" },
            { name: "Bootstrap", color: "hover:border-purple-400 hover:text-purple-500 hover:shadow-purple-500/10" }
        ]
    },
    {
        title: "Backend & Cloud Systems",
        description: "Mendesain arsitektur server, API terstruktur, dan basis data tangguh.",
        skills: [
            { name: "Node.js", color: "hover:border-green-500 hover:text-green-500 hover:shadow-green-500/10" },
            { name: "Express", color: "hover:border-slate-500 hover:text-slate-600 dark:hover:text-slate-400" },
            { name: "PHP (CI / Laravel)", color: "hover:border-indigo-400 hover:text-indigo-500 hover:shadow-indigo-500/10" },
            { name: "PostgreSQL", color: "hover:border-blue-400 hover:text-blue-500 hover:shadow-blue-500/10" },
            { name: "MySQL", color: "hover:border-amber-500 hover:text-amber-500 hover:shadow-amber-500/10" },
            { name: "Supabase", color: "hover:border-emerald-400 hover:text-emerald-500 hover:shadow-emerald-500/10" }
        ]
    },
    {
        title: "Research, AI & Data Science",
        description: "Analisis data mendalam dan pemodelan kecerdasan buatan.",
        skills: [
            { name: "Python", color: "hover:border-yellow-500 hover:text-yellow-600 dark:hover:text-yellow-400" },
            { name: "Machine Learning", color: "hover:border-blue-500 hover:text-blue-600" },
            { name: "TensorFlow", color: "hover:border-orange-500 hover:text-orange-500 hover:shadow-orange-500/10" },
            { name: "Jupyter Notebook", color: "hover:border-orange-400 hover:text-orange-500" },
            { name: "LaTeX", color: "hover:border-slate-800 dark:hover:border-slate-100 hover:text-slate-900 dark:hover:text-white" },
            { name: "Data Analysis", color: "hover:border-sky-400 hover:text-sky-500" }
        ]
    },
    {
        title: "DevOps & Developer Tooling",
        description: "Otomatisasi pengujian, containerisasi, dan kontrol versi.",
        skills: [
            { name: "Git & GitHub", color: "hover:border-slate-800 dark:hover:border-slate-100 hover:text-slate-800 dark:hover:text-white" },
            { name: "Docker", color: "hover:border-sky-500 hover:text-sky-500 hover:shadow-sky-500/10" },
            { name: "Vercel", color: "hover:border-slate-800 dark:hover:border-slate-100 hover:text-slate-900 dark:hover:text-white" },
            { name: "RESTful API", color: "hover:border-violet-500 hover:text-violet-500" },
            { name: "VS Code", color: "hover:border-blue-500 hover:text-blue-500" }
        ]
    }
];

const TechStackSection = () => {
    return (
        <section className="py-24 bg-white dark:bg-slate-950 relative">
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider text-xs uppercase mb-3 block">
                        Keahlian & Teknologi
                    </span>
                    <h2 className="text-3xl md:text-4xl font-extrabold mb-6 text-slate-900 dark:text-white leading-tight">
                        Tech Stack Praktisi & Akademisi
                    </h2>
                    <p className="text-slate-600 dark:text-slate-350 text-sm md:text-base leading-relaxed">
                        Teknologi modern yang saya gunakan dalam pengembangan perangkat lunak komersial 
                        sekaligus sebagai bahan studi praktis dalam aktivitas pengajaran dan riset saya.
                    </p>
                </div>

                {/* Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {techCategories.map((category) => (
                        <div 
                            key={category.title} 
                            className="bg-slate-50/50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-850 p-6 md:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            <div>
                                <h3 className="text-lg font-bold text-slate-850 dark:text-slate-100 mb-2">
                                    {category.title}
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-450 mb-6">
                                    {category.description}
                                </p>
                            </div>
                            
                            <div className="flex flex-wrap gap-2.5 mt-auto">
                                {category.skills.map((skill) => (
                                    <span 
                                        key={skill.name}
                                        className={`px-3 py-1.5 rounded-lg border border-slate-200/60 dark:border-slate-800 text-xs font-semibold bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 transition-all duration-300 select-none cursor-default shadow-sm ${skill.color}`}
                                    >
                                        {skill.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default TechStackSection;
