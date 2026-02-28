import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Plus, Sparkles, Wand2, FileText, ClipboardCheck, ArrowRight, Save,
    Share2, Download, Printer, Layout, GraduationCap, Calendar,
    CheckCircle2, Clock, Inbox, Loader2, ListOrdered, BarChart3, HelpCircle,
    UserPlus, ChevronRight, Eye
} from 'lucide-react';
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function GradingInterface({ assignment }: { assignment: any }) {
    const queryClient = useQueryClient();
    const { data: submissions, isLoading } = useQuery({
        queryKey: ['submissions', assignment.id],
        queryFn: async () => {
            const res = await api.get(`/assignments/${assignment.id}/submissions`);
            return res.data;
        }
    });

    const gradeMutation = useMutation({
        mutationFn: async ({ submissionId, grade, feedback }: any) => {
            const res = await api.post(`/assignments/submissions/${submissionId}/grade`, { grade, feedback });
            return res.data;
        },
        onSuccess: () => {
            toast.success("Grade saved successfully");
            queryClient.invalidateQueries({ queryKey: ['submissions', assignment.id] });
        }
    });

    const handleSaveGrade = (submissionId: string, grade: string, feedback: string) => {
        gradeMutation.mutate({ submissionId, grade, feedback });
    };

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>;
    }

    if (!submissions || submissions.length === 0) {
        return (
            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <Inbox className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">No Submissions Yet</h3>
                <p className="text-slate-500 max-w-sm mx-auto mt-2">
                    Students haven't submitted this assignment yet. Once they do, their work will appear here for grading.
                </p>
                <div className="mt-8 flex justify-center gap-4">
                    <Button variant="outline" className="gap-2">
                        <UserPlus className="w-4 h-4" /> Add Mock Submission
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
                {submissions.map((sub: any) => (
                    <SubmissionCard key={sub.id} submission={sub} onSave={handleSaveGrade} maxScore={assignment.maxScore} />
                ))}
            </div>
        </div>
    );
}

