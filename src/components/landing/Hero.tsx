import { Search, Sparkles } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { ScrollingShowcase } from "./ScrollingShowcase";

const Hero = () => {
  const navigate = useNavigate();

  const handleGenerate = () => {
    navigate("/login");
  };

  return (
    <section className="relative pt-24 pb-16 lg:pt-48 lg:pb-32 overflow-hidden bg-[#faf9ff] tech-pattern">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="tech-ribbon" style={{ top: '5%', left: '-10%', transform: 'rotate(-25deg)', animationDuration: '25s' }} />
        <div className="tech-ribbon" style={{ top: '35%', left: '15%', opacity: 0.1, transform: 'rotate(10deg)', animationDuration: '30s' }} />
        <div className="tech-ribbon" style={{ top: '65%', left: '-15%', transform: 'rotate(-5deg)', animationDuration: '20s' }} />
        <div className="tech-ribbon" style={{ top: '85%', left: '0%', opacity: 0.05, transform: 'rotate(20deg)', animationDuration: '35s' }} />

        {/* Sparkles */}
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="sparkle-particle"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              '--duration': `${2 + Math.random() * 4}s`
            } as any}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 lg:px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center text-slate-900">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-sans font-black leading-[1.1] mb-6 tracking-tight text-[#3d3151]">
            Plan Less, <span className="text-[#ec8c6b] relative inline-block">Teach More <span className="absolute bottom-0 left-0 w-full h-[4px] bg-[#ec8c6b]"></span></span>
          </h1>

          <p className="text-lg md:text-2xl mb-10 max-w-2xl mx-auto leading-relaxed text-slate-800 font-medium tracking-tight">
            Instantly generate curriculum-aligned lesson plans, quizzes, and worksheets tailored to your classroom.
          </p>

          <div className="flex justify-center relative z-20">
            <button
              className="bg-[#6b5ea7] hover:bg-[#6b5ea7]/95 text-white rounded-full px-8 sm:px-12 h-14 sm:h-16 flex items-center justify-center gap-3 font-bold text-lg sm:text-xl shadow-xl hover:scale-[1.05] active:scale-[0.95] transition-all border border-slate-100 group"
              onClick={() => {
                const user = localStorage.getItem('user_data');
                if (user) {
                  navigate("/dashboard");
                } else {
                  navigate("/for-teachers");
                }
              }}
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-[#ec8c6b] group-hover:rotate-12 transition-transform" />
              Generate Resources
            </button>
          </div>

        </div>

        <div className="mt-8 sm:mt-16 relative z-10 pointer-events-none select-none h-[450px] sm:h-[600px] w-full">
          <ScrollingShowcase />
        </div>

        <div className="max-w-3xl mx-auto text-center">
          <p className="mt-8 sm:mt-12 text-sm sm:text-base opacity-70 font-semibold tracking-wide relative z-20 text-slate-600">
            Try it free — No credit card required
          </p>
        </div>
      </div>

      {/* Background Wave Accent */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0] transform rotate-180">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-[calc(100%+1.3px)] h-[60px]">
          <path d="M321.39,56.44c126,59,252.33,59,378.33,0,126-59,252.33-59,378.33,0V120H0V56.44c126,59,252.33,59,378.33,0Z" fill="#F1F5F9" opacity="0.5"></path>
        </svg>
      </div>
    </section>
  );
};


export default Hero;
