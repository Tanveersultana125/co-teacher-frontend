import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
    Sparkles,
    BookOpen,
    GraduationCap,
    ChevronRight,
    Loader2,
    CheckCircle2,
    FileText,
    Download,
    Share2,
    Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import api from "@/api/client";

const LessonPlanner = () => {
    const location = useLocation();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    // Form State
    const [topic, setTopic] = useState(location.state?.initialTopic || "");
    const [curriculum, setCurriculum] = useState("");
    const [grade, setGrade] = useState("");
    const [subject, setSubject] = useState("");
    const [subjects, setSubjects] = useState<any[]>([]);

    // Lesson state
    const [generatedLesson, setGeneratedLesson] = useState<any>(null);

    useEffect(() => {
        const fetchSubjects = async () => {
            if (!curriculum || !grade) {
                setSubjects([]);
                return;
            }
            try {
                const res = await api.get(`/curriculum/subjects/${curriculum}/${grade}`);
                setSubjects(res.data);
            } catch (err) {
                console.error("Failed to fetch subjects", err);
                // Mock subjects if API fails
                setSubjects([
                    { id: "1", name: "Mathematics" },
                    { id: "2", name: "Science" },
                    { id: "3", name: "History" },
                    { id: "4", name: "Computer Science" }
                ]);
            }
        };
        fetchSubjects();
    }, [curriculum, grade]);

    const handleGenerate = async () => {
        if (!topic || !curriculum || !grade || !subject) {
            toast({
                variant: "destructive",
                title: "Incomplete details",
                description: "Please fill in all fields to generate a lesson plan."
            });
            return;
        }

        setLoading(true);
        try {
            const res = await api.post("/lessons/generate", {
                topic,
                curriculum,
                grade,
                subjectId: subject
            });
            setGeneratedLesson(res.data);
            toast({
                title: "Magic in progress!",
                description: "Your lesson plan has been generated successfully."
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Generation failed",
                description: "There was an error connecting to the AI engine."
            });
            // Mock output for demo if backend is not ready
            setGeneratedLesson({
                title: topic,
                content: "Detailed AI generated content for " + topic + "..."
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b-4 border-purple-50">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
                        <Sparkles className="w-10 h-10 text-primary" />
                        AI Lesson Planner
                    </h1>
                    <p className="text-slate-500 font-bold mt-2">Create professional, curriculum-aligned lesson plans in seconds.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 space-y-6">
                    <Card className="p-8 border-none shadow-xl bg-white rounded-3xl space-y-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tighter uppercase">1. Configuration</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Curriculum</label>
                                    <Select onValueChange={setCurriculum}>
                                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-transparent font-bold">
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CBSE">CBSE (India)</SelectItem>
                                            <SelectItem value="ICSE">ICSE (India)</SelectItem>
                                            <SelectItem value="SSC">SSC (State)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Class</label>
                                    <Select onValueChange={setGrade}>
                                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-transparent font-bold">
                                            <SelectValue placeholder="Select Grade" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[...Array(12)].map((_, i) => (
                                                <SelectItem key={i} value={(i + 1).toString()}>Grade {i + 1}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Select Subject</label>
                                    <Select onValueChange={setSubject}>
                                        <SelectTrigger className="h-12 rounded-xl bg-slate-50 border-transparent font-bold">
                                            <SelectValue placeholder="Choose Subject" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-black text-slate-900 mb-4 tracking-tighter uppercase">2. Topic</h3>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Main Concept</label>
                                    <Input
                                        placeholder="e.g. Thermodynamics, WW2, etc."
                                        className="h-12 rounded-xl bg-slate-50 border-transparent focus-visible:bg-white transition-all font-bold placeholder:font-medium"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <Button
                            className="w-full h-14 rounded-2xl btn-premium text-lg font-bold"
                            onClick={handleGenerate}
                            disabled={loading}
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Creating Magic...</>
                            ) : (
                                <><Sparkles className="w-5 h-5 mr-2" /> Generate Lesson</>
                            )}
                        </Button>
                    </Card>

                    <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100 flex gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                            <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <p className="text-xs font-bold text-slate-600 leading-relaxed">
                            Generated lessons are automatically saved to your <span className="text-primary italic">Content Library</span> for later use.
                        </p>
                    </div>
                </div>

                {/* Display Panel */}
                <div className="lg:col-span-2">
                    {generatedLesson ? (
                        <div className="space-y-6">
                            <Card className="border-none shadow-xl bg-white rounded-[2rem] overflow-hidden">
                                <div className="bg-slate-900 p-10 text-white">
                                    <div className="flex justify-between items-start mb-6">
                                        <span className="px-4 py-1.5 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest">Curriculum Output</span>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost" className="rounded-lg hover:bg-white/10"><Download className="w-5 h-5" /></Button>
                                            <Button size="icon" variant="ghost" className="rounded-lg hover:bg-white/10"><Share2 className="w-5 h-5" /></Button>
                                            <Button size="icon" variant="ghost" className="rounded-lg hover:bg-rose-500/20 text-rose-400"><Trash2 className="w-5 h-5" /></Button>
                                        </div>
                                    </div>
                                    <h2 className="text-4xl font-extrabold font-display leading-tight">{generatedLesson.title}</h2>
                                    <div className="flex gap-4 mt-6 opacity-60 font-bold text-sm">
                                        <span>Grade {grade}</span>
                                        <span>•</span>
                                        <span>{curriculum}</span>
                                        <span>•</span>
                                        <span>Generated Today</span>
                                    </div>
                                </div>
                                <div className="p-10 space-y-8">
                                    <div className="prose prose-indigo max-w-none">
                                        <div className="whitespace-pre-line text-slate-600 leading-loose text-lg font-medium">
                                            {generatedLesson.content}
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t border-slate-100 grid grid-cols-2 gap-4">
                                        <Button className="h-14 rounded-2xl bg-slate-900 text-white font-bold text-lg">Edit Details</Button>
                                        <Button variant="outline" className="h-14 rounded-2xl border-slate-200 font-bold text-lg">Send to Students</Button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] border-4 border-dashed border-slate-200 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center group">
                            <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                                <FileText className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-2xl font-black text-slate-300 italic">Plan the Magic.</h3>
                            <p className="text-slate-400 mt-2 font-bold max-w-xs">Configure your lesson on the left to witness the power of AI generation.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonPlanner;
