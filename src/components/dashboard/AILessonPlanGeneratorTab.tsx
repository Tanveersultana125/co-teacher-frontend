import { useState, useEffect } from "react";
import { AIAssistantTab } from "./AIAssistantTab";
import { LessonsTab } from "./LessonsTab";
import { Sparkles, BookOpen } from "lucide-react";

interface AILessonPlanGeneratorTabProps {
    initialMode?: "lesson" | "material" | "quiz";
    preloadedLesson?: any;
    initialActiveSubTab?: "generate" | "library";
}

export function AILessonPlanGeneratorTab({ initialMode = "lesson", preloadedLesson: propPreloadedLesson, initialActiveSubTab = "generate" }: AILessonPlanGeneratorTabProps) {
    const [activeSubTab, setActiveSubTab] = useState<"generate" | "library">(initialActiveSubTab);
    const [preloadedLesson, setPreloadedLesson] = useState<any>(propPreloadedLesson || null);

    // Sync prop with state if it changes
    useEffect(() => {
        if (propPreloadedLesson && preloadedLesson !== propPreloadedLesson) {
            setPreloadedLesson(propPreloadedLesson);
            if (activeSubTab !== "generate") setActiveSubTab("generate");
        }
    }, [propPreloadedLesson]);

    useEffect(() => {
        if (initialActiveSubTab) {
            setActiveSubTab(initialActiveSubTab);
        }
    }, [initialActiveSubTab]);

    const handleLessonSelect = (lesson: any) => {
        setPreloadedLesson(lesson);
        setActiveSubTab("generate");
    };

    return (
        <div className="space-y-6">
            {/* Header with name provided by user */}
            <div className="flex items-center justify-between mb-2 print:hidden">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight leading-tight">AI Lesson Plan Generator</h1>
                    <p className="text-slate-500 text-xs sm:text-sm font-bold mt-1">Design, generate and manage your AI-powered curriculum</p>
                </div>
            </div>

            {/* Modern Sub-Tab Switcher */}
            <div className="flex p-1.5 bg-slate-100/80 rounded-2xl w-full sm:w-fit border border-slate-200 shadow-inner overflow-x-auto no-scrollbar print:hidden">
                <button
                    onClick={() => {
                        setActiveSubTab("generate");
                        setPreloadedLesson(null); // Clear when manually switching back? 
                    }}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeSubTab === "generate"
                        ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                        : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <Sparkles className={`w-4 h-4 ${activeSubTab === "generate" ? "text-indigo-600" : "text-slate-400"}`} />
                    Generate New
                </button>
                <button
                    onClick={() => setActiveSubTab("library")}
                    className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${activeSubTab === "library"
                        ? "bg-white text-indigo-600 shadow-sm border border-slate-200"
                        : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    <BookOpen className={`w-4 h-4 ${activeSubTab === "library" ? "text-indigo-600" : "text-slate-400"}`} />
                    My Library
                </button>
            </div>

            {/* Content Area */}
            <div className="pt-2">
                {activeSubTab === "generate" ? (
                    <AIAssistantTab
                        initialMode={initialMode}
                        preloadedResult={preloadedLesson}
                    />
                ) : (
                    <LessonsTab onLessonSelect={handleLessonSelect} />
                )}
            </div>
        </div>
    );
}
