import { useRef } from "react";
import Navbar from "@/components/landing/Navbar";
import { Button } from "@/components/ui/button";
import { PlayCircle, CheckCircle2, Presentation, GraduationCap, Clock, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const ForTeachers = () => {
    // Removed unused useScroll/useTransform to prevent potential hooks issues
    // const containerRef = useRef(null); 

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-teal-100/50">
            <Navbar />

            {/* Hero Section */}
            <section className="pt-32 pb-20 container mx-auto px-6 text-center">
                <div className="max-w-4xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider mb-6">
                        <Sparkles className="w-3 h-3" />
                        For Educators
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-8 leading-tight">
                        Raise standards and <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-emerald-600">reduce workload.</span>
                    </h1>
                    <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        Empower every teacher to create curriculum-aligned, consistent, and high-quality lessons, presentations, and assessments in seconds.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/login">
                            <Button size="lg" className="h-14 px-8 text-lg font-bold bg-[#0F766E] hover:bg-[#0D6E66] text-white rounded-full shadow-xl shadow-teal-200/50 transition-all hover:scale-105">
                                Start Free Trial
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-bold border-2 rounded-full hover:bg-slate-50 gap-2">
                            <PlayCircle className="w-5 h-5" />
                            Watch Demo
                        </Button>
                    </div>
                </div>

                {/* Video Placeholder */}
                <div className="mt-20 relative max-w-5xl mx-auto">
                    <div className="absolute inset-0 bg-teal-500 blur-[100px] opacity-20 -z-10 rounded-full" />
                    <div className="aspect-video bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border-8 border-white/50 ring-1 ring-slate-200 relative group cursor-pointer">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
                                <PlayCircle className="w-12 h-12 text-white fill-current" />
                            </div>
                        </div>
                        <img
                            src="https://images.unsplash.com/photo-1544533382-7c9b878021d0?q=80&w=2070&auto=format&fit=crop"
                            alt="Dashboard Preview"
                            className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute bottom-8 left-8 text-left">
                            <div className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-white/90 text-sm font-bold mb-2">
                                What's in the video?
                            </div>
                            <h3 className="text-2xl font-bold text-white">See how Co-Teacher automates lesson planning</h3>
                        </div>
                    </div>
                </div>
            </section>

            {/* Teal Banner Strip */}
            <div className="bg-[#0F766E] py-16 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="container mx-auto px-6 relative z-10">
                    <div className="grid md:grid-cols-3 gap-12 text-center">
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
                                <Clock className="w-8 h-8 text-teal-100" />
                            </div>
                            <h3 className="text-xl font-bold">Save 10+ Hours/Week</h3>
                            <p className="text-teal-100/80 leading-relaxed">Automate repetitive tasks like grading, lesson planning, and PPT creation.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
                                <Presentation className="w-8 h-8 text-teal-100" />
                            </div>
                            <h3 className="text-xl font-bold">Instant PPT Maker</h3>
                            <p className="text-teal-100/80 leading-relaxed">Generate beautiful, curriculum-aligned slide decks in seconds, not hours.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto backdrop-blur-sm">
                                <GraduationCap className="w-8 h-8 text-teal-100" />
                            </div>
                            <h3 className="text-xl font-bold">Improve Outcomes</h3>
                            <p className="text-teal-100/80 leading-relaxed">Focus on teaching while our AI ensures standards alignment and differentiation.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Section: PPT Maker Highlight */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="lg:w-1/2 space-y-8">
                            <div>
                                <h2 className="text-4xl font-black text-slate-900 mb-6">Built-in AI Presentation Maker</h2>
                                <p className="text-xl text-slate-600 leading-relaxed mb-8">
                                    Stop wrestling with PowerPoint. Just enter your topic, standard, and grade level. Co-Teacher generates a professional, editable slide deck complete with images, speaker notes, and interactive elements.
                                </p>
                                <div className="space-y-4">
                                    {[
                                        "Alignment with CBSE, ICSE, and IB curriculums",
                                        "Automatic image suggestions and layout design",
                                        "Export to PowerPoint or PDF instantly",
                                        "Real-time collaboration with colleagues"
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <CheckCircle2 className="w-6 h-6 text-teal-600 shrink-0" />
                                            <span className="font-bold text-slate-700">{item}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="pt-8">
                                    <Button className="bg-slate-900 text-white rounded-full px-8 h-12 font-bold hover:bg-slate-800">
                                        Try PPT Maker Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="lg:w-1/2">
                            <div className="bg-white rounded-2xl shadow-2xl p-4 border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
                                {/* CSS-based Graphic for AI Presentation Maker */}
                                <div className="aspect-[4/3] bg-slate-50 rounded-xl overflow-hidden border border-slate-200 flex flex-col shadow-inner relative">
                                    {/* Toolbar */}
                                    <div className="h-10 bg-white border-b border-slate-200 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                        <div className="w-px h-6 bg-slate-200 mx-2"></div>
                                        <div className="w-20 h-2 bg-slate-100 rounded-full"></div>
                                        <div className="w-20 h-2 bg-slate-100 rounded-full"></div>
                                        <div className="ml-auto flex items-center gap-2">
                                            <div className="px-2 py-1 bg-teal-50 text-teal-600 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" /> AI Active
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex overflow-hidden">
                                        {/* Sidebar Thumbnails */}
                                        <div className="w-24 bg-slate-50 border-r border-slate-200 p-3 flex flex-col gap-3">
                                            {[1, 2, 3].map((i) => (
                                                <div key={i} className={`aspect-video rounded border flex items-center justify-center relative ${i === 1 ? 'bg-white border-teal-500 ring-2 ring-teal-100' : 'bg-slate-100 border-slate-200 opacity-60'}`}>
                                                    <div className="w-1/2 h-1 bg-slate-300 rounded mb-1"></div>
                                                    {i === 1 && <div className="absolute -right-1 -top-1 w-3 h-3 bg-teal-500 rounded-full border-2 border-white"></div>}
                                                </div>
                                            ))}
                                        </div>
                                        {/* Main Slide Canvas */}
                                        <div className="flex-1 bg-slate-100/50 p-6 flex items-center justify-center relative">
                                            <div className="absolute inset-0 bg-grid-pattern opacity-[0.03]"></div>
                                            <div className="w-full aspect-video bg-white shadow-lg rounded-lg p-6 relative overflow-hidden">
                                                {/* Slide Content */}
                                                <div className="mb-4">
                                                    <div className="h-4 w-1/3 bg-slate-900 rounded mb-2"></div>
                                                    <div className="h-1 w-full bg-gradient-to-r from-teal-500 to-transparent"></div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="w-1/2 space-y-3">
                                                        <div className="h-2 w-full bg-slate-100 rounded"></div>
                                                        <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                                                        <div className="h-2 w-4/5 bg-slate-100 rounded"></div>
                                                        <div className="h-2 w-full bg-slate-100 rounded"></div>
                                                    </div>
                                                    <div className="w-1/2 bg-teal-50 rounded-lg flex items-center justify-center border border-teal-100 relative overflow-hidden group">
                                                        <div className="absolute inset-0 bg-gradient-to-tr from-teal-100/50 to-transparent"></div>
                                                        <Sparkles className="w-8 h-8 text-teal-500/50 group-hover:scale-110 transition-transform duration-500" />
                                                    </div>
                                                </div>

                                                {/* Cursor Animation */}
                                                <div className="absolute bottom-8 right-1/4 translate-x-1/2 translate-y-1/2 pointer-events-none">
                                                    <div className="w-4 h-4 bg-black rounded-full opacity-20 blur-sm absolute top-1 left-1"></div>
                                                    <svg className="w-6 h-6 text-slate-900 drop-shadow-md fill-current" viewBox="0 0 24 24"><path d="M5.5 3.21l12.32 12.32-4.32.73-3.23 6.94-2.5-1.16 3.14-6.73-5.41-1.02V3.21z" /></svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce-slow">
                                    <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-6 h-6 text-teal-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase">Status</p>
                                        <p className="font-bold text-slate-900">Slides Generated!</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Footer CTA */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="bg-[#0F766E] rounded-[3rem] overflow-hidden flex flex-col md:flex-row items-center relative shadow-2xl shadow-teal-900/20 group">
                        {/* Decorative background patterns */}
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 opacity-20 pointer-events-none" />
                        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-teal-400 rounded-full blur-[100px] opacity-10 pointer-events-none" />

                        <div className="md:w-3/5 p-12 md:p-20 relative z-10">
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                                Ready to transform <br className="hidden md:block" />
                                your teaching?
                            </h2>
                            <p className="text-xl text-teal-50/90 mb-10 max-w-lg leading-relaxed font-medium">
                                Join 250,000+ educators who are saving time and improving student outcomes with Co-Teacher's AI tools.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Link to="/login">
                                    <Button size="lg" className="h-16 px-12 rounded-full bg-white text-teal-900 hover:bg-teal-50 font-black text-xl shadow-2xl transition-all hover:scale-105 active:scale-95">
                                        Get Started Free
                                    </Button>
                                </Link>
                            </div>
                            <p className="text-teal-100/60 text-sm font-bold mt-2 italic">Trial includes 1 AI-generated lesson plan for free.</p>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2 text-teal-50/70 font-bold text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-teal-300" /> No credit card required
                                </div>
                                <div className="w-px h-4 bg-teal-50/20"></div>
                                <div className="flex items-center gap-2 text-teal-50/70 font-bold text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-teal-300" /> Cancel anytime
                                </div>
                            </div>
                        </div>

                        <div className="md:w-2/5 h-[400px] md:h-full min-h-[500px] relative overflow-hidden self-stretch">
                            <img
                                src="https://images.unsplash.com/photo-1544533382-7c9b878021d0?q=80&w=2070&auto=format&fit=crop"
                                alt="Modern Educator"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Gradient Overlays for smooth blending */}
                            <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-[#0F766E] to-transparent hidden md:block" />
                            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0F766E] to-transparent md:hidden" />

                            {/* Floating UI Elements for "Wow" factor */}
                            <div className="absolute bottom-8 right-8 bg-white/10 backdrop-blur-xl p-4 rounded-2xl border border-white/20 shadow-2xl hidden lg:block animate-bounce-slow">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Efficiency</p>
                                        <p className="text-sm font-black text-white">+10hrs saved/wk</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

        </div>
    );
};

export default ForTeachers;
