import { motion } from "framer-motion";
import { Check, ChevronDown, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const CurriculumStandards = () => {
    return (
        <section className="py-24 bg-[#FFCE99] overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* Left Content */}
                    <div className="flex-1 max-w-xl order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <h3 className="text-[#FF5757] font-bold text-sm mb-4 tracking-widest uppercase font-display">
                                Hit Your Teaching Objectives
                            </h3>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6 leading-tight">
                                Lessons aligned to <br />
                                <span className="text-[#1E56A0]">national & state standards</span>
                            </h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Align lessons to your specific curriculum frameworks instantly.
                                Whether you teach CBSE, ICSE, or International Boards, teach with confidence
                                knowing that your content is always rigorous and compliant.
                            </p>

                            <div className="space-y-4">
                                {[
                                    "Automatic mapping to learning objectives",
                                    "Coverage for CBSE, ICSE, and State Boards",
                                    "Gap analysis to identify missing topics"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                                            <Check className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="text-slate-700 font-medium">{item}</span>
                                    </div>
                                ))}
                            </div>

                        </motion.div>
                    </div>

                    {/* Right Visual - UI Mockup */}
                    <div className="flex-1 w-full relative order-1 lg:order-2">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                        >
                            {/* Background Decoration Blob */}
                            <div className="absolute -right-20 -top-20 w-[120%] h-[120%] bg-rose-50 rounded-[4rem] -z-10 rotate-3" />

                            {/* Floating Badge */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: -40, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 bg-white px-6 py-3 rounded-xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-slate-100 flex items-center gap-3 whitespace-nowrap"
                            >
                                <span className="text-2xl">📚</span>
                                <span className="font-bold text-slate-900">Align to curriculum standards</span>
                            </motion.div>

                            {/* Main Interface Card */}
                            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative z-20">
                                {/* Header */}
                                <div className="p-8 pb-4 text-center border-b border-slate-50">
                                    <h3 className="text-2xl font-bold text-slate-900 mb-1">Align your lesson</h3>
                                    <p className="text-slate-500 text-sm">Pick your learning standards</p>
                                </div>

                                {/* Inputs */}
                                <div className="p-8 bg-slate-50/50 space-y-6">

                                    {/* Selector Row */}
                                    <div className="flex gap-4">
                                        <div className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 flex justify-between items-center">
                                            Grade 10 <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </div>
                                        <div className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 flex justify-between items-center">
                                            Science <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <Link
                                            to="/login"
                                            className="absolute right-0 top-0 text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded cursor-pointer hover:bg-indigo-100 transition-colors"
                                        >
                                            Can't see a standard?
                                        </Link>

                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 mt-2">
                                            Selected Standards (2)
                                        </div>

                                        {/* Standard Item 1 */}
                                        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm mb-3 flex gap-4 relative overflow-hidden group hover:border-emerald-300 transition-colors">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-slate-900 mb-1">SCI.10.CHEM.01</div>
                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                    Chemical Reactions: Identify and balance chemical equations and understand types of reactions.
                                                </p>
                                            </div>
                                            <div className="shrink-0 pt-1">
                                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                                    <Check className="w-3 h-3" strokeWidth={3} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Standard Item 2 */}
                                        <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-sm flex gap-4 relative overflow-hidden group hover:border-emerald-300 transition-colors">
                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                                            <div className="flex-1">
                                                <div className="text-xs font-bold text-slate-900 mb-1">SCI.10.ACID.02</div>
                                                <p className="text-xs text-slate-600 leading-relaxed">
                                                    Acids, Bases and Salts: Understanding pH scale and importance of pH in everyday life.
                                                </p>
                                            </div>
                                            <div className="shrink-0 pt-1">
                                                <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                                                    <Check className="w-3 h-3" strokeWidth={3} />
                                                </div>
                                            </div>
                                        </div>

                                    </div>

                                </div>
                            </div>
                        </motion.div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default CurriculumStandards;
