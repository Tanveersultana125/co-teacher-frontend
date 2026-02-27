import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import api from "@/api/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export function LessonCreateDialog() {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [boards, setBoards] = useState<string[]>([]);
    const [grades, setGrades] = useState<number[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [topics, setTopics] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        board: "",
        grade: "",
        subjectId: "",
        topicId: "",
        customTopic: "",
        title: "",
        aiAssist: true
    });

    const queryClient = useQueryClient();

    // Load boards on mount
    useEffect(() => {
        api.get("/curriculum/boards").then(res => setBoards(res.data));
    }, []);

    // Load grades when board changes
    useEffect(() => {
        if (formData.board) {
            api.get(`/curriculum/grades/${formData.board}`).then(res => setGrades(res.data));
        }
    }, [formData.board]);

    // Load subjects when grade changes
    useEffect(() => {
        if (formData.grade) {
            api.get(`/curriculum/subjects/${formData.board}/${formData.grade}`).then(res => setSubjects(res.data));
        }
    }, [formData.grade]);

    // Load topics when subject changes
    useEffect(() => {
        if (formData.subjectId) {
            const subject = subjects.find(s => s.id === formData.subjectId);
            if (subject) {
                // Flat topics from chapters
                const allTopics = subject.chapters.flatMap((c: any) => c.topics);
                setTopics(allTopics);
            }
        }
    }, [formData.subjectId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const subject = subjects.find(s => s.id === formData.subjectId);
            const topic = topics.find(t => t.id === formData.topicId);

            const payload = {
                ...formData,
                curriculum: formData.board,
                subject: subject?.name || "",
                topic: formData.topicId === 'custom' ? formData.customTopic : (topic?.name || ""),
            };

            await api.post("/lessons", payload);
            toast.success("Lesson plan created successfully!");
            setOpen(false);
            queryClient.invalidateQueries({ queryKey: ["lessons"] });
        } catch (error) {
            toast.error("Failed to create lesson plan.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-xl px-6 font-bold shadow-lg shadow-indigo-100">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create Lesson Plan</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Curriculum Board</Label>
                        <Select onValueChange={(v) => setFormData({ ...formData, board: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Board" />
                            </SelectTrigger>
                            <SelectContent>
                                {boards.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Grade / Class</Label>
                            <Select disabled={!formData.board} onValueChange={(v) => setFormData({ ...formData, grade: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {grades.map(g => <SelectItem key={g} value={g.toString()}>{g}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Subject</Label>
                            <Select disabled={!formData.grade} onValueChange={(v) => setFormData({ ...formData, subjectId: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Subject" />
                                </SelectTrigger>
                                <SelectContent>
                                    {subjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Topic</Label>
                        <Select disabled={!formData.subjectId} onValueChange={(v) => {
                            if (v === "custom") {
                                setFormData({ ...formData, topicId: "custom" });
                            } else {
                                setFormData({ ...formData, topicId: v, customTopic: "" });
                            }
                        }}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Topic" />
                            </SelectTrigger>
                            <SelectContent>
                                {topics.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                                <SelectItem value="custom" className="font-bold text-indigo-600">+ Custom Topic</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.topicId === 'custom' && (
                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                            <Label>Custom Topic Name</Label>
                            <Input
                                placeholder="Enter custom topic name..."
                                value={formData.customTopic || ""}
                                onChange={(e) => setFormData({ ...formData, customTopic: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Lesson Title</Label>
                        <Input
                            placeholder="e.g. Introduction to Atoms"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <Button type="submit" className="w-full bg-[#4F46E5] h-12 rounded-xl font-bold" disabled={loading}>
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Sparkles className="w-5 h-5 mr-2" />}
                        {formData.aiAssist ? "Generate with AI" : "Create Empty Plan"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
