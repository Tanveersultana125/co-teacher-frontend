import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Loader2, BookOpen, Upload, FileText, X, Text,
    Copy, Check, RefreshCw, AlignLeft, List
} from "lucide-react";
import api from "@/api/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export function LessonSummarizerTab() {
    const [mode, setMode] = useState<"upload" | "text">("upload");
    const [file, setFile] = useState<File | null>(null);
    const [textInput, setTextInput] = useState("");
    const [isDragOver, setIsDragOver] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [displayMode, setDisplayMode] = useState<"bullets" | "paragraph">("bullets");
    const [copied, setCopied] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

    const validateAndSetFile = (selectedFile: File) => {
        if (selectedFile.type !== "application/pdf") {
            toast.error("Please upload a valid PDF file.");
            return;
        }
        if (selectedFile.size > 200 * 1024 * 1024) {
            toast.error("File size exceeds 200MB limit.");
            return;
        }
        setFile(selectedFile);
        setResult(null);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        if (mode !== "upload") return;
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleSummarize = async () => {
        if (mode === "upload" && !file) return;
        if (mode === "text" && !textInput.trim()) {
            toast.error("Please enter some text.");
            return;
        }

        // Trial Limit Check: Block if user has already created something
        try {
            const statsRes = await api.get('/dashboard/stats');
            const lessonsCount = statsRes.data.lessonsCreated || 0;
            if (lessonsCount >= 1) {
                toast.error("Free trial limit reached (1 resource). Upgrade to create more!", {
                    description: "You've used your 1 free AI generation.",
                });
                return;
            }
        } catch (err) {
            console.error("Stats check failed", err);
        }

        setIsGenerating(true);
        setResult(null);

        try {
            let res;
            if (mode === "upload" && file) {
                const formData = new FormData();
                formData.append('file', file);
                // Using new production-grade analysis route
                console.log("[FRONTEND] Sending PDF to analysis/pdf...");
                res = await api.post('/analysis/pdf', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                console.log("[FRONTEND] Sending text to lessons/summarize...");
                res = await api.post('/lessons/summarize', { text: textInput });
            }

            console.log("[FRONTEND] Response received:", res.data);

            if (res.data?.success) {
                setResult(res.data);
                toast.success("Summary generated successfully!");
            } else {
                const errorMsg = res.data?.message || "Failed to generate summary";
                toast.error(errorMsg);
                setResult(null);
            }
        } catch (error: any) {
            console.error("[FRONTEND ERROR]", error);
            const message = error.response?.data?.message || error.response?.data?.details || error.message || "Failed to generate summary";
            toast.error(message);
            setResult(null);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleCopy = () => {
        if (!result) return;

        const keyPoints = result.key_points || result.keyPoints || [];
        const overview = result.summary || result.overview || "";

        const text = displayMode === "bullets"
            ? (Array.isArray(keyPoints) ? keyPoints : []).map((p: string) => `• ${p}`).join("\n")
            : overview;

        navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const clearAll = () => {
        setFile(null);
        setTextInput("");
        setResult(null);
    };

    const canSubmit = mode === "upload" ? !!file : !!textInput.trim();

    return (
        <div className="w-full min-h-full bg-[#F8FAFC] text-slate-900 p-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start min-h-[80vh]">

                {/* Left Side - Input UI */}
                <div className="space-y-8 sticky top-8">
                    <div className="space-y-2">
                        <h1 className="text-4xl lg:text-5xl font-display font-bold tracking-tight text-slate-900 leading-tight">
                            AI Lesson Summarizer
                        </h1>
                        <p className="text-slate-500 text-lg font-medium">
                            Upload a PDF or paste text to get an instant AI-powered lesson summary.
                        </p>
                    </div>

                    {/* Mode Switcher */}
                    <div className="flex p-1 bg-white rounded-xl w-fit border border-slate-200 shadow-sm">
                        <button
                            onClick={() => setMode("upload")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === "upload"
                                ? "bg-[#36656B] text-white shadow-md"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
                        >
                            <Upload className="w-4 h-4" /> Upload PDF
                        </button>
                        <button
                            onClick={() => setMode("text")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${mode === "text"
                                ? "bg-[#36656B] text-white shadow-md"
                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"}`}
                        >
                            <Text className="w-4 h-4" /> Paste Text
                        </button>
                    </div>

                    <div className="space-y-4">
                        {mode === "upload" ? (
                            <>
                                <p className="font-semibold text-slate-700 ml-1">Upload PDF File Of Your Lesson</p>
                                {!file ? (
                                    <div
                                        className={`border-2 border-dashed rounded-2xl p-10 transition-all duration-200 flex flex-col items-center justify-center gap-4 bg-white ${isDragOver ? 'border-[#36656B] bg-teal-50' : 'border-slate-300 hover:bg-slate-50 hover:border-slate-400'}`}
                                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                                        onDragLeave={() => setIsDragOver(false)}
                                        onDrop={handleDrop}
                                    >
                                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                                            <Upload className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-lg font-bold text-slate-900">Drag and drop file here</p>
                                            <p className="text-sm text-slate-500 font-medium">Limit 200MB per file • PDF only</p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            className="mt-4 border-slate-300 text-slate-700 hover:bg-slate-100 bg-white rounded-xl px-8 h-12 font-bold"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            Browse files
                                        </Button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="application/pdf" className="hidden" />
                                    </div>
                                ) : (
                                    <div className="border border-slate-200 rounded-2xl p-6 bg-white flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#36656B] flex items-center justify-center border border-teal-100">
                                                <FileText className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 text-lg">{file.name}</p>
                                                <p className="text-sm text-slate-500 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" className="text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={() => setFile(null)}>
                                            <X className="w-5 h-5" />
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : (
                            <>
                                <p className="font-semibold text-slate-700 ml-1">Paste Or Type Your Content</p>
                                <Textarea
                                    placeholder="Paste your lesson plan, meeting notes, or educational content here..."
                                    className="min-h-[300px] bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 rounded-2xl p-6 text-lg resize-none focus:ring-[#36656B] focus:border-[#36656B] transition-all font-medium leading-relaxed shadow-sm"
                                    value={textInput}
                                    onChange={(e) => setTextInput(e.target.value)}
                                />
                            </>
                        )}

                        {canSubmit && (
                            <Button
                                onClick={handleSummarize}
                                disabled={isGenerating}
                                className="w-full bg-[#36656B] hover:bg-[#2A4D52] text-white font-bold h-14 rounded-xl text-lg shadow-xl shadow-teal-900/10 transition-all mt-4"
                            >
                                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <BookOpen className="w-5 h-5 mr-2" />}
                                {isGenerating ? "Analyzing Content..." : "Generate Summary"}
                            </Button>
                        )}
                    </div>
                </div>

                {/* Right Side - Result UI */}
                <div className="relative pt-8 lg:pt-0">
                    <AnimatePresence mode="wait">
                        {!result && !isGenerating && (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="hidden lg:flex flex-col items-center justify-center text-center mt-20"
                            >
                                <div className="relative w-full max-w-md aspect-video rounded-2xl overflow-hidden shadow-2xl border-4 border-white/50 transform rotate-1">
                                    <img
                                        src="/educational-flashcards.png"
                                        alt="Educational Worksheets"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/5"></div>
                                </div>
                                <p className="mt-8 text-slate-400 font-bold tracking-wide uppercase text-sm">Results will appear here</p>
                            </motion.div>
                        )}

                        {isGenerating && (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xl mt-10"
                            >
                                <Loader2 className="w-12 h-12 text-[#36656B] animate-spin mx-auto mb-6" />
                                <h3 className="text-2xl font-bold text-slate-900">Analyzing Content...</h3>
                                <p className="text-slate-500 mt-2 font-medium">Our AI is extracting key concepts for you.</p>
                            </motion.div>
                        )}

                        {result && !isGenerating && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, ease: "easeOut" }}
                                className="relative"
                            >
                                {/* Card Header */}
                                <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="text-xl font-bold text-slate-900">Summarize</h3>
                                        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                                            <button
                                                onClick={() => setDisplayMode("bullets")}
                                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${displayMode === "bullets"
                                                    ? "bg-white text-[#36656B] shadow-sm border border-[#36656B]/20"
                                                    : "text-slate-500 hover:text-slate-700"}`}
                                            >
                                                <List className="w-3.5 h-3.5" />
                                                Bullets
                                            </button>
                                            <button
                                                onClick={() => setDisplayMode("paragraph")}
                                                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${displayMode === "paragraph"
                                                    ? "bg-white text-[#36656B] shadow-sm border border-[#36656B]/20"
                                                    : "text-slate-500 hover:text-slate-700"}`}
                                            >
                                                <AlignLeft className="w-3.5 h-3.5" />
                                                Paragraph
                                            </button>
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-6 min-h-[260px] max-h-[460px] overflow-y-auto">
                                        <AnimatePresence mode="wait">
                                            {displayMode === "bullets" ? (
                                                <motion.div
                                                    key="bullets"
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="space-y-3"
                                                >
                                                    {(() => {
                                                        const keyPoints = result.key_points || result.keyPoints || [];
                                                        const quiz = result.quiz || [];

                                                        const pointsArray = Array.isArray(keyPoints) ? keyPoints : [];

                                                        if (pointsArray.length === 0 && quiz.length === 0) {
                                                            return <p className="text-slate-500 italic">No summary points generated. Try switching to Paragraph mode.</p>;
                                                        }

                                                        return (
                                                            <>
                                                                {pointsArray.map((point: string, i: number) => (
                                                                    <div key={i} className="flex gap-3 text-slate-700">
                                                                        <span className="text-[#36656B] font-bold mt-1 shrink-0">•</span>
                                                                        <p className="font-medium leading-relaxed text-[15px]">{point}</p>
                                                                    </div>
                                                                ))}

                                                                {/* Quiz items at bottom if present */}
                                                                {Array.isArray(quiz) && quiz.length > 0 && (
                                                                    <div className="mt-5 pt-5 border-t border-slate-100">
                                                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Practice Questions</p>
                                                                        {quiz.slice(0, 3).map((q: any, i: number) => (
                                                                            <div key={i} className="flex gap-3 text-slate-600 mb-4">
                                                                                <span className="text-emerald-500 font-bold mt-1 shrink-0">Q:</span>
                                                                                <div>
                                                                                    <p className="font-bold text-[14px] leading-relaxed mb-1">{q.question}</p>
                                                                                    <p className="text-[13px] opacity-70">Answer: {q.answer}</p>
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="paragraph"
                                                    initial={{ opacity: 0, y: 8 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -8 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    {(() => {
                                                        const overview = result.summary || result.overview || "";
                                                        const quiz = result.quiz || [];

                                                        return (
                                                            <>
                                                                <p className="text-slate-700 font-medium leading-relaxed text-[16px] whitespace-pre-wrap">
                                                                    {overview || "No paragraph summary generated."}
                                                                </p>
                                                                {Array.isArray(quiz) && quiz.length > 0 && (
                                                                    <div className="mt-5 pt-5 border-t border-slate-100">
                                                                        <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Context Highlights</p>
                                                                        <p className="text-slate-600 font-medium text-sm leading-relaxed">
                                                                            {quiz.map((q: any) => q.question).slice(0, 2).join(" • ")}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="px-6 py-5 border-t border-slate-100 flex items-center gap-3 bg-slate-50/50">
                                        <Button
                                            onClick={handleCopy}
                                            className="bg-slate-900 hover:bg-slate-700 text-white font-bold px-8 h-11 rounded-xl text-sm gap-2 transition-all"
                                        >
                                            {copied
                                                ? <><Check className="w-4 h-4" /> Copied!</>
                                                : <><Copy className="w-4 h-4" /> Copy</>
                                            }
                                        </Button>
                                        <Button
                                            onClick={handleSummarize}
                                            disabled={isGenerating}
                                            variant="ghost"
                                            className="text-slate-500 hover:text-slate-900 font-bold h-11 rounded-xl text-sm gap-2 px-5 border border-slate-200 bg-white hover:bg-slate-50"
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                            Regenerate
                                        </Button>
                                        <button
                                            onClick={clearAll}
                                            className="ml-auto text-slate-400 hover:text-slate-600 transition-colors p-2 rounded-lg hover:bg-slate-100"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
