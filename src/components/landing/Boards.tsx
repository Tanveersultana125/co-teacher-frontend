import { motion } from "framer-motion";
import { Check } from "lucide-react";

const boards = [
  {
    name: "CBSE",
    fullName: "Central Board of Secondary Education",
    classes: "Class 1–12",
    features: ["NCERT Aligned", "Chapter-wise Content", "Sample Papers"],
  },
  {
    name: "ICSE",
    fullName: "Indian Certificate of Secondary Education",
    classes: "Class 1–12",
    features: ["CISCE Aligned", "Comprehensive Coverage", "Practice Tests"],
  },
  {
    name: "SSC",
    fullName: "State Board Curriculum",
    classes: "Class 1–12",
    features: ["State Aligned", "Regional Language Support", "Local Syllabus"],
  },
];

const Boards = () => {
  return (
    <section className="py-24 bg-gradient-surface">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-primary font-semibold mb-4"
          >
            Curriculum Support
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl font-bold mb-4"
          >
            Aligned with{" "}
            <span className="text-gradient-hero">Major Indian Boards</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-lg"
          >
            Content and assessments tailored to your specific board and class requirements.
          </motion.p>
        </div>

        {/* Boards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {boards.map((board, index) => (
            <motion.div
              key={board.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-hero rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
              <div className="relative bg-[#3d3151] rounded-2xl p-8 border border-white/10 group-hover:border-[#ec8c6b]/50 transition-all duration-300 shadow-xl overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#6b5ea7] rounded-full blur-[40px] opacity-20 -translate-y-1/2 translate-x-1/2" />
                
                <div className="relative z-10 text-center mb-6">
                  <h3 className="font-display text-3xl font-bold text-white mb-1">
                    {board.name}
                  </h3>
                  <p className="text-sm text-white/60">{board.fullName}</p>
                  <div className="mt-3 inline-block px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold tracking-tight border border-white/5">
                    {board.classes}
                  </div>
                </div>
                <ul className="space-y-3 relative z-10">
                  {board.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center">
                        <Check className="w-3 h-3 text-[#ec8c6b]" />
                      </div>
                      <span className="text-white/80 text-sm font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Boards;
