import React from "react";

interface LogoProps {
    className?: string; // Allow passing Tailwind classes for sizing/coloring
    showText?: boolean; // Option to hide text if needed
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", showText = true }) => {
    return (
        <div className={`flex items-center gap-2 ${showText ? "font-display font-bold text-xl tracking-wide text-white" : "justify-center"}`}>
            <div className={`relative ${className} flex items-center justify-center`}>
                {/* Premium 3D Tech Badge Logo */}
                <svg
                    viewBox="0 0 100 100"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full drop-shadow-md"
                    style={{ filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.3))" }}
                >
                    <defs>
                        {/* Metallic Silver Gradient for Border */}
                        <linearGradient id="silverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FFFFFF" />
                            <stop offset="50%" stopColor="#D1D5DB" />
                            <stop offset="100%" stopColor="#9CA3AF" />
                        </linearGradient>

                        {/* Deep Teal Gradient for Background */}
                        <linearGradient id="tealGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#0D5355" />
                            <stop offset="100%" stopColor="#083334" />
                        </linearGradient>

                        {/* Gold/Orange Gradient for Accents/Text */}
                        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#FF8C66" />
                            <stop offset="100%" stopColor="#FF7444" />
                        </linearGradient>

                        {/* Glow Filter */}
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* 1. Main Outer Shape: Rounded Square with Silver Border */}
                    <rect
                        x="10"
                        y="10"
                        width="80"
                        height="80"
                        rx="16"
                        fill="url(#tealGrad)"
                        stroke="url(#silverGrad)"
                        strokeWidth="3"
                    />

                    {/* 2. Inner Tech Grid / Crosshairs */}
                    <path
                        d="M50 15 L50 28 M50 72 L50 85 M15 50 L28 50 M72 50 L85 50"
                        stroke="url(#silverGrad)"
                        strokeWidth="2"
                        strokeOpacity="0.5"
                    />

                    {/* 3. Corner Accent Dots (Glowing) */}
                    <circle cx="20" cy="20" r="3" fill="url(#goldGrad)" filter="url(#glow)" />
                    <circle cx="80" cy="20" r="3" fill="url(#goldGrad)" filter="url(#glow)" />
                    <circle cx="20" cy="80" r="3" fill="url(#goldGrad)" filter="url(#glow)" />
                    <circle cx="80" cy="80" r="3" fill="url(#goldGrad)" filter="url(#glow)" />

                    {/* 4. Central Target Ring (Glowing) */}
                    <circle
                        cx="50"
                        cy="50"
                        r="22"
                        stroke="url(#goldGrad)"
                        strokeWidth="2.5"
                        fill="none"
                        filter="url(#glow)"
                        opacity="0.9"
                    />

                    {/* 5. Central Processor Box background */}
                    <rect
                        x="36"
                        y="36"
                        width="28"
                        height="28"
                        rx="6"
                        fill="#083334"
                        stroke="url(#silverGrad)"
                        strokeWidth="1.5"
                    />

                    {/* 6. "AI" Text - Metallic Gold */}
                    <text
                        x="50"
                        y="56"
                        textAnchor="middle"
                        fill="url(#goldGrad)"
                        fontSize="16"
                        fontWeight="900"
                        fontFamily="sans-serif"
                        style={{ textShadow: "0px 2px 4px rgba(0,0,0,0.5)" }}
                    >
                        AI
                    </text>

                    {/* 7. Fine Details: Inner Ticks */}
                    <path d="M50 36 L50 39" stroke="url(#goldGrad)" strokeWidth="2" />
                    <path d="M50 61 L50 64" stroke="url(#goldGrad)" strokeWidth="2" />
                    <path d="M36 50 L39 50" stroke="url(#goldGrad)" strokeWidth="2" />
                    <path d="M61 50 L64 50" stroke="url(#goldGrad)" strokeWidth="2" />

                </svg>
            </div>
        </div>
    );
};
