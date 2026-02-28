import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Sparkles, Loader2, Download, ScrollText } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

export function QuestionPaperTab() {
    const [formData, setFormData] = useState({
        subject: "",
        grade: "10",
        curriculum: "CBSE",
        marks: "100",
        difficulty: "Medium",
        examType: "Mid-Term",
        syllabus: "",
        previousPapers: false
    });
    const [paper, setPaper] = useState<any>(null);
    const [activeView, setActiveView] = useState<"paper" | "key" | "scheme">("paper");

    const { data: subjects } = useQuery({
        queryKey: ['curriculum', formData.curriculum, formData.grade],
        queryFn: async () => {
            const res = await api.get('/curriculum/metadata', {
                params: { curriculum: formData.curriculum, class: formData.grade }
            });
            return res.data;
        },
        enabled: !!formData.grade && !!formData.curriculum
    });

    const generateMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/exams/generate', data);
            return res.data;
        },
        onSuccess: (data) => {
            setPaper(data);
            toast.success("Question paper generated!");
        }
    });

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-slate-900 font-display">Question Paper Generator</h2>
                <p className="text-slate-500 font-medium">Create exam-ready papers with balanced difficulty</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <Card className="lg:col-span-1 border-none shadow-sm bg-white p-6 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Curriculum</Label>
                            <Select value={formData.curriculum} onValueChange={(v) => { setFormData({ ...formData, curriculum: v, subject: "" }); }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Board" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["CBSE", "ICSE", "SSC"].map(b => (
                                        <SelectItem key={b} value={b}>{b}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Class / Grade</Label>
                            <Select value={formData.grade} onValueChange={(v) => { setFormData({ ...formData, grade: v, subject: "" }); }}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(g => (
                                        <SelectItem key={g} value={g}>Class {g}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Select onValueChange={(v) => setFormData({ ...formData, subject: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects?.subjects?.map((s: string) => (
                                        <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>


                    <div className="space-y-2">
                        <Label>Exam Type</Label>
                        <Select onValueChange={(v) => setFormData({ ...formData, examType: v })} defaultValue="Mid-Term">
                            <SelectTrigger>
                                <SelectValue placeholder="Exam Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Unit Test">Unit Test</SelectItem>
                                <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                                <SelectItem value="Final Exam">Final Exam</SelectItem>
                                <SelectItem value="Surprise Test">Surprise Test</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Syllabus / Chapters</Label>
                        <Input
                            placeholder="e.g. Chapters 1-5, Thermodynamics"
                            value={formData.syllabus}
                            onChange={(e) => setFormData({ ...formData, syllabus: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Total Marks</Label>
                        <Input
                            type="number"
                            value={formData.marks}
                            onChange={(e) => setFormData({ ...formData, marks: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Difficulty</Label>
                        <Select defaultValue="Medium" onValueChange={(v) => setFormData({ ...formData, difficulty: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Difficulty" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Easy">Easy</SelectItem>
                                <SelectItem value="Medium">Medium</SelectItem>
                                <SelectItem value="Hard">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between space-x-2 py-2">
                        <Label htmlFor="previous-papers" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Include Previous Year Questions
                        </Label>
                        <Switch id="previous-papers" onCheckedChange={(checked) => setFormData({ ...formData, previousPapers: checked })} />
                    </div>

                    <Button
                        className="w-full h-12 bg-[#4F46E5] font-bold rounded-xl"
                        disabled={!formData.subject || generateMutation.isPending}
                        onClick={async () => {
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
                            generateMutation.mutate(formData);
                        }}
                    >
                        {generateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                        Generate Paper
                    </Button>
                </Card>

                <Card className="lg:col-span-3 border-none shadow-sm bg-white p-10 min-h-[600px]">
                    {paper ? (
                        <div className="space-y-8">
                            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                                <div className="text-center w-full">
                                    <h1 className="text-2xl font-bold uppercase tracking-tight">{paper.title}</h1>
                                    <div className="flex justify-center gap-6 mt-2 text-sm font-bold text-slate-500 uppercase">
                                        <span>Time: 3 Hours</span>
                                        <span>Marks: {paper.totalMarks}</span>
                                        <span>Level: {paper.difficulty}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 mb-6 p-1 bg-slate-100/80 rounded-lg w-fit">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveView('paper')}
                                    className={`rounded-md font-bold ${activeView === 'paper' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                                >
                                    Question Paper
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveView('key')}
                                    className={`rounded-md font-bold ${activeView === 'key' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                                >
                                    Answer Key
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setActiveView('scheme')}
                                    className={`rounded-md font-bold ${activeView === 'scheme' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}
                                >
                                    Marking Scheme
                                </Button>
                            </div>

                            {activeView === 'paper' && paper.sections.map((section: any, idx: number) => (
                                <div key={idx} className="space-y-4">
                                    <h3 className="font-bold text-slate-800 border-l-4 border-indigo-500 pl-3">{section.name || section.title}</h3>
                                    <div className="space-y-3 pl-4">
                                        {section.questions.map((q: any, qIdx: number) => (
                                            <div key={qIdx} className="mb-4">
                                                <p className="text-slate-700 leading-relaxed font-medium">
                                                    <span className="font-bold mr-2 text-slate-900">{q.id || `Q${qIdx + 1}`}.</span>
                                                    {typeof q === 'string' ? q : q.q}
                                                    <span className="float-right text-xs font-bold text-slate-400">[{typeof q === 'string' ? '5' : q.marks} Marks]</span>
                                                </p>
                                                {q.options && (
                                                    <div className="grid grid-cols-2 gap-2 mt-2 ml-4">
                                                        {q.options.map((opt: string, optIdx: number) => (
                                                            <div key={optIdx} className="text-sm text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                                {String.fromCharCode(65 + optIdx)}. {opt}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {activeView === 'key' && (
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-900 mb-6 font-display">Answer Key</h3>
                                    <div className="grid gap-4 max-h-[500px] overflow-y-auto pr-2">
                                        {Object.entries(paper.answerKey || {}).map(([qId, ans]: any) => (
                                            <div key={qId} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-slate-100/50">
                                                <div className="flex-shrink-0 w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold">
                                                    {qId}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 text-sm mb-1">Correct Answer</p>
                                                    <p className="text-slate-600">{ans}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {activeView === 'scheme' && (
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-900 mb-4 font-display">Marking Scheme Guide</h3>
                                    <div className="prose prose-sm max-w-none text-slate-600 leading-relaxed bg-white p-6 rounded-xl border border-slate-100/50 shadow-sm">
                                        {paper.markingScheme || "Standard stepwise marking applies."}
                                    </div>
                                </div>
                            )}

                            <div className="pt-8 flex justify-center border-t border-slate-50">
                                <Button className="font-bold bg-slate-900 px-8 py-6 rounded-xl">
                                    <Download className="w-5 h-5 mr-2" /> Download PDF for Print
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
                            <ScrollText className="w-16 h-16 opacity-20" />
                            <p className="font-medium">Generate a paper to see the blueprint</p>
                        </div>
                    )}
                </Card>
            </div >
        </div >
    );
}
