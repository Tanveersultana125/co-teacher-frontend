import React from "react";

interface LogoProps {
    className?: string; // Allow passing Tailwind classes for sizing/coloring
    showText?: boolean; // Option to hide text if needed
}

export const Logo: React.FC<LogoProps> = ({ className = "w-10 h-10", showText = true }) => {
    return (
        <div className={`flex items-center gap-2 ${showText ? "font-display font-bold text-xl tracking-wide text-white" : "justify-center"}`}>
            <div className={`relative ${className} flex items-center justify-center`}>
                <img
                    src="/aicoteacher.png"
                    alt="AI Co-Teacher Logo"
                    className="w-full h-full object-contain drop-shadow-md"
                />
            </div>
        </div>
    );
};
