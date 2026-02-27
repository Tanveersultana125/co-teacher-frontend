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
          <div className="absolute inset-0 bg-[#0D5355] rounded-3xl opacity-20 blur-3xl" />

          {/* Card */}
          <div className="relative bg-[#0D5355] rounded-3xl p-12 text-center overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Start for Free</span>
              </div>

              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Transform Your Teaching?
              </h2>

              <p className="text-white/80 text-lg max-w-xl mx-auto mb-8">
                Join thousands of educators who are saving time and improving student outcomes with Co-Teacher.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="xl"
                  className="bg-white text-primary hover:bg-white/90 shadow-xl"
                  asChild
                >
                  <Link to="/signup">
                    Get Started Free
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="xl"
                  className="text-white hover:bg-white/10"
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
