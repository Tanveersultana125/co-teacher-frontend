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
              <div className="relative bg-card rounded-2xl p-8 border border-border group-hover:border-primary/50 transition-colors">
                <div className="text-center mb-6">
                  <h3 className="font-display text-3xl font-bold text-primary mb-1">
                    {board.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{board.fullName}</p>
                  <div className="mt-3 inline-block px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium">
                    {board.classes}
                  </div>
                </div>
                <ul className="space-y-3">
                  {board.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                        <Check className="w-3 h-3 text-success" />
                      </div>
                      <span className="text-foreground">{feature}</span>
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
