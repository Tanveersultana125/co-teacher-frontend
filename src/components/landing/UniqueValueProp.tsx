import { motion } from "framer-motion";
import { Sparkles, Sliders, CheckCircle2 } from "lucide-react";

const UniqueValueProp = () => {
    return (
        <section className="py-24 bg-[#FFE5D9] overflow-hidden">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">

                    {/* Right Visual - Layered App Interface (Now on Left) */}
                    <div className="flex-1 w-full relative">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                        >
                            {/* Decorative Blob */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-100/50 to-teal-100/50 rounded-full blur-3xl -z-10" />

                            {/* Main Interface Window */}
                            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden relative z-10">
                                {/* Window Header */}
                                <div className="h-10 border-b border-slate-100 bg-slate-50 flex items-center px-4 gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-amber-400" />
                                    <div className="w-3 h-3 rounded-full bg-emerald-400" />
                                </div>

                                {/* Window Body */}
                                <div className="p-6 bg-slate-50/50">
                                    <div className="flex justify-between items-center mb-6">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">Cell Biology: Osmosis</h3>
                                            <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Science • Grade 9</span>
                                        </div>
                                        <span className="bg-teal-50 text-[#0D5355] text-xs px-2 py-1 rounded font-bold">Generated</span>
                                    </div>

                                    {/* Mock Content */}
                                    <div className="space-y-4">
                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex gap-4">
                                            <div className="w-24 h-24 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                                <img src="/osmosis_diffusion_worksheet_card_1769609373988.png" alt="Osmosis" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="h-4 bg-slate-100 rounded w-3/4 mb-2" />
                                                <div className="h-2 bg-slate-50 rounded w-full mb-1" />
                                                <div className="h-2 bg-slate-50 rounded w-5/6" />
                                            </div>
                                        </div>

                                        <div className="bg-[#DBEAFE] p-6 rounded-2xl border border-[#93C5FD]">
                                            <h4 className="text-base font-bold text-[#1E56A0] mb-3 flex items-center gap-2">
                                                <Sparkles className="w-4 h-4" /> Teacher Tip
                                            </h4>
                                            <p className="text-sm text-indigo-900 leading-relaxed font-medium">
                                                Use this diagram to explain semi-permeable membranes.
                                                Ask students to label the water molecules moving across the gradient.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Floating "Settings" Card */}
                            <motion.div
                                className="absolute -right-6 md:-right-12 top-12 bg-white p-4 rounded-xl shadow-xl border border-slate-100 z-20 w-48"
                                initial={{ x: 20, opacity: 0 }}
                                whileInView={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-slate-500 font-semibold mb-1">Difficulty</div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full w-[70%] bg-[#1E56A0]" />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 font-semibold mb-1">Language</div>
                                        <div className="flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-50 px-2 py-1 rounded">
                                            English (US)
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                        </motion.div>
                    </div>

                    {/* Left Content (Now on Right) */}
                    <div className="flex-1 max-w-xl">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-600 text-sm font-bold mb-6">
                                <Sparkles className="w-4 h-4" />
                                <span>AI-Powered Customization</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-slate-900 mb-6 leading-tight">
                                Adapt content to <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1E56A0] to-teal-500">
                                    your classroom's needs
                                </span>
                            </h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Every class is different. Why should your materials be the same?
                                Co-Teacher allows you to modify difficulty levels, change languages,
                                and adapt examples to fit your local context locally in seconds.
                            </p>

                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-[#1E56A0]">
                                        <Sliders className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Adjust Difficulty</h4>
                                        <p className="text-sm text-slate-500">From beginner to advanced with one click.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                                        <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">Curriculum Aligned</h4>
                                        <p className="text-sm text-slate-500">Automatically mapped to your specific standards.</p>
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

export default UniqueValueProp;