function SubmissionCard({ submission, onSave, maxScore }: any) {
    const [grade, setGrade] = useState(submission.grade || "");
    const [feedback, setFeedback] = useState(submission.feedback || "");

    return (
        <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="p-6 flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                            <AvatarImage src={submission.student?.user?.avatar} />
                            <AvatarFallback className="bg-indigo-100 text-indigo-600 font-bold">
                                {submission.student?.user?.name?.substring(0, 2).toUpperCase() || "ST"}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <h4 className="font-bold text-slate-900 text-lg">{submission.student?.user?.name || "Student"}</h4>
                            <p className="text-sm text-slate-500 font-medium">Submitted on {new Date(submission.submittedAt).toLocaleDateString()}</p>
                        </div>
                        {submission.status === 'LATE' && (
                            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">Late</span>
                        )}
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100/50">
                        <p className="text-slate-700 leading-relaxed text-sm">
                            {submission.content || "No text content submitted."}
                        </p>
                        {submission.attachments && submission.attachments.length > 0 && (
                            <div className="mt-3 flex gap-2">
                                {submission.attachments.map((att: string, i: number) => (
                                    <a key={i} href={att} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-indigo-600 font-bold hover:underline bg-white px-2 py-1 rounded border border-indigo-100">
                                        <FileText className="w-3 h-3" /> Attachment {i + 1}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-6 w-full md:w-80 bg-slate-50/50 flex flex-col gap-4">
                    <div>
                        <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1.5 block">Grade (out of {maxScore || 100})</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                type="number"
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                className="font-bold text-lg h-12 bg-white"
                                placeholder="0"
                            />
                            <span className="text-slate-400 font-bold">/ {maxScore || 100}</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <Label className="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1.5 block">Feedback</Label>
                        <Textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="bg-white min-h-[100px] resize-none"
                            placeholder="Great work, but..."
                        />
                    </div>

                    <Button onClick={() => onSave(submission.id, grade, feedback)} className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold shadow-lg shadow-emerald-200">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Save Grade
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export function AssignmentsTab() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-display">Assignments</h2>
                    <p className="text-slate-500 font-medium">Manage and grade student work</p>
                </div>
            </div>

            <Tabs defaultValue="list" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-slate-100 p-1 rounded-xl">
                    <TabsTrigger value="list" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">My Assignments</TabsTrigger>
                    <TabsTrigger value="generator" className="rounded-lg font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Sparkles className="w-4 h-4 mr-2 text-indigo-500" />
                        AI Generator
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="list">
                    <AssignmentsList />
                </TabsContent>

                <TabsContent value="generator">
                    <AssignmentGenerator />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function AssignmentGenerator() {
    const [selectedGrade, setSelectedGrade] = useState("10");
    const [topicId, setTopicId] = useState("");
    const [assignmentType, setAssignmentType] = useState("Homework");
    const [difficulty, setDifficulty] = useState("Medium");
    const [questionCount, setQuestionCount] = useState("5");
    const [generatedContent, setGeneratedContent] = useState<any>(null);
    const hasAutoGenerated = useRef(false);
    const queryClient = useQueryClient();


    const { data: topics } = useQuery({
        queryKey: ['all-topics', selectedGrade],
        queryFn: async () => {
            const res = await api.get(`/curriculum/metadata?curriculum=CBSE&class=${selectedGrade}`);
            const topicMap = res.data.topics;
            const flatTopics: any[] = [];
            Object.keys(topicMap).forEach(subject => {
                topicMap[subject].forEach((topic: string) => {
                    flatTopics.push({ name: topic, subject });
                });
            });
            return flatTopics;
        }
    });

    const generateMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/assignments/generate', data);
            return res.data;
        },
        onSuccess: (data) => {
            setGeneratedContent(data);
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
            toast.success("Assignment generated and saved to library!");
        },
        onError: (error: any) => {
            console.error("Generation error:", error);
            toast.error("Generation failed. Please try again or check your connection.");
        }
    });

    const handleGenerate = () => {
        if (!topicId) {
            toast.error("Please select a topic.");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Authentication Error", {
                description: "You've been signed out. Please login again.",
            });
            window.location.href = '/login?expired=true';
            return;
        }

        const selectedTopic = topics?.find((t: any) => t.name === topicId);

        generateMutation.mutate({
            topic: topicId,
            subject: selectedTopic?.subject || "General",
            grade: selectedGrade,
            curriculum: "CBSE",
            assignmentType,
            difficultyLevel: difficulty,
            questionCount: questionCount
        });
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const urlTopic = params.get('topic');
        const urlGrade = params.get('grade');
        const urlType = params.get('type');
        const auto = params.get('autoGenerate');

        if (urlTopic) setTopicId(urlTopic);
        if (urlGrade) setSelectedGrade(urlGrade);
        if (urlType) setAssignmentType(urlType);

        if (auto === 'true' && urlTopic && urlGrade && !hasAutoGenerated.current) {
            hasAutoGenerated.current = true;
            setTimeout(() => {
                handleGenerate();
            }, 800);
        }
    }, [topics]); // Trigger when topics are loaded

    return (
        <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white p-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
                    <div className="space-y-2">
                        <Label>Class</Label>
                        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                            <SelectTrigger className="h-12">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(12)].map((_, i) => (
                                    <SelectItem key={i} value={(i + 1).toString()}>Class {i + 1}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="md:col-span-2 space-y-2">
                        <Label>Select Topic</Label>
                        <Select onValueChange={setTopicId}>
                            <SelectTrigger className="h-12">
                                <SelectValue placeholder="Select topic..." />
                            </SelectTrigger>
                            <SelectContent>
                                {topics?.map((t: any, i: number) => (
                                    <SelectItem key={i} value={t.name}>
                                        <span className="font-medium">{t.name}</span>
                                        <span className="text-slate-400 ml-2 text-xs">({t.subject})</span>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={assignmentType} onValueChange={setAssignmentType}>
                            <SelectTrigger className="h-12">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Homework">Homework</SelectItem>
                                <SelectItem value="Worksheet">Worksheet</SelectItem>
                                <SelectItem value="Project">Project</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={generateMutation.isPending}
                        className="h-12 bg-[#4F46E5] hover:bg-[#4338CA] font-bold rounded-xl w-full"
                    >
                        {generateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                        Generate
                    </Button>
                </div>

                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-slate-600 font-bold">
                            <BarChart3 className="w-4 h-4 text-indigo-500" /> Complexity Level
                        </Label>
                        <Select value={difficulty} onValueChange={setDifficulty}>
                            <SelectTrigger className="h-12 bg-white border-slate-200 hover:border-indigo-300 transition-colors rounded-xl shadow-sm font-medium">
                                <SelectValue placeholder="Select Difficulty" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                <SelectItem value="Easy" className="focus:bg-indigo-50 rounded-lg">🟢 Easy (Foundational)</SelectItem>
                                <SelectItem value="Medium" className="focus:bg-indigo-50 rounded-lg">🟡 Medium (Standard)</SelectItem>
                                <SelectItem value="Hard" className="focus:bg-indigo-50 rounded-lg">🔴 Hard (Advanced)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <Label className="flex items-center gap-2 text-slate-600 font-bold">
                            <ListOrdered className="w-4 h-4 text-indigo-500" /> Questions Quantity
                        </Label>
                        <Select value={questionCount} onValueChange={setQuestionCount}>
                            <SelectTrigger className="h-12 bg-white border-slate-200 hover:border-indigo-300 transition-colors rounded-xl shadow-sm font-medium">
                                <SelectValue placeholder="Select Count" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                                <SelectItem value="3" className="focus:bg-indigo-50 rounded-lg">Quick (3 Items)</SelectItem>
                                <SelectItem value="5" className="focus:bg-indigo-50 rounded-lg">Standard (5 Items)</SelectItem>
                                <SelectItem value="10" className="focus:bg-indigo-50 rounded-lg">Comprehensive (10 Items)</SelectItem>
                                <SelectItem value="15" className="focus:bg-indigo-50 rounded-lg">Extensive (15 Items)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </Card>

            {generatedContent && (
                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 pb-20">
                    {/* Toolbar */}
                    <div className="flex items-center justify-between border-b border-indigo-100 pb-6">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight">{generatedContent.title}</h3>
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3 h-3" /> Saved in Library
                                </span>
                            </div>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">Grade {selectedGrade} • {assignmentType} Edition</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 hover:bg-slate-50 gap-2 font-bold text-slate-700 shadow-sm" onClick={() => window.print()}>
                                <Printer className="w-4 h-4" /> Print
                            </Button>
                            <Button variant="outline" className="h-10 px-4 rounded-xl border-slate-200 hover:bg-slate-50 gap-2 font-bold text-slate-700 shadow-sm" onClick={() => toast.success("Downloading PDF...")}>
                                <Download className="w-4 h-4" /> Download
                            </Button>
                            <Button
                                className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 gap-2 font-bold shadow-lg shadow-indigo-100"
                                onClick={async () => {
                                    if (!generatedContent) return;
                                    const baseUrl = window.location.origin + window.location.pathname;
                                    const shareUrl = `${baseUrl}?tab=assignments&topic=${encodeURIComponent(topicId)}&grade=${encodeURIComponent(selectedGrade)}&type=${encodeURIComponent(assignmentType)}&autoGenerate=true`;

                                    const shareData = {
                                        title: `Check out this ${assignmentType} on ${topicId}`,
                                        text: `I generated a professional ${assignmentType} on "${topicId}" using Co-Teacher AI. Take a look!`,
                                        url: shareUrl
                                    };

                                    if (navigator.share && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
                                        try {
                                            await navigator.share(shareData);
                                            toast.success("Shared successfully!");
                                            return;
                                        } catch (err) { }
                                    }

                                    navigator.clipboard.writeText(shareUrl);
                                    window.open(`https://wa.me/?text=${encodeURIComponent(shareData.text + " " + shareUrl)}`, '_blank');
                                    toast.success("Link copied & WhatsApp opened!");
                                }}
                            >
                                <Share2 className="w-4 h-4" /> Share
                            </Button>
                        </div>
                    </div>

                    <AssignmentDisplay content={generatedContent} />
                </div>
            )}
        </div>
    )
}

function AssignmentDisplay({ content }: { content: any }) {
    if (!content) return null;

    return (
        <Card className="border-none shadow-2xl shadow-indigo-100/20 bg-white overflow-hidden rounded-[32px]">
            <CardContent className="p-10 space-y-12">
                {/* Instructions Block */}
                {content?.instructions?.length > 0 && (
                    <div className="p-8 bg-slate-50/80 rounded-[28px] border border-slate-200 shadow-sm">
                        <h4 className="font-black text-slate-900 flex items-center gap-2 mb-4 text-sm uppercase tracking-widest">
                            <FileText className="w-4 h-4 text-indigo-600" /> Instructions
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                            {content.instructions.map?.((ins: string, i: number) => (
                                <li key={i} className="text-slate-600 text-sm font-bold flex gap-2">
                                    <span className="text-indigo-500">•</span> {ins}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Type-Specific Content Scaling */}
                {content?.assignmentType === 'Worksheet' ? (
                    <div className="space-y-16">
                        {/* Section A: MCQs */}
                        {content?.content?.sectionA_MCQs?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <span className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-lg shadow-indigo-200">A</span>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Multiple Choice Questions</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-4">
                                    {content.content.sectionA_MCQs.map((item: any, i: number) => (
                                        <div key={i} className="space-y-4 p-6 rounded-3xl border border-slate-100 bg-slate-50/30 hover:border-indigo-100 transition-colors group">
                                            <p className="font-bold text-slate-800 leading-snug group-hover:text-indigo-900 transition-colors">
                                                <span className="text-indigo-500 mr-2 text-sm">{i + 1}.</span> {item.q}
                                            </p>
                                            <div className="grid grid-cols-1 gap-2 ml-4">
                                                {item?.options?.map((opt: string, idx: number) => (
                                                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl border border-white bg-white/50 text-sm shadow-sm">
                                                        <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-black">{String.fromCharCode(64 + idx)}</span>
                                                        <span className="font-bold text-slate-600">{opt}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Section B: Fill Blanks */}
                        {content?.content?.sectionB_FillBlanks?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <span className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black shadow-lg shadow-amber-200">B</span>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Fill in the Blanks</h4>
                                </div>
                                <div className="space-y-4 pl-14">
                                    {content.content.sectionB_FillBlanks.map((q: string, i: number) => (
                                        <div key={i} className="p-5 rounded-2xl bg-amber-50/30 border border-amber-100/50 text-slate-700 font-bold leading-relaxed italic">
                                            <span className="text-amber-600 mr-3 not-italic text-sm">{i + 1}.</span> {q}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Section C: Match Following */}
                        {content?.content?.sectionC_Match?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <span className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-200">C</span>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Match the Following</h4>
                                </div>
                                <div className="grid grid-cols-2 gap-4 max-w-2xl pl-14">
                                    <div className="space-y-3">
                                        {content.content.sectionC_Match.map((m: any, i: number) => (
                                            <div key={i} className="h-14 flex items-center px-6 rounded-xl border border-slate-100 bg-slate-50 font-bold text-slate-700 text-sm">
                                                {i + 1}. {m.left}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-3">
                                        {[...(content?.content?.sectionC_Match || [])].sort(() => 0.5 - Math.random()).map((m: any, i: number) => (
                                            <div key={i} className="h-14 flex items-center px-6 rounded-xl border border-slate-100 bg-white shadow-sm font-bold text-slate-600 text-sm">
                                                {String.fromCharCode(97 + i)}) {m.right}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* Section D: Short Answers */}
                        {content?.content?.sectionD_ShortAnswers?.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-8">
                                    <span className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-black shadow-lg shadow-rose-200">D</span>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Short Answer Questions</h4>
                                </div>
                                <div className="space-y-4 pl-14">
                                    {content.content.sectionD_ShortAnswers.map((q: string, i: number) => (
                                        <div key={i} className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm group hover:border-rose-200 transition-colors">
                                            <p className="font-bold text-slate-800 group-hover:text-rose-900"><span className="text-rose-400 mr-2 text-sm">{i + 1}.</span> {q}</p>
                                            <div className="mt-6 border-b border-dashed border-slate-100 w-full h-[1px]"></div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : content?.assignmentType === 'Project' ? (
                    <div className="space-y-12">
                        {/* Questions Section */}
                        {content?.content?.questions?.length > 0 && (
                            <section>
                                <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-indigo-500" /> Research & Concepts
                                </h4>
                                <div className="grid grid-cols-1 gap-4 pl-7">
                                    {content.content.questions.map((q: string, i: number) => (
                                        <div key={i} className="p-6 rounded-3xl bg-slate-50/50 border border-slate-100 font-bold text-slate-700 leading-relaxed">
                                            <span className="text-indigo-400 mr-3 text-sm">0{i + 1}</span> {q}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Activities Section */}
                        {content?.content?.activities?.length > 0 && (
                            <section>
                                <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <Wand2 className="w-5 h-5 text-indigo-500" /> Project Steps & Activities
                                </h4>
                                <div className="space-y-6 pl-7">
                                    {content.content.activities.map((act: string, i: number) => (
                                        <div key={i} className="flex gap-4 group">
                                            <div className="shrink-0 w-8 h-8 rounded-full border-2 border-indigo-100 flex items-center justify-center font-black text-[10px] text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-500 transition-all">
                                                {i + 1}
                                            </div>
                                            <p className="font-bold text-slate-700 leading-relaxed pt-1">{act}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                ) : (
                    // Flexible Content Layout
                    <div className="space-y-12">
                        {/* Generic Question List Handler */}
                        {(content.content?.questions || content.content?.assignmentQuestions) && (
                            <section>
                                <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <Inbox className="w-5 h-5 text-indigo-500" /> Assignment Questions
                                </h4>
                                <div className="space-y-6 pl-7">
                                    {(content.content?.questions || content.content?.assignmentQuestions).map?.((q: string, i: number) => (
                                        <div key={i} className="p-8 rounded-[32px] border border-slate-100 bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <p className="font-bold text-slate-800 text-lg leading-relaxed mb-4">
                                                <span className="text-indigo-500 mr-2">Q{i + 1}.</span> {q}
                                            </p>
                                            <div className="flex gap-1">
                                                {[1, 2, 3, 4, 5].map(dot => <div key={dot} className="flex-1 h-[2px] bg-slate-50"></div>)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Fill Blanks */}
                        {content.content?.fillInTheBlanks?.length > 0 && (
                            <section>
                                <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-amber-500" /> Fill in the Blanks
                                </h4>
                                <div className="space-y-4 pl-14">
                                    {content.content.fillInTheBlanks.map((q: string, i: number) => (
                                        <div key={i} className="p-5 rounded-2xl bg-amber-50/30 border border-amber-100/50 text-slate-700 font-bold leading-relaxed italic">
                                            <span className="text-amber-600 mr-3 not-italic text-sm">{i + 1}.</span> {q}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Activities */}
                        {(content.content?.activities || content.content?.activityQuestions) && (
                            <section>
                                <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <Sparkles className="w-5 h-5 text-purple-500" /> Tasks & Activities
                                </h4>
                                <div className="space-y-6 pl-7">
                                    {(content.content?.activities || content.content?.activityQuestions).map?.((act: string, i: number) => (
                                        <div key={i} className="flex gap-4 group">
                                            <div className="shrink-0 w-8 h-8 rounded-full border-2 border-purple-100 flex items-center justify-center font-black text-[10px] text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
                                                {i + 1}
                                            </div>
                                            <p className="font-bold text-slate-700 leading-relaxed pt-1">{act}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Project Ideas */}
                        {content.content?.projectIdeas?.length > 0 && (
                            <section>
                                <h4 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                    <Wand2 className="w-5 h-5 text-emerald-500" /> Suggested Projects
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-7">
                                    {content.content.projectIdeas.map((idea: string, i: number) => (
                                        <div key={i} className="p-6 rounded-3xl bg-emerald-50/30 border border-emerald-100 text-slate-700 font-bold leading-relaxed">
                                            <span className="text-emerald-600 mr-2">#</span> {idea}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {content?.content?.deadlineNotice && (
                            <div className="flex items-center gap-3 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-rose-700 font-bold text-sm mx-7">
                                <Calendar className="w-4 h-4" /> {content.content.deadlineNotice}
                            </div>
                        )}
                    </div>
                )}

                {/* Answer Key (Teacher Only) */}
                {content.answerKey && (
                    <>
                        {/* Page Break Divider for UI */}
                        <div className="mt-32 mb-16 h-[1px] w-full border-t border-dashed border-slate-300 relative flex justify-center print:hidden">
                            <span className="absolute -top-3 bg-white px-6 text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Page 2: Teacher Answer Key
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                            </span>
                        </div>

                        <div
                            className="pt-16 border-t-[8px] border-double border-emerald-100 break-before-page print:mt-0 print:pt-4 print:border-none relative block"
                            style={{
                                pageBreakBefore: 'always',
                                breakBefore: 'page',
                                display: 'block',
                                clear: 'both'
                            }}
                        >
                            <h4 className="font-black text-2xl text-emerald-800 mb-8 flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-200">
                                    <ClipboardCheck className="w-6 h-6" />
                                </div>
                                Answer Key (Teacher Only)
                            </h4>
                            <div className="bg-emerald-50 rounded-[40px] p-10 border border-emerald-100 shadow-inner">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    {Object.entries(content.answerKey)
                                        .filter(([section]) => {
                                            const normalizedSection = section.toLowerCase().replace(/[^a-z0-9]/g, '');
                                            // Filter logic: Only show sections that have corresponding content
                                            return Object.keys(content.content || {}).some(contentKey => {
                                                const normalizedContentKey = contentKey.toLowerCase().replace(/[^a-z0-9]/g, '');
                                                return normalizedContentKey.includes(normalizedSection) || normalizedSection.includes(normalizedContentKey) ||
                                                    (normalizedSection === 'questions' && normalizedContentKey === 'questions') ||
                                                    (normalizedSection === 'activities' && normalizedContentKey === 'activities');
                                            });
                                        })
                                        .map(([section, answers]: [string, any], idx) => (
                                            <div key={idx} className="space-y-4">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">{section.replace(/_/g, ' ')}</p>
                                                <div className="space-y-3">
                                                    {Array.isArray(answers) ? (
                                                        answers.map((ans, i) => (
                                                            <div key={i} className="flex gap-3 items-start text-sm">
                                                                <span className="shrink-0 font-black text-emerald-400">#{i + 1}</span>
                                                                <p className="font-bold text-emerald-900/80 leading-relaxed">{typeof ans === 'object' ? JSON.stringify(ans) : ans}</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <p className="font-bold text-emerald-900/80 text-sm leading-relaxed">{JSON.stringify(answers)}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function AssignmentsList() {
    const [open, setOpen] = useState(false);
    const [gradingAssignment, setGradingAssignment] = useState<any>(null);
    const [viewingAssignment, setViewingAssignment] = useState<any>(null);
    const [selectedGrade, setSelectedGrade] = useState("10");
    const [selectedSubject, setSelectedSubject] = useState("Science");
    const queryClient = useQueryClient();

    const { data: assignments, isLoading } = useQuery({
        queryKey: ['assignments'],
        queryFn: async () => {
            const res = await api.get('/assignments');
            return res.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/assignments', data);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Assignment created!");
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ['assignments'] });
        }
    });

    const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            ...Object.fromEntries(formData.entries()),
            grade: selectedGrade,
            subject: selectedSubject
        };
        createMutation.mutate(data);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl font-bold">
                            <Plus className="w-5 h-5 mr-2" />
                            Manual Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Assignment</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input name="title" placeholder="e.g. Science Project" required />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Input name="description" placeholder="Instructions..." required />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Class</Label>
                                    <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[...Array(12)].map((_, i) => (
                                                <SelectItem key={i} value={(i + 1).toString()}>Class {i + 1}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Subject</Label>
                                    <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["Mathematics", "Science", "English", "Social Studies", "Hindi", "Computer Science", "Arts", "Physical Education"].map((s) => (
                                                <SelectItem key={s} value={s}>{s}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Due Date</Label>
                                    <Input name="dueDate" type="date" required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Score</Label>
                                    <Input name="maxScore" type="number" defaultValue="100" />
                                </div>
                            </div>
                            <Button type="submit" className="w-full bg-[#4F46E5]" disabled={createMutation.isPending}>
                                {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Assignment"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isLoading ? (
                    <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center py-20 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin text-[#4F46E5] mb-4" />
                        <p className="font-medium animate-pulse">Loading assignments...</p>
                    </div>
                ) : assignments?.length === 0 ? (
                    <div className="col-span-2 text-center py-12 text-slate-500">No assignments found. Use the AI Generator to create one!</div>
                ) : assignments?.map((asn: any) => (
                    <Card key={asn.id} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                    {asn.subject?.name || 'Science'}
                                </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-1">{asn.title}</h3>
                            <p className="text-sm text-slate-500 mb-4 line-clamp-2">{asn.description}</p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center text-slate-400 text-sm font-medium">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    Due {new Date(asn.dueDate).toLocaleDateString()}
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="font-bold text-slate-500 hover:bg-slate-100"
                                        onClick={() => setViewingAssignment(asn)}
                                    >
                                        <Eye className="w-4 h-4 mr-1" /> View
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="font-bold text-[#4F46E5] hover:bg-indigo-50"
                                        onClick={() => setGradingAssignment(asn)}
                                    >
                                        Grade <ChevronRight className="w-4 h-4 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* View Assignment Content Dialog */}
            <Dialog open={!!viewingAssignment} onOpenChange={(open) => !open && setViewingAssignment(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 border-none bg-slate-50">
                    <div className="sticky top-0 z-50 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">{viewingAssignment?.title}</h2>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{viewingAssignment?.subject?.name || 'General'} • Grade {viewingAssignment?.grade}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => window.print()}>
                                <Printer className="w-4 h-4 mr-2" /> Print
                            </Button>
                            <Button size="sm" className="bg-indigo-600 rounded-xl" onClick={() => setViewingAssignment(null)}>Close</Button>
                        </div>
                    </div>
                    <div className="p-8">
                        {viewingAssignment && <AssignmentDisplay content={viewingAssignment} />}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Grading Dialog */}
            <Dialog open={!!gradingAssignment} onOpenChange={(open) => !open && setGradingAssignment(null)}>
                <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex justify-between items-center">
                            <span>Grading: {gradingAssignment?.title}</span>
                            <span className="text-sm font-normal text-slate-500 bg-slate-100 px-3 py-1 rounded-full">{gradingAssignment?.subject?.name || 'General'}</span>
                        </DialogTitle>
                    </DialogHeader>
                    {gradingAssignment && <GradingInterface assignment={gradingAssignment} />}
                </DialogContent>
            </Dialog>
        </div>
    );
}
