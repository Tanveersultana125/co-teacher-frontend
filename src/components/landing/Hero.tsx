import { Search, Sparkles } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ScrollingShowcase } from "./ScrollingShowcase";

const Hero = () => {
  const navigate = useNavigate();

  const handleGenerate = () => {
    navigate("/for-teachers");
  };

  return (
    <section className="relative pt-24 pb-16 lg:pt-48 lg:pb-32 overflow-hidden bg-[#FFF6E5]">
      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-slate-900">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-sans font-black leading-[1.1] mb-6 tracking-tight">
            Plan Less, <span className="text-[#F97316] relative inline-block">Teach More <span className="absolute bottom-0 left-0 w-full h-[4px] bg-[#F97316]"></span></span>
          </h1>

          <p className="text-lg md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed text-slate-800 font-medium tracking-tight">
            Instantly generate curriculum-aligned lesson plans, quizzes, and worksheets tailored to your classroom.
          </p>

          <div className="flex justify-center relative z-20">
            <button
              className="bg-white hover:bg-white/95 text-slate-900 rounded-full px-8 sm:px-12 h-14 sm:h-16 flex items-center justify-center gap-3 font-bold text-lg sm:text-xl shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all border border-slate-100"
              onClick={handleGenerate}
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
              Generate Resources
            </button>
          </div>

        </div>

        <div className="mt-12 sm:mt-16 relative z-10 pointer-events-none select-none h-[400px] sm:h-[500px] w-full">
          <ScrollingShowcase />
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <p className="mt-8 sm:mt-12 text-sm sm:text-base opacity-70 font-semibold tracking-wide relative z-20 text-slate-600">
            Try it free — No credit card required
          </p>
        </div>
      </div>
    </section>
  );
};


export default Hero;
