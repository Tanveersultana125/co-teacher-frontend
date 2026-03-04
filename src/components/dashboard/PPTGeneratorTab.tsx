
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Loader2, Sparkles, Presentation, Download, History,
    Eye, Trash2, Calendar, FileText, ChevronRight
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";

export function PPTGeneratorTab() {
    const [topic, setTopic] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [viewingPPT, setViewingPPT] = useState<any>(null);
    const { toast } = useToast();
    const queryClient = useQueryClient();

    // Fetch History
    const { data: history, isLoading: isHistoryLoading } = useQuery({
        queryKey: ['ppt-history'],
        queryFn: async () => {
            const response = await api.get('/lessons?type=PRESENTATION');
            return response.data;
        }
    });

    const handleGenerate = async () => {
        if (!topic.trim()) {
            toast({ title: "Error", description: "Please enter a topic first", variant: "destructive" });
            return;
        }

        setIsGenerating(true);
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const apiBase = baseUrl.endsWith('/api') || baseUrl.endsWith('/api/') ? baseUrl : (baseUrl.endsWith('/') ? `${baseUrl}api` : `${baseUrl}/api`);

            const response = await fetch(`${apiBase}/ppt/generate-ppt`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ topic })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to generate presentation");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${topic.replace(/\s+/g, '_')}_Presentation.pptx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({ title: "Success", description: "Presentation generated and downloaded!" });
            queryClient.invalidateQueries({ queryKey: ['ppt-history'] });
            setTopic("");
        } catch (error: any) {
            console.error("PPT Generation Error:", error);
            toast({ title: "Generation Failed", description: error.message, variant: "destructive" });
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDownloadExisting = async (ppt: any) => {
        try {
            const token = localStorage.getItem('token');
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
            const apiBase = baseUrl.endsWith('/api') || baseUrl.endsWith('/api/') ? baseUrl : (baseUrl.endsWith('/') ? `${baseUrl}api` : `${baseUrl}/api`);

            const response = await fetch(`${apiBase}/ppt/generate-ppt`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    topic: ppt.title.replace(' Presentation', ''),
                    slides: ppt.content.slides
                })
            });

            if (!response.ok) throw new Error("Export failed");

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${ppt.title.replace(/\s+/g, '_')}.pptx`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast({ title: "Downloaded", description: "Presentation file is ready." });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/lessons/${id}`);
            toast({ title: "Deleted", description: "Presentation removed from history." });
            queryClient.invalidateQueries({ queryKey: ['ppt-history'] });
        } catch (error: any) {
            toast({ title: "Error", description: "Failed to delete.", variant: "destructive" });
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-4 py-8">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-black text-slate-900 mb-2 font-display">AI Presentation Center</h1>
                <p className="text-slate-500 font-medium">Create and manage your professional educational slides</p>
            </div>

            <Tabs defaultValue="generate" className="w-full">
                <div className="flex justify-center mb-10">
                    <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-16 shadow-inner border border-slate-200">
                        <TabsTrigger
                            value="generate"
                            className="rounded-xl px-10 h-full data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg font-bold transition-all text-slate-500"
                        >
                            <Sparkles className="w-5 h-5 mr-3" />
                            New Presentation
                        </TabsTrigger>
                        <TabsTrigger
                            value="history"
                            className="rounded-xl px-10 h-full data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-lg font-bold transition-all text-slate-500"
                        >
                            <History className="w-5 h-5 mr-3" />
                            My History
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="generate" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Card className="max-w-2xl mx-auto border-none shadow-2xl shadow-slate-200/60 overflow-hidden relative bg-white/80 backdrop-blur-md">
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        <CardHeader className="pt-10 pb-6 px-8 text-center">
                            <CardTitle className="text-3xl font-black text-slate-800">What is the topic?</CardTitle>
                            <CardDescription className="text-lg font-medium">Generate 8 professional slides in seconds</CardDescription>
                        </CardHeader>
                        <CardContent className="px-8 pb-10">
                            <div className="space-y-6">
                                <Input
                                    className="h-16 pl-6 pr-6 text-lg font-bold border-slate-200 focus-visible:ring-indigo-500 rounded-2xl transition-all shadow-sm"
                                    placeholder="e.g. History of Rome, Chemical Reactions..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    disabled={isGenerating}
                                    onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                                />
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !topic.trim()}
                                    className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-indigo-200 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50"
                                >
                                    {isGenerating ? (
                                        <><Loader2 className="w-6 h-6 animate-spin mr-3" /> Crafting Your Slides...</>
                                    ) : (
                                        <><Sparkles className="w-6 h-6 mr-3" /> Generate & Download</>
                                    )}
                                </Button>
                                {isGenerating && (
                                    <p className="text-center text-slate-400 text-sm font-bold uppercase tracking-widest animate-pulse">
                                        Generating content & Exporting to .pptx
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isHistoryLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <Card key={i} className="h-48 animate-pulse bg-slate-50 border-slate-100" />
                            ))
                        ) : history?.length > 0 ? (
                            history.map((ppt: any) => (
                                <Card key={ppt.id} className="group overflow-hidden border-slate-100 hover:border-indigo-200 transition-all hover:shadow-xl hover:shadow-indigo-500/10">
                                    <div className="h-2 w-full bg-slate-100 group-hover:bg-indigo-500 transition-all" />
                                    <CardHeader className="p-5 pb-2">
                                        <div className="flex justify-between items-start">
                                            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                                <Presentation className="w-5 h-5" />
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => handleDelete(ppt.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                        <CardTitle className="text-xl font-bold mt-4 line-clamp-2 min-h-[56px] text-slate-800">
                                            {ppt.title}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="p-5 pt-0">
                                        <div className="flex items-center text-slate-400 text-xs font-bold mb-4">
                                            <Calendar className="w-3 h-3 mr-1.5" />
                                            {new Date(ppt.createdAt).toLocaleDateString()}
                                            <span className="mx-2">•</span>
                                            {ppt.content.slides.length} Slides
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Button
                                                variant="outline"
                                                className="w-full h-10 rounded-xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                                                onClick={() => setViewingPPT(ppt)}
                                            >
                                                <Eye className="w-4 h-4 mr-2" /> Preview
                                            </Button>
                                            <Button
                                                className="w-full h-10 rounded-xl font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                                                onClick={() => handleDownloadExisting(ppt)}
                                            >
                                                <Download className="w-4 h-4 mr-2" /> Export
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center">
                                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 text-slate-300 mb-6">
                                    <History className="w-10 h-10" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">No presentations yet</h3>
                                <p className="text-slate-500">Go to the "New Presentation" tab to create your first one!</p>
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Preview Dialog */}
            <Dialog open={!!viewingPPT} onOpenChange={(open) => !open && setViewingPPT(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-none shadow-2xl p-0">
                    <DialogHeader className="p-8 pb-4 border-b border-slate-100 flex-row justify-between items-center space-y-0">
                        <div>
                            <DialogTitle className="text-2xl font-black text-slate-900">{viewingPPT?.title}</DialogTitle>
                            <p className="text-slate-500 font-medium">Generated Outline Preview</p>
                        </div>
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 h-12 px-6 rounded-2xl font-bold shadow-lg shadow-indigo-100"
                            onClick={() => handleDownloadExisting(viewingPPT)}
                        >
                            <Download className="w-4 h-4 mr-2" /> Download .pptx
                        </Button>
                    </DialogHeader>
                    <div className="p-8 space-y-8 bg-slate-50">
                        {viewingPPT?.content.slides.map((slide: any, i: number) => (
                            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 relative group overflow-hidden">
                                <div className="absolute top-4 right-4 text-[10px] font-black uppercase tracking-widest text-slate-300">
                                    Slide {i + 1}
                                </div>
                                <div className="flex flex-col md:flex-row gap-8">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-slate-800 mb-4">{slide.title}</h3>
                                        <ul className="space-y-2">
                                            {slide.points?.map((p: string, j: number) => (
                                                <li key={j} className="flex items-start text-slate-600 font-medium line-clamp-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 mr-3 shrink-0" />
                                                    {p}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    {i > 0 && (
                                        <div className="w-full md:w-48 h-32 md:h-48 rounded-xl bg-slate-100 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200">
                                            <div className="p-3 bg-white rounded-full shadow-sm mb-2 text-indigo-500">
                                                <Sparkles className="w-5 h-5" />
                                            </div>
                                            <span className="text-[10px] font-bold uppercase tracking-wider">AI Visual</span>
                                            <span className="text-[9px] text-center px-4 mt-2 font-medium opacity-60 italic max-w-[150px]">
                                                {slide.imageQuery || "Relevant Image"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
