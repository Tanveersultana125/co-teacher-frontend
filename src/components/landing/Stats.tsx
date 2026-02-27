import { Globe, Users, Languages } from "lucide-react";

const stats = [
    {
        icon: Globe,
        value: "100+",
        label: "Countries",
        color: "text-white",
        bgColor: "bg-white/20"
    },
    {
        icon: Users,
        value: "250,000+",
        label: "Teachers helped",
        color: "text-white",
        bgColor: "bg-white/20"
    },
    {
        icon: Languages,
        value: "40",
        label: "Languages",
        color: "text-white",
        bgColor: "bg-white/20"
    }
];

const Stats = () => {
    return (
        <section className="relative z-20 -mt-6 sm:-mt-10 w-full">
            <div className="bg-[#FF7444] shadow-2xl border-y border-white/5 w-full overflow-hidden relative rounded-t-[2.5rem] sm:rounded-none">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-300 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="container mx-auto px-6 py-8 sm:py-10 flex flex-col md:flex-row justify-between items-center gap-8 md:gap-4 relative z-10">
                    {stats.map((stat, index) => (
                        <div key={index} className="flex items-center gap-4 relative w-full md:w-auto justify-center md:justify-start">
                            <div className={`p-3 rounded-2xl bg-white/10 text-white shadow-xl border border-white/10`}>
                                <stat.icon className="w-6 h-6 sm:w-7 sm:h-7" />
                            </div>
                            <div className="text-left">
                                <div className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight leading-none mb-1">
                                    {stat.value}
                                </div>
                                <div className="text-white font-bold text-[10px] sm:text-xs uppercase tracking-[0.2em]">
                                    {stat.label}
                                </div>
                            </div>

                            {/* Divider for non-last items on desktop */}
                            {index !== stats.length - 1 && (
                                <div className="hidden lg:block absolute -right-12 xl:-right-24 top-1/2 -translate-y-1/2 w-px h-12 bg-white/10" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Stats;
