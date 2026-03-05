import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, CheckCircle2, ChevronRight, X } from "lucide-react";
import api from '@/api/client';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface QuickActionDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    contentToProcess: string;
}

export function QuickActionDialog({ open, onOpenChange, contentToProcess }: QuickActionDialogProps) {
    const [action, setAction] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<any>(null);

    const handleAction = async (value: string) => {
        setAction(value);
        if (value === 'summarize') {
            await performAction('/lessons/summarize');
        } else if (value === 'vocab') {
            await performAction('/lessons/vocab');
        } else if (value === 'quiz') {
            await performAction('/lessons/quiz');
        }
    };

    const performAction = async (endpoint: string) => {
        setIsLoading(true);
        setResult(null);
        try {
            const res = await api.post(endpoint, { text: contentToProcess });
            setResult(res.data);
            toast.success("Content generated!");
        } catch (error) {
            toast.error("Failed to process content");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-4xl bg-slate-900 border-slate-800 text-slate-100 p-0 overflow-hidden shadow-2xl">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-6 pr-8">
                        <DialogTitle className="text-xl font-black text-white flex items-center gap-2 font-display">
                            <Sparkles className="w-6 h-6 text-indigo-400" /> AI Assistant
                        </DialogTitle>
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-400">What would you like to do?</label>
                        <Select value={action} onValueChange={handleAction}>
                            <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-slate-200 focus:ring-indigo-500/20 h-12 rounded-xl">
                                <SelectValue placeholder="Select an action..." />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                                <SelectItem value="summarize">Summarize Lesson</SelectItem>
                                <SelectItem value="vocab">Extract Vocabulary</SelectItem>
                                <SelectItem value="quiz">Create Mini-Quiz</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-slate-950/50 border-t border-slate-800/50 p-6 flex flex-col items-center justify-center text-center"
                        >
                            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
                            <p className="text-sm text-slate-400 animate-pulse">Analyzing content...</p>
                        </motion.div>
                    )}

                    {result && !isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-950 border-t border-slate-800 p-8 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800"
                        >
                            {action === 'summarize' && result.overview && (
                                <>
                                    <div className="mb-4">
                                        <h4 className="text-indigo-400 font-bold text-xs uppercase tracking-wider mb-2">Overview</h4>
                                        <p className="text-slate-100 text-sm leading-relaxed font-medium">{result.overview}</p>
                                    </div>
                                    <div className="mb-4">
                                        <h4 className="text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">Key Takeaways</h4>
                                        <ul className="space-y-2">
                                            {(result.keyPoints || []).map((pt: string, i: number) => (
                                                <li key={i} className="flex gap-2 text-sm text-slate-100 font-medium">
                                                    <span className="text-emerald-500 font-bold">•</span>
                                                    {pt}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {result.actionItems && (
                                        <div>
                                            <h4 className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">Action Items</h4>
                                            <ul className="space-y-2">
                                                {(result.actionItems || []).map((pt: string, i: number) => (
                                                    <li key={i} className="flex gap-2 text-sm text-slate-300">
                                                        <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                                                        {pt}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            )}

                            {action === 'vocab' && result.vocabulary && (
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
                                        <div className="w-6 h-0.5 bg-indigo-500/50" /> Key Vocabulary
                                    </h4>
                                    {result.vocabulary.map((item: any, i: number) => (
                                        <div key={i} className="bg-white/[0.07] backdrop-blur-md p-6 rounded-[2rem] border border-white/10 hover:bg-white/[0.1] transition-all shadow-xl">
                                            <div className="flex justify-between items-start mb-3">
                                                <span className="font-black text-emerald-400 text-2xl tracking-tight">{item.word}</span>
                                            </div>
                                            <p className="text-slate-100 text-lg leading-relaxed mb-4 font-bold">{item.definition}</p>
                                            <div className="bg-slate-900/80 p-4 rounded-xl border border-white/10 italic text-slate-200 text-sm font-medium">
                                                <span className="text-indigo-400 font-black not-italic text-[10px] uppercase block mb-1">Example usage</span>
                                                "{item.example}"
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {action === 'quiz' && result.questions && (
                                <div className="space-y-10">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-amber-400 mb-6 flex items-center gap-2">
                                        <div className="w-6 h-0.5 bg-amber-500/50" /> Knowledge Check Mini-Quiz
                                    </h4>
                                    {result.questions.map((q: any, i: number) => (
                                        <div key={i} className="space-y-6 bg-white/[0.02] p-6 rounded-[2rem] border border-white/5">
                                            <div className="flex gap-4">
                                                <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-black text-sm">{i + 1}</span>
                                                <p className="text-lg font-bold text-white leading-tight pt-1">{q.question}</p>
                                            </div>
                                            <div className="grid grid-cols-1 gap-3 pl-12">
                                                {q.options.map((opt: string, j: number) => (
                                                    <div key={j} className={`text-base p-4 rounded-2xl transition-all font-bold ${opt === q.correctAnswer ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-slate-200 border border-white/5'}`}>
                                                        <span className="mr-3 opacity-50">{String.fromCharCode(65 + j)}.</span> {opt}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                        </motion.div>
                    )}
                </AnimatePresence>
            </DialogContent>
        </Dialog>
    );
}
