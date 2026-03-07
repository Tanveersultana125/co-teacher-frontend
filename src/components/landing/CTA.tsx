import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const CTA = () => {
  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-[#3d3151] rounded-3xl opacity-20 blur-3xl" />

          {/* Card */}
          <div className="relative bg-[#3d3151] rounded-[2.5rem] p-8 sm:p-12 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#6b5ea7] to-[#ec8c6b] rounded-full blur-[80px] opacity-40 -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#6b5ea7] rounded-full blur-[100px] opacity-20 translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Ready to Transform Your Teaching?
              </h2>

              <p className="text-white/80 text-lg max-w-xl mx-auto mb-10 font-medium">
                Join thousands of educators who are saving time and improving student outcomes with AI Co-Teacher.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="xl"
                  className="bg-white text-[#3d3151] hover:bg-white/95 shadow-xl rounded-2xl h-14 sm:h-16 px-10 font-bold text-lg"
                  asChild
                >
                  <Link to="/login">
                    Get Started Free
                  </Link>
                </Button>
                <Button
                  size="xl"
                  className="bg-[#2d243a] text-white hover:bg-[#2d243a]/90 shadow-xl border border-white/5 rounded-2xl h-14 sm:h-16 px-8 font-bold text-lg"
                  asChild
                >
                  <Link to="/login">I Already Have an Account</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTA;
