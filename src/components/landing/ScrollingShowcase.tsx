import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const CARDS = [
    {
        title: "Origins of the Mongol Empire",
        subject: "History",
        grade: "Grade 7",
        content: "The rise of the Mongol Empire under Genghis Khan involved unifying nomadic tribes on the Asian steppe. Their superior cavalry tactics allowed them to conquer rapid...",
        image: "https://images.unsplash.com/photo-1599408162449-7035ce40ccbc?auto=format&fit=crop&w=800&q=80",
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
        image: "https://images.unsplash.com/photo-1614732414444-096e5f1122d5?auto=format&fit=crop&w=800&q=80",
        rotate: 0,
        x: 0,
        y: -15,
        zIndex: 30,
        type: "slide"
    },
    {
        title: "Cell Structure",
        subject: "Biology",
        grade: "Grade 10",
        content: "Explore the fundamental unit of life. Identify key organelles like the nucleus, mitochondria, and cell membrane. Understand their roles in cellular processes.",
        image: "https://images.unsplash.com/photo-1530213786676-41ad9f7736f6?auto=format&fit=crop&w=800&q=80",
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
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // On mobile, we only want to show the center 3 cards or just center one with reduced offsets
    const visibleCards = isMobile ? CARDS.filter((_, i) => i >= 1 && i <= 3) : CARDS;

    return (
        <div className="relative w-full h-full flex justify-center items-center">
            <div className="relative w-full max-w-[1400px] h-[600px] flex justify-center items-center overflow-visible">
                {visibleCards.map((card, i) => {
                    const originalIndex = CARDS.indexOf(card);
                    // Adjust X for mobile
                    const responsiveX = isMobile ? (originalIndex - 2) * 280 : card.x;
                    const responsiveScale = isMobile ? (originalIndex === 2 ? 1 : 0.85) : 1;

                    return (
                        <motion.div
                            key={originalIndex}
                            initial={{ opacity: 0, scale: 0.8, x: responsiveX, y: card.y + 100, rotate: card.rotate }}
                            animate={{
                                opacity: 1,
                                scale: responsiveScale,
                                x: responsiveX,
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
                            className="absolute w-[280px] sm:w-[320px] h-[400px] sm:h-[480px] bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden transition-all duration-300 flex flex-col cursor-pointer hover:shadow-indigo-200/50"
                            onClick={() => {
                                const user = localStorage.getItem('user_data');
                                window.location.href = user ? "/dashboard" : "/for-teachers";
                            }}
                            style={{
                                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                                zIndex: card.zIndex,
                                left: "50%",
                                marginLeft: isMobile ? "-140px" : "-160px", // Center each card correctly
                            }}
                        >
                            {/* Header Decoration */}
                            <div className={`h-2 w-full ${card.type === 'slide' ? 'bg-purple-500' :
                                card.type === 'quiz' ? 'bg-red-500' :
                                    card.type === 'notes' ? 'bg-green-500' : 'bg-blue-500'
                                }`} />

                            <div className="p-4 sm:p-6 flex flex-col h-full bg-slate-50">
                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-2 sm:mb-3">
                                    <div>
                                        <span className="text-[10px] sm:text-[11px] font-bold tracking-widest uppercase text-slate-500">{card.subject} • {card.grade}</span>
                                        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight mt-1 truncate max-w-[220px] sm:max-w-full">{card.title}</h3>
                                    </div>
                                </div>

                                {/* Card Body - Content Text */}
                                <div className="mb-4 flex-grow hidden sm:block">
                                    <p className="text-sm text-slate-600 leading-relaxed font-serif line-clamp-3">
                                        {card.content}
                                    </p>
                                </div>

                                {/* Card Image */}
                                <div className="w-full h-40 sm:h-52 rounded-lg overflow-hidden relative shadow-inner shrink-0 group-hover:h-56 transition-all duration-300">
                                    <img
                                        src={card.image}
                                        alt={card.title}
                                        className="w-full h-full object-cover object-top"
                                        loading="lazy"
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
                    );
                })}
            </div>
        </div>
    );
};
