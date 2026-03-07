import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
    {
        name: "Free",
        price: "$0",
        description: "Perfect for exploring the basics of AI teaching assistance.",
        features: [
            "Up to 5 AI lesson plans / month",
            "Basic quiz generator",
            "Attendance tracking",
            "Standard community support"
        ],
        cta: "Get Started",
        popular: false
    },
    {
        name: "Pro",
        price: "$19",
        description: "Everything you need to master your classroom efficiency.",
        features: [
            "Unlimited AI lesson plans",
            "Advanced worksheets & papers",
            "Parent communication hub",
            "Detailed analytics dashboard",
            "Priority email support"
        ],
        cta: "Go Pro",
        popular: true
    },
    {
        name: "School",
        price: "Custom",
        description: "Power your entire institution with teacher collaboration.",
        features: [
            "Everything in Pro",
            "School-wide collaboration",
            "Admin control panel",
            "Single Sign-On (SSO)",
            "Dedicated account manager"
        ],
        cta: "Contact Sales",
        popular: false
    }
];

const Pricing = () => {
    return (
        <section className="section-padding bg-white">
            <div className="container mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <h2 className="text-4xl font-bold text-slate-900 mb-6 font-display">Simple, Transparent Pricing</h2>
                    <p className="text-lg text-slate-500 font-medium">Choose the plan that fits your teaching needs. No hidden fees.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map((plan, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative p-8 rounded-[2.5rem] bg-white flex flex-col ${plan.popular ? "border-2 border-[#6b5ea7] shadow-2xl shadow-[#6b5ea7]/10" : "border border-slate-100 shadow-sm"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-[#6b5ea7] text-white text-xs font-black rounded-full uppercase tracking-tighter shadow-lg">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">
                                <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline gap-1 mb-4">
                                    <span className="text-4xl font-black text-slate-900">{plan.price}</span>
                                    {plan.price !== "Custom" && <span className="text-slate-400 font-bold">/mo</span>}
                                </div>
                                <p className="text-slate-500 text-sm leading-relaxed">{plan.description}</p>
                            </div>

                            <ul className="space-y-4 mb-10 flex-1">
                                {plan.features.map((feature, fIndex) => (
                                    <li key={fIndex} className="flex items-start gap-3 text-sm font-medium text-slate-600">
                                        <div className="w-5 h-5 rounded-full bg-[#f5f3f7] border border-[#6b5ea7]/20 flex items-center justify-center mt-0.5 shrink-0">
                                            <Check className="w-3 h-3 text-[#6b5ea7]" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={`w-full h-14 rounded-2xl font-bold text-lg transition-transform active:scale-95 ${plan.popular ? "bg-[#6b5ea7] hover:bg-[#6b5ea7]/90 text-white shadow-xl" : "bg-white border-2 border-slate-100 text-slate-900 hover:bg-slate-50"
                                    }`}
                                asChild
                            >
                                <Link to="/signup">
                                    {plan.cta}
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </Link>
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Pricing;
