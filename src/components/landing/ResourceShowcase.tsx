import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, PlayCircle, BookOpen, Layers, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const RESOURCES = [
    {
        title: "The Human Heart: Valves",
        category: "Lessons",
        description: "Create fun, accurate, and classroom-ready slides. Instantly align to Common Core or your specific state standards. Generate engaging activities to go with your lessons. Ready to share, export or print.",
        type: "Lesson Plan",
        image: "/features/premium_export_slides.png",
        theme: "rose",
        bg: "bg-[#A5C89E]", // Sage Green
        accent: "text-rose-600",
        style: "floating-ui",
        subtext: "Why Valves Matter"
    },
    {
        title: "Introduction to Plant Cells and Their Roles",
        category: "Lesson series",
        description: "Want to plan an entire unit? Create an ordered series of lessons on complex topics complete with recaps and quizzes.",
        type: "Unit Plan",
        image: "/features/premium_resource_export.png",
        theme: "orange",
        bg: "bg-[#FFDAC1]",
        accent: "text-orange-900",
        style: "floating-ui"
    },
    {
        title: "The Future of AI Knowledge Check",
        category: "Activity sheets",
        description: "Generate engaging activities to go with your lessons. Ready to share, export or print.",
        type: "Worksheet",
        image: "/educational-flashcards.png", // Fallback Asset
        theme: "teal",
        bg: "bg-[#81C7D4]", // Strong Teal
        accent: "text-teal-900",
        style: "stacked-teal"
    }
];

const ResourceShowcase = () => {
    return (
        <section className="py-24 bg-[#FCF5EE] overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="text-center max-w-3xl mx-auto mb-16">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-3xl md:text-5xl font-display font-bold text-slate-900 mb-6"
                    >
                        Everything you need to <span className="text-[#1E56A0]">teach, assess, and differentiate learning...</span>
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-lg text-slate-600"
                    >
                        No more formatting nightmares. Co-Teacher generates beautiful, printable, and shareable resources instantly.
                    </motion.p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {RESOURCES.map((resource, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group flex flex-col"
                        >
                            {/* Visual Card Area */}
                            <div className={`${resource.bg} rounded-[2rem] p-8 aspect-[4/5] relative overflow-hidden transition-transform duration-500 hover:-translate-y-2 mb-6 flex items-center justify-center`}>

                                {/* Background Decorative Blobs */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/40 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />

                                {/* Render Style: Floating UI (Heart) */}
                                {resource.style === "floating-ui" && (
                                    <div className="relative w-full max-w-[240px] perspective-1000">
                                        {/* Main Document Card */}
                                        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100 relative z-10 rotate-[-2deg] transition-transform duration-500 group-hover:rotate-0">
                                            <div className="h-2 bg-rose-500 w-full" />
                                            <div className="p-4">
                                                <h4 className="font-bold text-slate-900 text-lg leading-tight mb-1">{resource.title}</h4>
                                                <p className="text-xs text-slate-500 mb-3">{resource.subtext || "Anatomy & Function"}</p>
                                                <div className="w-full aspect-video bg-rose-50 rounded-lg mb-3 overflow-hidden">
                                                    <img src={resource.image} alt="" className="w-full h-full object-cover mix-blend-multiply opacity-80" />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                                                    <div className="h-1.5 w-3/4 bg-slate-100 rounded-full" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Floating Pills */}
                                        <motion.div
                                            animate={{ y: [0, -5, 0] }}
                                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                            className="absolute -right-4 top-12 bg-white rounded-lg shadow-lg border border-slate-100 p-2 flex items-center gap-2 z-20 max-w-[160px]"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                                <BookOpen className="w-3 h-3" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-700">Learning goals</span>
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto" />
                                        </motion.div>

                                        <motion.div
                                            animate={{ y: [0, 5, 0] }}
                                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                            className="absolute -left-4 bottom-8 bg-white rounded-lg shadow-lg border border-slate-100 p-2 flex items-center gap-2 z-20 max-w-[160px]"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                                                <PlayCircle className="w-3 h-3" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-700">Video explanation</span>
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-auto" />
                                        </motion.div>
                                    </div>
                                )}

                                {/* Render Style: Stacked (Orange/Teal) */}
                                {(resource.style === "stacked" || resource.style === "stacked-teal") && (
                                    <div className="relative w-full max-w-[220px]">
                                        {/* Stack Layers */}
                                        <div className="absolute top-0 left-0 w-full h-full bg-white rounded-xl shadow-md border border-slate-200 rotate-[6deg] opacity-60 scale-90 translate-x-4 translate-y-2" />
                                        <div className="absolute top-0 left-0 w-full h-full bg-white rounded-xl shadow-md border border-slate-200 rotate-[3deg] opacity-80 scale-95 translate-x-2 translate-y-1" />

                                        {/* Main Card */}
                                        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-slate-100 relative z-10 transition-transform duration-500 group-hover:-translate-y-1">
                                            <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                                                <img src={resource.image} alt="" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                                <div className="absolute bottom-3 left-3 text-white">
                                                    <p className="text-[10px] font-medium opacity-90 uppercase tracking-wider">{resource.type}</p>
                                                    <p className="text-sm font-bold">{resource.title}</p>
                                                </div>
                                            </div>
                                            <div className="p-3">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-5 h-5 rounded-full bg-slate-200" />
                                                    <div className="text-[10px] text-slate-500 font-medium">Create by Co-Teacher</div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">Grade 8</span>
                                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] font-medium text-slate-600">Biology</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Floating Badge */}
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            className={`absolute -right-6 bottom-8 bg-white rounded-lg shadow-xl p-2 flex items-center gap-3 z-20 pr-4 animate-in slide-in-from-bottom-2 fade-in duration-700`}
                                        >
                                            <div className={`w-8 h-8 rounded bg-${resource.theme === 'orange' ? 'orange' : 'teal'}-100 flex items-center justify-center text-${resource.theme === 'orange' ? 'orange' : 'teal'}-600 shrink-0`}>
                                                {resource.theme === 'orange' ? <Layers className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-500 leading-none mb-0.5">Includes</p>
                                                <p className="text-xs font-bold text-slate-900 leading-none">
                                                    {resource.theme === 'orange' ? '3 Lessons' : 'Activity Sheet'}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </div>
                                )}

                            </div>

                            {/* Text Content */}
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                    {resource.category}
                                </h3>
                                <p className="text-slate-600 leading-relaxed mb-4">
                                    {resource.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default ResourceShowcase;
