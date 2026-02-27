import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Sparkles, Loader2, BookOpen, Presentation, ClipboardList, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function TeachingMaterialTab() {
    const [selectedGrade, setSelectedGrade] = useState("10");
    const [selectedCurriculum, setSelectedCurriculum] = useState("CBSE");
    const [topicId, setTopicId] = useState("");
    const [type, setType] = useState("NOTES");
    const [generatedContent, setGeneratedContent] = useState<any>(null);

    const { data: topics } = useQuery({
        queryKey: ['material-topics', selectedCurriculum, selectedGrade],
        queryFn: async () => {
            const res = await api.get(`/curriculum/subjects/${selectedCurriculum}/${selectedGrade}`);
            return res.data.flatMap((s: any) => s.chapters.flatMap((c: any) => c.topics));
        },
        enabled: !!selectedCurriculum && !!selectedGrade
    });

    const generateMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/materials/generate', data);
            return res.data;
        },
        onSuccess: (data) => {
            setGeneratedContent(data);
            toast.success(`${type} generated successfully!`);
        }
    });

    const materialTypes = [
        { id: 'NOTES', label: 'Study Notes', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
        { id: 'WORKSHEET', label: 'Worksheet', icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50' },
        { id: 'PPT', label: 'PPT Content', icon: Presentation, color: 'text-orange-600', bg: 'bg-orange-50' },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 font-display">Teaching Materials</h2>
                <p className="text-slate-500 font-medium">Generate professional resources with one click</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="md:col-span-1 border-none shadow-sm bg-white p-6 space-y-6">
                    <div className="space-y-4">
                        <Label className="font-bold text-slate-700">1. Select Material Type</Label>
                        <div className="space-y-2">
                            {materialTypes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setType(t.id)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${type === t.id ? 'border-[#4F46E5] bg-indigo-50/50' : 'border-slate-50 hover:border-slate-100'}`}
                                >
                                    <div className={`w-10 h-10 rounded-lg ${t.bg} flex items-center justify-center ${t.color}`}>
                                        <t.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`font-bold text-sm ${type === t.id ? 'text-[#4F46E5]' : 'text-slate-600'}`}>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="font-bold text-slate-700">2. Select Background</Label>
                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-500">Board</Label>
                                <Select value={selectedCurriculum} onValueChange={setSelectedCurriculum}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["CBSE", "ICSE", "SSC"].map(b => (
                                            <SelectItem key={b} value={b}>{b}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs text-slate-500">Class</Label>
                                <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(g => (
                                            <SelectItem key={g} value={g}>Class {g}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Label className="font-bold text-slate-700">3. Choose Topic</Label>
                        <Select onValueChange={setTopicId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select topic" />
                            </SelectTrigger>
                            <SelectContent>
                                {topics?.map((t: any) => (
                                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        className="w-full h-12 bg-[#4F46E5] font-bold rounded-xl"
                        disabled={!topicId || generateMutation.isPending}
                        onClick={() => generateMutation.mutate({ type, topicId })}
                    >
                        {generateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                        AI Generate
                    </Button>

                    <div className="pt-4 border-t border-slate-50">
                        <Label className="font-bold text-slate-700 block mb-3">Or Upload File</Label>
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const formData = new FormData();
                                formData.append('file', file);
                                try {
                                    const res = await api.post('/upload', formData, {
                                        headers: { 'Content-Type': 'multipart/form-data' }
                                    });
                                    toast.success("File uploaded: " + res.data.originalName);
                                } catch (err) {
                                    toast.error("Upload failed");
                                }
                            }}
                        />
                        <Button
                            variant="outline"
                            className="w-full h-12 border-slate-200 border-dashed hover:bg-slate-50 font-bold"
                            onClick={() => document.getElementById('file-upload')?.click()}
                        >
                            <Download className="w-4 h-4 mr-2" /> Upload PDF/Doc
                        </Button>
                    </div>
                </Card>

                <Card className="md:col-span-3 border-none shadow-sm bg-white min-h-[600px] overflow-hidden flex flex-col">
                    {generatedContent ? (
                        <div className="flex flex-col h-full bg-[#FAF9F6] relative">
                            {/* Textbook Header */}
                            <div className="p-10 border-b border-slate-200 bg-white flex items-start justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                                <div className="flex items-start gap-8 relative z-10">
                                    <div className="w-20 h-20 rounded-full bg-[#1A3263] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-100 shrink-0">
                                        {generatedContent.chapterNumber || "1"}
                                    </div>
                                    <div>
                                        <h1 className="text-5xl font-black text-[#1A3263] mb-4 tracking-tight leading-none">
                                            {generatedContent.title}
                                        </h1>
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                Chapter {generatedContent.chapterNumber || "1"}
                                            </span>
                                            <span className="text-slate-300 font-light px-2">|</span>
                                            <span className="text-slate-500 text-sm font-semibold italic">
                                                {generatedContent.footer || "Study Material"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <Button variant="outline" size="lg" className="font-black border-slate-200 hover:bg-slate-50 relative z-10 rounded-2xl">
                                    <Download className="w-5 h-5 mr-2" /> Export PDF
                                </Button>
                            </div>

                            {/* Textbook Body Content */}
                            <div className="flex-1 p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-12 gap-12">
                                {/* Main Content Column */}
                                <div className="lg:col-span-8 space-y-10">
                                    {/* Introduction */}
                                    <div className="relative">
                                        <p className="text-xl font-medium text-slate-800 leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-indigo-600 first-letter:mt-1">
                                            {generatedContent.intro}
                                        </p>
                                    </div>

                                    {/* Sections */}
                                    <div className="space-y-12">
                                        {generatedContent.sections?.map((section: any, idx: number) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="space-y-4"
                                            >
                                                <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                                                    <div className="w-1.5 h-8 bg-indigo-600 rounded-full" />
                                                    {section.heading}
                                                </h3>
                                                <p className="text-slate-700 leading-relaxed font-medium">
                                                    {section.content}
                                                </p>
                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                                    {section.bulletPoints?.map((point: string, pIdx: number) => (
                                                        <li key={pIdx} className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                                                            <div className="w-6 h-6 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 group-hover:bg-indigo-600 transition-colors">
                                                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 group-hover:bg-white" />
                                                            </div>
                                                            <span className="text-sm font-semibold text-slate-700 leading-snug">{point}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                {/* Sidebar Column */}
                                <div className="lg:col-span-4 space-y-8">
                                    {/* Learning Objectives Box (Textbook Style) */}
                                    <div className="bg-indigo-50 p-8 rounded-[2.5rem] border-2 border-dashed border-indigo-200 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <BookOpen className="w-12 h-12 text-indigo-600" />
                                        </div>
                                        <h4 className="text-indigo-900 font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-indigo-600" />
                                            In This Chapter
                                        </h4>
                                        <ul className="space-y-4">
                                            {generatedContent.learningObjectives?.map((obj: string, i: number) => (
                                                <li key={i} className="flex gap-3 text-sm font-bold text-indigo-900/70">
                                                    <ChevronRight className="w-5 h-5 text-indigo-400 shrink-0" />
                                                    {obj}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    {/* Illustration Area (Visual Placeholder) */}
                                    <div className="aspect-square bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50 flex flex-col items-center justify-center p-4 text-center gap-4 group cursor-help transition-all hover:scale-[1.02] overflow-hidden relative">
                                        {generatedContent.generatedImage ? (
                                            <div className="w-full h-full flex flex-col items-center justify-center relative">
                                                <img
                                                    src={generatedContent.generatedImage}
                                                    alt="Educational Diagram"
                                                    className="w-full h-full object-contain rounded-3xl"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1600&q=80";
                                                    }}
                                                />
                                                <div className="absolute bottom-4 left-0 right-0 group-hover:bottom-6 transition-all">
                                                    <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg border border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                                        Visual Study Guide
                                                    </span>
                                                </div>
                                            </div>
                                        ) : generatedContent.title?.toLowerCase().includes("human body") ||
                                            generatedContent.illustrationDescription?.toLowerCase().includes("human body") ||
                                            generatedContent.illustrationDescription?.toLowerCase().includes("anatomy") ||
                                            generatedContent.illustrationDescription?.toLowerCase().includes("internal parts") ? (
                                            <div className="w-full h-full flex flex-col items-center justify-center">
                                                <img
                                                    src="/human-body-diagram.png"
                                                    alt="Human Body Diagram"
                                                    className="w-full h-full object-contain rounded-3xl"
                                                />
                                                <div className="absolute bottom-4 left-0 right-0">
                                                    <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg border border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                                        Visual Study Guide
                                                    </span>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                                    <Presentation className="w-10 h-10 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Visual Study Guide</p>
                                                    <p className="text-xs font-semibold text-slate-500 italic px-4 leading-relaxed">
                                                        {generatedContent.illustrationDescription || "Detailed diagram for " + generatedContent.title}
                                                    </p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Textbook Footer / Check Out Box */}
                            <div className="p-10 lg:p-14 bg-white border-t border-slate-100">
                                <div className="bg-[#FFFDF0] p-10 rounded-[2.5rem] border border-[#F5E8C7] shadow-xl shadow-yellow-50 relative overflow-hidden group">
                                    <div className="absolute -bottom-10 -right-10 w-48 h-48 bg-yellow-100 rounded-full opacity-30 group-hover:scale-125 transition-transform" />

                                    <div className="relative z-10">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="w-12 h-12 rounded-2xl bg-yellow-400 flex items-center justify-center text-white shadow-lg shadow-yellow-100">
                                                <ClipboardList className="w-6 h-6" />
                                            </div>
                                            <h4 className="text-xl font-black text-yellow-900">Check Out!</h4>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {generatedContent.reviewQuestions?.map((q: string, i: number) => (
                                                <div key={i} className="flex gap-4">
                                                    <span className="text-yellow-600 font-black text-lg">{i + 1}.</span>
                                                    <p className="text-sm font-bold text-yellow-900/80 leading-relaxed">{q}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-10 flex items-center justify-between text-slate-300 font-bold text-[10px] uppercase tracking-[0.3em]">
                                    <span>{generatedContent.footer}</span>
                                    <span className="bg-slate-50 px-4 py-1 rounded-full border border-slate-100 text-slate-400">Page 1</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4 p-8">
                            <div className="w-24 h-24 rounded-[2.5rem] bg-slate-50 flex items-center justify-center shadow-inner">
                                <FileText className="w-10 h-10 text-slate-300" />
                            </div>
                            <div className="text-center">
                                <p className="font-black uppercase tracking-widest text-[10px] text-slate-500 mb-2">Teacher's Workspace</p>
                                <p className="font-bold text-slate-400">Select a topic to generate professional textbook-style notes</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
