import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const ProductPreview = () => {
    return (
        <section className="section-padding bg-[#ACBFA4] overflow-hidden">
            <div className="container mx-auto">
                <div className="relative max-w-6xl mx-auto">
                    {/* Glow behind the dashboard */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-slate-900 mb-6 font-display">Crafted for Excellence</h2>
                        <p className="text-lg text-slate-500 max-w-2xl mx-auto font-medium">Experience an interface that's as intelligent as your teaching. Clean, fast, and remarkably intuitive.</p>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="relative rounded-[2rem] border-[12px] border-slate-900/5 bg-slate-900 shadow-2xl overflow-hidden aspect-[16/10]"
                    >
                        {/* Mock Dashboard Representation */}
                        {/* 3-Column Feature Cards Layout */}
                        <div className="absolute inset-0 bg-slate-50 flex flex-col justify-center p-8 overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full items-center">
                                {/* Card 1: Lessons */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="bg-[#FFF5F5] rounded-3xl p-6 h-full flex flex-col hover:shadow-xl transition-all duration-300 group"
                                >
                                    <div className="mb-6 transform group-hover:scale-105 transition-transform duration-500 overflow-hidden rounded-xl bg-white shadow-sm">
                                        <img
                                            src="/features/premium_export_slides.png"
                                            alt="Resource Generation"
                                            className="w-full h-auto object-cover"
                                        />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Lessons</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-grow">
                                        Create fun, accurate, and classroom-ready slides. Instantly align to Common Core or your specific state standards.
                                    </p>
                                </motion.div>

                                {/* Card 2: Lesson Series */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="bg-[#FFE4D6] rounded-3xl p-6 h-full flex flex-col hover:shadow-xl transition-all duration-300 group"
                                >
                                    <div className="mb-6 transform group-hover:scale-105 transition-transform duration-500 overflow-hidden rounded-xl bg-white shadow-sm">
                                        <img
                                            src="/features/premium_export_slides.png"
                                            alt="Resource Generation"
                                            className="w-full h-auto object-cover"
                                        />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Lesson series</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-grow">
                                        Want to plan an entire unit? Create an ordered series of lessons on complex topics complete with recaps and quizzes.
                                    </p>
                                </motion.div>

                                {/* Card 3: Activity Sheets */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-[#E0F2F1] rounded-3xl p-6 h-full flex flex-col hover:shadow-xl transition-all duration-300 group"
                                >
                                    <div className="mb-6 transform group-hover:scale-105 transition-transform duration-500 overflow-hidden rounded-xl bg-white shadow-sm">
                                        <img
                                            src="/features/activity_sheet_mockup.png"
                                            alt="Activity Worksheet"
                                            className="w-full h-auto object-cover"
                                        />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Activity sheets</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed mb-4 flex-grow">
                                        Generate engaging activities to go with your lessons. Ready to share, export or print.
                                    </p>
                                    <Link to="/login" className="text-indigo-600 font-bold text-sm hover:underline flex items-center gap-1 group/btn">
                                        Learn more <span className="transition-transform group-hover/btn:translate-x-1">&gt;</span>
                                    </Link>

                                </motion.div>
                            </div>
                        </div>

                        {/* Interactive Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-primary/10 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-opacity duration-500 cursor-pointer">
                            <Button className="btn-premium rounded-full px-8 py-6 text-lg h-auto" asChild>
                                <Link to="/signup">Explore the Dashboard</Link>
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default ProductPreview;

