import { motion } from "framer-motion";
import { FileText, Presentation, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useNavigate } from "react-router-dom";

export const ExportOptions = () => {
    const navigate = useNavigate();

    return (
        <section className="py-24 bg-[#ECF9FF] overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Left Content */}
                    <div className="lg:w-1/2">
                        <h2 className="text-4xl font-bold text-slate-900 mb-6 font-display leading-tight">
                            Edit and present your lessons in Co-Teacher or your tool of choice.
                        </h2>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed font-medium">
                            We know teachers and schools often have their own preferences when it comes to technology. Edit and teach your lessons in Co-Teacher or you can export to PowerPoint, Google Slides, or PDF with the click of a button.
                        </p>
                        <Button
                            onClick={() => navigate('/login')}
                            className="bg-[#0D5355] hover:bg-[#083334] text-white rounded-full px-8 h-12 font-bold shadow-lg shadow-teal-200"
                        >
                            Try Generator Free
                        </Button>
                    </div>

                    {/* Right Visuals */}
                    <div className="lg:w-1/2 relative min-h-[500px] flex items-center justify-center">
                        {/* Glow Background */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-100/50 to-purple-100/50 rounded-full blur-[100px] opacity-60 z-0"></div>

                        {/* Cards Container - File Format Showcase */}
                        <div className="relative z-10 w-full max-w-2xl mx-auto h-[400px] flex items-center justify-center perspective-[1200px]">
                            <div className="relative flex items-center justify-center scale-110 md:scale-125 transform-style-3d" style={{ transformStyle: 'preserve-3d' }}>

                                {/* PowerPoint Icon - Left, Tilted Left */}
                                <motion.div
                                    initial={{ x: -80, opacity: 0, rotateY: 30, rotateX: 10, z: -50 }}
                                    whileInView={{ x: -140, opacity: 1, rotateY: 25, rotateX: 5, z: 0 }}
                                    animate={{ y: [0, -15, 0] }}
                                    transition={{
                                        y: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                                        default: { duration: 0.8, type: "spring" }
                                    }}
                                    className="absolute z-20 w-40 h-40 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center p-2 border-[6px] border-white/80 ring-1 ring-black/5"
                                >
                                    <div className="relative w-full h-full bg-gradient-to-br from-[#FF7E5F] to-[#D04423] rounded-[2rem] flex flex-col items-center justify-center overflow-hidden shadow-inner group">
                                        {/* Glossy Overlay */}
                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent opacity-80 rounded-t-[2rem]" />

                                        <div className="flex flex-col items-center gap-1 z-10 drop-shadow-md">
                                            <div className="w-16 h-16 bg-white rounded-xl shadow-lg flex items-center justify-center">
                                                <span className="text-[#D04423] font-heavy font-sans text-4xl font-bold tracking-tighter">P</span>
                                            </div>
                                            <span className="text-white/90 text-xs font-bold tracking-widest uppercase mt-2 drop-shadow-sm">PowerPoint</span>
                                        </div>
                                    </div>
                                    {/* Shadow for depth */}
                                    <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/20 blur-xl rounded-full" />
                                </motion.div>


                                {/* PDF Icon - Right, Tilted Right */}
                                <motion.div
                                    initial={{ x: 80, opacity: 0, rotateY: -30, rotateX: 10, z: -50 }}
                                    whileInView={{ x: 140, opacity: 1, rotateY: -25, rotateX: 5, z: 0 }}
                                    animate={{ y: [0, -12, 0] }}
                                    transition={{
                                        y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 },
                                        default: { duration: 0.8, delay: 0.2, type: "spring" }
                                    }}
                                    className="absolute z-10 w-36 h-36 bg-white rounded-[2.5rem] shadow-2xl flex items-center justify-center p-2 border-[6px] border-white/80 ring-1 ring-black/5"
                                >
                                    <div className="relative w-full h-full bg-[#F5F5F5] rounded-[2rem] flex flex-col items-center justify-center overflow-hidden shadow-inner group border border-slate-200">
                                        {/* Glossy Overlay */}
                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/40 to-transparent opacity-80 rounded-t-[2rem]" />

                                        <div className="flex flex-col items-center z-10 drop-shadow-sm">
                                            <FileText className="w-16 h-16 text-red-600 drop-shadow-sm mb-1" strokeWidth={1.5} fill="currentColor" fillOpacity={0.2} />
                                            <div className="mt-1 px-3 py-1 bg-red-100/50 rounded-full border border-red-200">
                                                <span className="text-red-700 font-bold text-[10px] tracking-widest uppercase">PDF</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Shadow for depth */}
                                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[80%] h-4 bg-black/10 blur-xl rounded-full" />
                                </motion.div>

                                {/* CSV Icon - Center, Front */}
                                <motion.div
                                    initial={{ y: 50, opacity: 0, scale: 0.8 }}
                                    whileInView={{ y: 0, opacity: 1, scale: 1.1, rotate: 0, z: 50 }}
                                    animate={{ y: [0, -20, 0] }}
                                    transition={{
                                        y: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
                                        default: { duration: 0.8, delay: 0.1, type: "spring" }
                                    }}
                                    className="relative z-30 w-48 h-48 bg-white rounded-[3rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.35)] flex items-center justify-center p-2 border-[8px] border-white ring-1 ring-black/5"
                                >
                                    <div className="relative w-full h-full bg-gradient-to-br from-[#34A853] to-[#1E8E3E] rounded-[2.5rem] flex flex-col items-center justify-center overflow-hidden shadow-inner group">
                                        <div className="absolute -left-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all duration-500" />
                                        {/* Glossy Overlay */}
                                        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/30 to-transparent opacity-90 rounded-t-[2.5rem]" />

                                        {/* CSV Icon Construction */}
                                        <div className="relative z-10 flex flex-col items-center gap-2 drop-shadow-xl">
                                            <FileJson className="w-20 h-20 text-white drop-shadow-md" strokeWidth={1.5} />
                                            <div className="px-4 py-1.5 bg-black/10 rounded-full backdrop-blur-md border border-white/10">
                                                <span className="text-white text-2xl font-heavy font-sans font-bold tracking-wider">CSV</span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Stronger Shadow for foreground element */}
                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[70%] h-6 bg-green-900/30 blur-2xl rounded-full" />
                                </motion.div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
