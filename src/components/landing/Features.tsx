import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Brain,
  ClipboardList,
  Users,
  MessageSquare,
  BarChart3,
  ArrowRight,
  Globe,
  Database,
  CheckCircle2,
  Video
} from "lucide-react";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "Intelligent Lesson Planning",
    description: "Generate comprehensive, curriculum-aligned lesson plans in seconds with advanced AI.",
    icon: BookOpen,
    color: "indigo",
    image: "/features/premium_export_slides.png" // Premium Icon Set
  },
  {
    title: "AI Resource Generation",
    description: "Create interactive quizzes, worksheets and teaching aids tailored to your specific topics.",
    icon: Brain,
    color: "amber",
    image: "/features/premium_export_slides.png" // Premium Icon Set
  },
  {
    title: "Automated Assessments",
    description: "Streamline grading and feedback with AI-powered quiz generation and auto-evaluations.",
    icon: ClipboardList,
    color: "blue",
    image: "/features/automated-assessments.png" // AI Generated
  },
  {
    title: "Collaborative Learning",
    description: "Connect students and teachers in a seamless environment for real-time collaboration.",
    icon: Users,
    color: "emerald",
    image: "/features/collaborative-learning.png" // AI Generated
  },
  {
    title: "Interactive Multimedia",
    description: "Embed videos, interactive diagrams, and smart media to bring lessons to life.",
    icon: Video,
    color: "violet",
    image: "/features/interactive-multimedia.png" // AI Generated
  },
  {
    title: "Data-Driven Insights",
    description: "Visualize student progress and class performance with high-fidelity analytics.",
    icon: BarChart3,
    color: "rose",
    image: "/features/data-driven-insights.png" // AI Generated
  },
  {
    title: "Universal Content Hub",
    description: "Organize and access all your teaching materials in one cloud-based, smart repository.",
    icon: Database,
    color: "sky",
    image: "/features/universal-content-hub.png" // AI Generated
  },
  {
    title: "Curriculum Alignment",
    description: "Ensure every lesson meets international standards with automatic curriculum mapping.",
    icon: CheckCircle2,
    color: "yellow",
    image: "/features/curriculum-alignment.png" // AI Generated
  }
];

const Features = () => {
  return (
    <section className="py-32 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight font-display"
          >
            Everything You Need to Help You Teach Better
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-500 font-medium"
          >
            Co-Teacher provides a comprehensive suite of AI-driven tools designed to reclaim 10+ hours of your week.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="h-full border border-white/5 shadow-2xl hover:shadow-[#6b5ea7]/20 transition-all duration-500 group bg-[#2d2440] rounded-[2.5rem] overflow-hidden flex flex-col">
                {/* Visual Area */}
                <div className="h-44 w-full bg-slate-900/50 overflow-hidden relative">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110 opacity-70"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#3d3151] pointer-events-none" />
                </div>

                <div className="p-8 flex-1 flex flex-col">
                  <div className="w-12 h-12 rounded-2xl mb-6 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 bg-[#6b5ea7] text-white shadow-lg shadow-[#6b5ea7]/20">
                    <feature.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3 font-display">{feature.title}</h3>
                  <p className="text-white/60 leading-relaxed mb-8 flex-1 text-sm font-medium">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

