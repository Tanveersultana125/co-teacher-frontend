import { motion } from "framer-motion";

const CARDS = [
    {
        title: "Origins of the Mongol Empire",
        subject: "History",
        grade: "Grade 7",
        content: "The rise of the Mongol Empire under Genghis Khan involved unifying nomadic tribes on the Asian steppe. Their superior cavalry tactics allowed them to conquer rapid...",
        image: "/mongol_empire_lesson_card_1769608848287.png",
        rotate: -6,
        x: -480,
        y: 60,
        zIndex: 10,
        type: "worksheet"
    },
    {
        title: "Osmosis & Diffusion",
        subject: "Biology",
        grade: "Grade 9",
        content: "Understanding the movement of water molecules across a semi-permeable membrane. Key concepts include hypotonic, hypertonic, and isotonic solutions.",
        image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f8?auto=format&fit=crop&w=800&q=80",
        rotate: -3,
        x: -240,
        y: 20,
        zIndex: 20,
        type: "notes"
    },
    {
        title: "The Solar System",
        subject: "Science",
        grade: "Grade 4-6",
        content: "Our solar system consists of the Sun (a central star) and all things orbiting around it, including eight major planets, their moons, and smaller bodies like asteroids and comets.",
        image: "/the_solar_system_card.png",
        rotate: 0,
        x: 0,
        y: -15,
        zIndex: 30,
        type: "slide"
    },
    {
        title: "Human Heart Anatomy",
        subject: "Biology",
        grade: "Grade 10",
        content: "Label the four chambers of the heart: right atrium, right ventricle, left atrium, and left ventricle. Trace the path of blood flow.",
        image: "https://images.unsplash.com/photo-1530210124550-912dc1381cb8?auto=format&fit=crop&w=800&q=80",
        rotate: 3,
        x: 240,
        y: 20,
        zIndex: 20,
        type: "quiz"
    },
    {
        title: "Shakespeare's Macbeth",
        subject: "Literature",
        grade: "Grade 11",
        content: "Symbolism in Macbeth. Analyze the recurring motif of blood and how it represents guilt throughout the play.",
        image: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=800&q=80",
        rotate: 6,
        x: 480,
        y: 60,
        zIndex: 10,
        type: "worksheet"
    }
];

export const ScrollingShowcase = () => {
    return (
        <div className="relative w-full mt-24 mb-32 h-[600px] flex justify-center items-center">
            <div className="relative w-[1400px] h-[700px] flex justify-center items-center scale-90 md:scale-100">
                {CARDS.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.8, x: card.x, y: card.y + 100, rotate: card.rotate }}
                        animate={{
                            opacity: 1,
                            scale: 1,
                            x: card.x,
                            y: [card.y, card.y - 15, card.y],
                            rotate: card.rotate
                        }}
                        transition={{
                            delay: i * 0.1,
                            y: {
                                duration: 4 + i,
                                repeat: Infinity,
                                ease: "easeInOut"
                            },
                            opacity: { duration: 0.5 },
                            scale: { duration: 0.5 }
                        }}
                        className="absolute w-[320px] h-[480px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:scale-105 hover:z-40 cursor-default flex flex-col"
                        style={{
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                            zIndex: card.zIndex,
                        }}
                    >
                        {/* Header Decoration */}
                        <div className={`h-2 w-full ${card.type === 'slide' ? 'bg-purple-500' :
                            card.type === 'quiz' ? 'bg-red-500' :
                                card.type === 'notes' ? 'bg-green-500' : 'bg-blue-500'
                            }`} />

                        <div className="p-6 flex flex-col h-full bg-slate-50">
                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-[11px] font-bold tracking-widest uppercase text-slate-500">{card.subject} • {card.grade}</span>
                                    <h3 className="text-2xl font-bold text-slate-900 leading-tight mt-1">{card.title}</h3>
                                </div>
                            </div>

                            {/* Card Body - Content Text */}
                            <div className="mb-4 flex-grow">
                                <p className="text-sm text-slate-600 leading-relaxed font-serif line-clamp-3">
                                    {card.content}
                                </p>
                            </div>

                            {/* Card Image */}
                            <div className="w-full h-52 rounded-lg overflow-hidden relative shadow-inner shrink-0 group-hover:h-56 transition-all duration-310">
                                <img
                                    src={card.image}
                                    alt={card.title}
                                    className="w-full h-full object-cover object-top"
                                />
                                <div className="absolute inset-0 bg-black/5" />
                            </div>

                            {/* Footer */}
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-4 h-4 rounded-full bg-slate-200" />
                                    <div className="w-12 h-1.5 rounded-full bg-slate-200" />
                                </div>
                                <span className="text-[10px] bg-white border border-slate-200 px-2 py-0.5 rounded-full text-slate-500 font-medium">{card.type}</span>
                            </div>
                        </div>

                        {/* Glossy overlay */}
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
