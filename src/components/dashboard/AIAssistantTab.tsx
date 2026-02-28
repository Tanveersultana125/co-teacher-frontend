import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from 'react-markdown';
import { useQueryClient } from "@tanstack/react-query";
import {
    Sparkles,
    BookOpen,
    FileUp,
    Settings2,
    Send,
    Loader2,
    CheckCircle2,
    GraduationCap,
    ArrowLeft,
    Brain,
    ChevronLeft,
    ChevronRight,
    FileText,
    Library,
    HelpCircle,
    PlayCircle,
    ShieldCheck,
    Presentation,
    ClipboardList,
    Lightbulb,
    MessageSquare,
    Edit3,
    Download,
    Target,
    Youtube,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/api/client";
import { toast } from "sonner";
import { QuickActionDialog } from "./QuickActionDialog";

interface AIAssistantTabProps {
    initialMode?: "lesson" | "material" | "quiz" | "assignment";
    preloadedResult?: any;
}

export function AIAssistantTab({ initialMode = "lesson", preloadedResult }: AIAssistantTabProps) {
    const navigate = useNavigate();
    const [mode, setMode] = useState(initialMode);

    // Configuration State
    const [board, setBoard] = useState("CBSE");
    const [grade, setGrade] = useState(preloadedResult?.grade || "");
    const [subject, setSubject] = useState(preloadedResult?.subject?.name || preloadedResult?.subject || "");
    const [topic, setTopic] = useState(preloadedResult?.topic?.name || preloadedResult?.topic || "");
    const [title, setTitle] = useState(preloadedResult?.title || "");
    const [detailLevel, setDetailLevel] = useState([50]);
    const [pdfText, setPdfText] = useState("");
    const [unitDetails, setUnitDetails] = useState("");
    const [sessionDuration, setSessionDuration] = useState("60");
    const [numSessions, setNumSessions] = useState("1");
    const [instituteName, setInstituteName] = useState("");
    const [openTopic, setOpenTopic] = useState(false);
    const [openSubject, setOpenSubject] = useState(false);
    // Quiz Config
    const [quizDifficulty, setQuizDifficulty] = useState("Mixed");
    const [quizNumQuestions, setQuizNumQuestions] = useState(5);

    // Data State
    const [subjectsList, setSubjectsList] = useState<string[]>([]);
    const [topicsMap, setTopicsMap] = useState<Record<string, string[]>>({});
    const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

    const [isGenerating, setIsGenerating] = useState(false);
    const [generationProgress, setGenerationProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [result, setResult] = useState<any>(preloadedResult || null);
    const [activeActivityIndex, setActiveActivityIndex] = useState<number | null>(null);
    const [showAnswerKey, setShowAnswerKey] = useState(false);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [showQuickAction, setShowQuickAction] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isEditingLink, setIsEditingLink] = useState(false);
    const [tempLink, setTempLink] = useState({ title: "", url: "" });
    const [isPrinting, setIsPrinting] = useState(false);

    const queryClient = useQueryClient();

    // Load pre-existing data if provided (from Library)
    useEffect(() => {
        if (preloadedResult) {
            setResult(preloadedResult);

            // Auto-detect mode from preloaded data
            if (preloadedResult.type === 'MATERIAL' || preloadedResult.subType) {
                setMode('material');
            } else if (preloadedResult.type === 'QUIZ') {
                setMode('quiz');
            } else {
                setMode('lesson');
            }

            setGrade(preloadedResult.grade?.toString() || "");
            setSubject(preloadedResult.subject?.name || preloadedResult.subjectName || preloadedResult.subject || "");
            setTopic(preloadedResult.topic?.name || preloadedResult.topicName || preloadedResult.topic || "");
            setTitle(preloadedResult.title || "");

            if (preloadedResult.generatedImage) {
                setGeneratedImage(preloadedResult.generatedImage);
            }
        }
    }, [preloadedResult]);

    // Auto-fetch topic-relevant image from Unsplash when material result loads
    useEffect(() => {
        if (mode === 'material' && result && topic) {
            setGeneratedImage(null); // reset first
            // Build a search query from topic + subject + illustration description
            const illustrationHint = result?.illustrationDescription || "";
            const searchQuery = encodeURIComponent(
                `${topic} ${subject} ${illustrationHint}`.trim().substring(0, 60)
            );
            // Use Unsplash Source API (no key needed) with a random seed per topic
            const seed = encodeURIComponent(topic + subject);
            const unsplashUrl = `https://source.unsplash.com/800x800/?${searchQuery}&sig=${seed}`;
            // Verify it loads
            const img = new Image();
            img.onload = () => setGeneratedImage(unsplashUrl);
            img.onerror = () => {
                // Fallback: use picsum with topic-based seed
                const fallback = `https://picsum.photos/seed/${seed}/800/800`;
                setGeneratedImage(fallback);
            };
            img.src = unsplashUrl;
        }
    }, [mode, result, topic, subject]);

    // Fetch Metadata when Board or Grade changes
    useEffect(() => {
        if (board && grade) {
            setIsLoadingMetadata(true);
            console.log(`[DEBUG] Fetching metadata for Board: ${board}, Grade: ${grade}`);
            api.get('/curriculum/metadata', { params: { curriculum: board, class: grade } })
                .then(res => {
                    console.log(`[DEBUG] Metadata received:`, res.data);
                    setSubjectsList(res.data.subjects || []);
                    setTopicsMap(res.data.topics || {});

                    // Only reset subject if the current one is no longer valid for the new metadata
                    if (subject && !res.data.subjects?.includes(subject)) {
                        console.log(`[DEBUG] Current subject '${subject}' not found in new metadata, resetting.`);
                        setSubject("");
                        setTopic("");
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch curriculum data", err);
                    setSubjectsList([]);
                    setTopicsMap({});
                })
                .finally(() => {
                    setIsLoadingMetadata(false);
                });
        } else {
            setSubjectsList([]);
            setTopicsMap({});
        }
    }, [board, grade]);

    // Handle File Upload
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setIsUploading(true);
        try {
            const res = await api.post('/upload/pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPdfText(res.data.text);
            toast.success("PDF uploaded and processed!");
        } catch (err) {
            toast.error("Upload failed");
        } finally {
            setIsUploading(false);
        }
    };

    const handleGenerate = async () => {
        // Validation: For non-quiz modes, strict check. For quiz, allow if topic is present.
        if (mode !== 'quiz' && (!grade || !subject || !topic)) {
            toast.error("Please select all required fields");
            return;
        }
        if (mode === 'quiz' && !topic) {
            toast.error("Please enter a topic");
            return;
        }

        setIsGenerating(true);
        setGenerationProgress(0);
        setResult(null);
        setCurrentPage(1);
        setGeneratedImage(null);

        // Progress simulation
        const interval = setInterval(() => {
            setGenerationProgress(prev => {
                if (prev >= 95) {
                    clearInterval(interval);
                    return 95;
                }
                return prev + (Math.random() * 15);
            });
        }, 1500);

        try {
            let endpoint = '';
            // If quiz mode and fields are missing, provide defaults
            const effectiveGrade = grade || "10";
            const effectiveSubject = subject || "General";

            let payload: any = {
                curriculum: board,
                grade: effectiveGrade,
                subject: effectiveSubject, // Sending Name
                topic,   // Sending Name
                title,
                pdfText,

                duration: sessionDuration,
                unitDetails,
                numSessions
            };

            if (mode === 'lesson') {
                endpoint = '/lessons'; // This maps to createLesson in controller which now handles Names
                payload.aiAssist = true;
            } else if (mode === 'material') {
                endpoint = '/materials/generate';
                payload.type = 'NOTES';
                payload.topicId = "temp";
            } else if (mode === 'assignment') {
                endpoint = '/assignments/generate';
            } else {
                endpoint = '/quizzes/generate';
                // Map Difficulty to Bloom's
                let bloomLevel = "Remember";
                if (quizDifficulty === "Intermediate") bloomLevel = "Apply";
                if (quizDifficulty === "Advanced") bloomLevel = "Evaluate";
                if (quizDifficulty === "Mixed") bloomLevel = "Mixed";

                payload.bloomLevel = bloomLevel;
                payload.count = quizNumQuestions;
                payload.questionType = "MCQ"; // Enforce MCQ as per user request for now, or add selector later if needed
                payload.instituteName = instituteName;
            }

            const res = await api.post(endpoint, payload);
            setResult({ ...res.data, instituteName });
            if (res.data.generatedImage) {
                setGeneratedImage(res.data.generatedImage);
            }

            // Invalidate library so it reflects the new draft
            if (mode !== 'assignment') { // Assignments might not auto-save to library yet, or handled differently
                queryClient.invalidateQueries({ queryKey: ['lessons'] });
            }

            toast.success("Content generated successfully!");
        } catch (err) {
            console.error(err);
            const errorMessage = (err as any).response?.data?.details || (err as any).response?.data?.error || (err as any).message || "Generation failed. Please try again.";
            toast.error(`Generation failed: ${errorMessage}`);
        } finally {
            setIsGenerating(false);
            setGenerationProgress(100);
        }
    };

    const handleSaveToLibrary = async () => {
        if (!result?.id) return;

        setIsSaving(true);
        try {
            // Update lesson status to PUBLISHED so it's "official"
            await api.patch(`/lessons/${result.id}`, { status: 'PUBLISHED' });
            setResult({ ...result, status: 'PUBLISHED' });
            queryClient.invalidateQueries({ queryKey: ['lessons'] });
            toast.success("Saved to Library!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to save to library");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDownloadPDF = () => {
        if (!result) return;
        setIsPrinting(true);

        let contentHTML = "";

        if (mode === 'material') {
            const sections = (result.sections || []).map((s: any) =>
                `<div class="pdf-section"><h3>${s.heading || ''}</h3><p>${s.content || ''}</p>${(s.bulletPoints || []).length ? `<ul>${s.bulletPoints.map((b: string) => `<li>${b}</li>`).join('')}</ul>` : ''}</div>`
            ).join('');
            contentHTML = `
                <div class="pdf-cover"><span class="pdf-badge">TEACHING MATERIAL</span><h1>${result.title || topic}</h1><p>${subject} | Grade ${grade} | ${board}</p></div>
                <div class="pdf-section"><p>${result.intro || ''}</p></div>
                ${sections}
                <div class="pdf-pagebreak"></div>
                ${result.reviewQuestions?.length ? `<div class="pdf-section"><h3>Review Questions</h3><ol>${result.reviewQuestions.map((q: string) => `<li>${q}</li>`).join('')}</ol></div>` : ''}
                ${result.preparationTips?.length ? `<div class="pdf-section"><h3>Study Tips</h3><ul>${result.preparationTips.map((t: string) => `<li>${t}</li>`).join('')}</ul></div>` : ''}
                ${result.learningObjectives?.length ? `<div class="pdf-section"><h3>Learning Objectives</h3><ul>${result.learningObjectives.map((o: string) => `<li>${o}</li>`).join('')}</ul></div>` : ''}`;

        } else if (mode === 'lesson') {
            // activities is stored as a JSON string in Firestore, parse it safely
            const parsedActivities: any[] = (() => {
                try {
                    const acts = result.activities;
                    if (!acts) return [];
                    return Array.isArray(acts) ? acts : JSON.parse(acts);
                } catch { return []; }
            })();
            // materials can be a string or array
            const parsedMaterials: string[] = (() => {
                const m = result.materials;
                if (!m) return [];
                if (Array.isArray(m)) return m;
                return [m];
            })();
            // objective can be a string or array
            const parsedObjectives: string[] = (() => {
                const o = result.objective;
                if (!o) return [];
                if (Array.isArray(o)) return o;
                return [o];
            })();

            contentHTML = `
                <div class="pdf-cover"><span class="pdf-badge">LESSON PLAN</span><h1>${result.title || topic}</h1><p>${subject} | Grade ${grade} | ${board}</p></div>
                ${parsedObjectives.length ? `<div class="pdf-section"><h3>Learning Objectives</h3><ol>${parsedObjectives.map((o: string) => `<li>${o}</li>`).join('')}</ol></div>` : ''}
                ${parsedMaterials.length ? `<div class="pdf-section"><h3>Materials Needed</h3><ul>${parsedMaterials.map((m: string) => `<li>${m}</li>`).join('')}</ul></div>` : ''}
                ${result.explanation ? `<div class="pdf-section"><h3>Explanation</h3><p>${result.explanation}</p></div>` : ''}
                ${result.pedagogy ? `<div class="pdf-section"><h3>Pedagogy / Hook</h3><p>${result.pedagogy}</p></div>` : ''}
                <div class="pdf-pagebreak"></div>
                ${result.inquiryBasedLearning ? `<div class="pdf-section"><h3>Inquiry Based Learning</h3><p>${result.inquiryBasedLearning}</p></div>` : ''}
                ${parsedActivities.length ? `<div class="pdf-section"><h3>Lesson Activities</h3>${parsedActivities.map((a: any) => `<div class="pdf-activity"><strong>${a.time || ''}</strong>${a.time ? ' - ' : ''}${a.description || a.task || ''}</div>`).join('')}</div>` : ''}
                ${result.assessmentMethods?.length ? `<div class="pdf-section"><h3>Assessment Methods</h3><ul>${(Array.isArray(result.assessmentMethods) ? result.assessmentMethods : [result.assessmentMethods]).map((m: string) => `<li>${m}</li>`).join('')}</ul></div>` : ''}
                ${result.differentiation ? `<div class="pdf-section"><h3>Differentiation</h3><p><strong>Advanced:</strong> ${result.differentiation.advanced || ''}</p><p><strong>Struggling:</strong> ${result.differentiation.struggling || ''}</p></div>` : ''}
                ${result.homework ? `<div class="pdf-section"><h3>Homework</h3><p>${result.homework}</p></div>` : ''}
                ${result.motivationalQuote ? `<div class="pdf-quote">${result.motivationalQuote}</div>` : ''}`;

        } else if (mode === 'assignment') {
            const assignQs = result.assignmentQuestions || result.content?.questions || result.content?.sectionD_ShortAnswers || [];
            const fillBlanks = result.fillInTheBlanks || result.content?.sectionB_FillBlanks || [];
            const activityQs = result.activityQuestions || result.content?.activities || [];
            const projectIdeas = result.projectIdeas || [];
            const answerAssignment = result.answers?.assignmentQuestions || result.answerKey?.Questions || result.answerKey?.questions || [];
            const answerFill = result.answers?.fillInTheBlanks || result.answerKey?.["Section B (Fill in the Blanks)"] || [];
            const answerActivity = result.answers?.activityQuestions || result.answerKey?.Activities || result.answerKey?.activities || [];
            contentHTML = `
                <div class="pdf-cover"><span class="pdf-badge">ASSIGNMENT</span><h1>${result.title || topic}</h1><p>${subject} | Grade ${grade} | ${board}</p></div>
                ${assignQs.length ? `<div class="pdf-section"><h3>Assignment Questions</h3><ol>${assignQs.map((q: string) => `<li>${q}</li>`).join('')}</ol></div>` : ''}
                ${fillBlanks.length ? `<div class="pdf-section"><h3>Fill in the Blanks</h3><ol>${fillBlanks.map((q: string) => `<li>${q}</li>`).join('')}</ol></div>` : ''}
                <div class="pdf-pagebreak"></div>
                ${activityQs.length ? `<div class="pdf-section"><h3>Activity Questions</h3><ol>${activityQs.map((q: string) => `<li>${q}</li>`).join('')}</ol></div>` : ''}
                ${projectIdeas.length ? `<div class="pdf-section"><h3>Project Ideas</h3><ul>${projectIdeas.map((p: string) => `<li>${p}</li>`).join('')}</ul></div>` : ''}
                ${(answerAssignment.length || answerFill.length || answerActivity.length) ? `
                <div class="pdf-pagebreak"></div>
                <div class="pdf-section pdf-answer-key"><h3>Answer Key</h3>
                    ${answerAssignment.length ? `<h4>Assignment Answers</h4><ol>${answerAssignment.map((a: string) => `<li>${a}</li>`).join('')}</ol>` : ''}
                    ${answerFill.length ? `<h4>Fill in the Blanks Answers</h4><ol>${answerFill.map((a: string) => `<li>${a}</li>`).join('')}</ol>` : ''}
                    ${answerActivity.length ? `<h4>Activity Answers</h4><ol>${answerActivity.map((a: string) => `<li>${a}</li>`).join('')}</ol>` : ''}
                </div>` : ''}`;

        } else if (mode === 'quiz') {
            contentHTML = `
                <div class="pdf-cover"><span class="pdf-badge">QUIZ</span><h1>${result.title || topic}</h1><p>${subject} | Grade ${grade} | ${board}</p></div>
                <div class="pdf-section"><ol>${(result.questions || []).map((q: any, i: number) => `
                    <li style="margin-bottom:18px">
                        <strong>Q${i + 1}. ${q.question}</strong>
                        ${q.options?.length ? `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px">${q.options.map((o: string, oi: number) => `<span>${String.fromCharCode(65 + oi)}. ${o}</span>`).join('')}</div>` : ''}
                    </li>`).join('')}</ol></div>`;
        }

        const css = `
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: Arial, sans-serif; color: #1e293b; font-size: 12pt; line-height: 1.6; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .pdf-cover { padding: 50px; background: #1A3263; color: white; margin-bottom: 30px; }
            .pdf-cover .pdf-badge { display: block; font-size: 9pt; font-weight: 900; letter-spacing: 4px; text-transform: uppercase; opacity: 0.7; margin-bottom: 12px; }
            .pdf-cover h1 { font-size: 28pt; font-weight: 900; line-height: 1.2; margin-bottom: 8px; }
            .pdf-cover p { opacity: 0.8; font-size: 11pt; }
            .pdf-section { padding: 16px 50px; margin-bottom: 16px; }
            .pdf-section h2 { font-size: 18pt; font-weight: 900; color: #1A3263; margin-bottom: 12px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
            .pdf-section h3 { font-size: 13pt; font-weight: 900; color: #1A3263; margin-bottom: 10px; border-bottom: 2px solid #e0e7ff; padding-bottom: 6px; }
            .pdf-section h4 { font-size: 10pt; font-weight: 900; color: #065f46; margin: 14px 0 6px; text-transform: uppercase; letter-spacing: 1px; }
            .pdf-section p { font-size: 11pt; line-height: 1.8; color: #475569; margin-bottom: 8px; }
            .pdf-section ul, .pdf-section ol { padding-left: 24px; }
            .pdf-section li { font-size: 11pt; line-height: 1.8; color: #475569; margin-bottom: 5px; }
            .pdf-activity { border-left: 3px solid #6366f1; padding: 8px 12px; margin-bottom: 8px; background: #f8fafc; font-size: 11pt; }
            .pdf-answer-key { background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 8px; }
            .pdf-answer-key h3 { color: #065f46 !important; border-bottom-color: #bbf7d0 !important; }
            .pdf-quote { margin: 20px 50px; padding: 16px 24px; border-left: 4px solid #f59e0b; background: #fffbeb; font-style: italic; font-size: 12pt; color: #92400e; border-radius: 4px; }
            .pdf-pagebreak { page-break-before: always; break-before: page; }
            .pdf-footer { text-align: center; font-size: 9pt; color: #94a3b8; border-top: 1px solid #e2e8f0; padding: 12px; margin-top: 40px; }
            @media print { body { margin: 0; } }
        `;

        const titleSafe = (result.title || topic || 'document').replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-');

        const fullHTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${result.title || topic}</title>
<style>${css}</style>
</head>
<body>
${contentHTML}
<div class="pdf-footer">Co-Teacher AI | Your Personal Teaching Assistant</div>
<script>
window.onload = function() {
  setTimeout(function() {
    window.print();
    setTimeout(function() { window.close(); }, 1500);
  }, 500);
};
<\/script>
</body>
</html>`;

        const printWin = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
        if (printWin) {
            printWin.document.write(fullHTML);
            printWin.document.close();
        } else {
            // Popup blocked fallback: direct file download
            const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${titleSafe}.html`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
        setIsPrinting(false);
    };


    return (
        <div className="flex flex-col bg-slate-50 min-h-[calc(100vh-140px)] relative">
            {/* Sticky Horizontal Config Bar */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-6 py-4 shadow-sm print:hidden">
                <div className="max-w-[1600px] mx-auto flex flex-wrap items-end gap-4">
                    {/* Selectors Group - Using Flex for stability */}
                    <div className="flex flex-wrap items-end gap-3 flex-1 overflow-visible">
                        <div className="flex flex-col gap-1.5 min-w-[120px]">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                            <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl text-xs font-bold ring-offset-white focus:ring-2 ring-indigo-500/10">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="lesson" className="text-xs font-bold">Lesson Plan</SelectItem>
                                    <SelectItem value="quiz" className="text-xs font-bold">Quiz</SelectItem>
                                    <SelectItem value="material" className="text-xs font-bold">Material</SelectItem>
                                    <SelectItem value="assignment" className="text-xs font-bold">Assignment</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5 min-w-[100px]">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Curriculum</label>
                            <Select value={board} onValueChange={setBoard}>
                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl text-xs font-bold ring-offset-white focus:ring-2 ring-indigo-500/10">
                                    <SelectValue placeholder="Board" />
                                </SelectTrigger>
                                <SelectContent>
                                    {["CBSE", "ICSE", "SSC"].map(b => (
                                        <SelectItem key={b} value={b} className="text-xs font-bold">{b}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5 min-w-[100px]">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Grade</label>
                            <Select value={grade} onValueChange={setGrade}>
                                <SelectTrigger className="bg-slate-50 border-slate-200 h-11 rounded-xl text-xs font-bold ring-offset-white focus:ring-2 ring-indigo-500/10">
                                    <SelectValue placeholder="Grade" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(g => (
                                        <SelectItem key={g} value={g} className="text-xs font-bold">Class {g}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex flex-col gap-1.5 min-w-[140px]">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                            <Popover open={openSubject} onOpenChange={setOpenSubject}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openSubject}
                                        disabled={!grade || isLoadingMetadata}
                                        className="w-full h-11 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold ring-offset-white focus:ring-2 ring-indigo-500/10 hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                                    >
                                        <span className="truncate flex-1 text-left">
                                            {subject || (isLoadingMetadata ? "Loading..." : "Select or type subject...")}
                                        </span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                    <Command>
                                        <CommandInput placeholder="Search or type custom subject..." />
                                        <CommandList>
                                            <CommandEmpty>
                                                <div className="p-2">
                                                    <p className="text-xs text-muted-foreground mb-2">No subject found.</p>
                                                </div>
                                            </CommandEmpty>
                                            <CommandGroup heading="Curriculum Subjects">
                                                {subjectsList.map((s) => (
                                                    <CommandItem
                                                        key={s}
                                                        value={s}
                                                        onSelect={(val) => {
                                                            setSubject(val === subject ? "" : val);
                                                            setTopic("");
                                                            setOpenSubject(false);
                                                        }}
                                                    >
                                                        <Check className={cn("mr-2 h-4 w-4", subject === s ? "opacity-100" : "opacity-0")} />
                                                        {s}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                        <div className="p-2 border-t border-slate-100 bg-slate-50">
                                            <p className="text-[10px] text-slate-400 mb-1">Or type your own:</p>
                                            <div className="flex gap-2">
                                                <input
                                                    className="flex-1 bg-white border border-slate-200 rounded-md px-2 py-1 text-xs font-medium"
                                                    placeholder="Custom subject..."
                                                    value={subject}
                                                    onChange={(e) => { setSubject(e.target.value); setTopic(""); }}
                                                    onKeyDown={(e) => {
                                                        e.stopPropagation();
                                                        if (e.key === 'Enter') setOpenSubject(false);
                                                    }}
                                                />
                                                <button
                                                    onClick={() => setOpenSubject(false)}
                                                    className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md font-bold hover:bg-indigo-700 transition-colors"
                                                >Set</button>
                                            </div>
                                        </div>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Topic - Combobox with Custom Input */}
                        <div className="flex flex-col gap-1.5 min-w-[180px] lg:flex-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Topic</label>
                            <Popover open={openTopic} onOpenChange={setOpenTopic}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openTopic}
                                        disabled={!subject || isLoadingMetadata}
                                        className="w-full h-11 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold ring-offset-white focus:ring-2 ring-indigo-500/10 hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                                    >
                                        <span className="truncate flex-1 text-left">
                                            {topic || (isLoadingMetadata ? "Loading..." : "Select or type topic...")}
                                        </span>
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search or type new topic..."
                                        />
                                        <CommandList>
                                            <CommandEmpty>
                                                <div className="p-2">
                                                    <p className="text-xs text-muted-foreground mb-2">No topic found.</p>
                                                </div>
                                            </CommandEmpty>

                                            <CommandGroup heading="Curriculum Topics">
                                                {(topicsMap[subject] || []).map((t) => (
                                                    <CommandItem
                                                        key={t}
                                                        value={t}
                                                        onSelect={(currentValue) => {
                                                            setTopic(currentValue === topic ? "" : currentValue);
                                                            setOpenTopic(false);
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                topic === t ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {t}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                    <div className="p-2 border-t border-slate-100 bg-slate-50">
                                        <p className="text-[10px] text-slate-400 mb-1">Or type your own:</p>
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 bg-white border border-slate-200 rounded-md px-2 py-1 text-xs"
                                                placeholder="Type custom topic..."
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') setOpenTopic(false);
                                                }}
                                            />
                                            <Button size="sm" className="h-7 text-xs" onClick={() => setOpenTopic(false)}>Done</Button>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Title Field - Made Wider */}
                        <div className="flex flex-col gap-1.5 min-w-[200px] lg:flex-1">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                {mode === 'quiz' ? 'Quiz Title' : 'Lesson Title'}
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder={mode === 'quiz' ? "e.g. Algebra Quiz 1" : "e.g. Intro to Trigonometry"}
                                className="flex h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-indigo-500/10"
                            />
                        </div>

                        {/* Institute Name - Only for Quiz - Made Wider */}
                        {mode === 'quiz' && (
                            <div className="space-y-1.5 lg:col-span-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Institute Name</label>
                                <input
                                    type="text"
                                    value={instituteName}
                                    onChange={(e) => setInstituteName(e.target.value)}
                                    placeholder="e.g. Deccan Institute"
                                    className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-indigo-500/10"
                                />
                            </div>
                        )}
                    </div>

                    {/* Actions Group */}
                    <div className="flex items-center gap-3">
                        <div className="relative group">
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileUpload}
                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                            />
                            <Button
                                variant="outline"
                                className={`h - 11 px - 4 rounded - xl border - slate - 200 font - bold text - xs transition - all ${pdfText ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white hover:bg-slate-50'} `}
                            >
                                {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileUp className="w-4 h-4 mr-2" />}
                                {pdfText ? 'PDF Added' : 'Add PDF'}
                            </Button>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={isGenerating || !topic}
                            className="h-11 px-6 bg-[#0D5355] hover:bg-[#083334] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-100"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                            {isGenerating ? 'Generating...' : 'Generate'}
                        </Button>
                    </div>

                    {/* Extended Inputs */}
                    <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100">
                        {mode === 'lesson' && (
                            <>
                                <div className="lg:col-span-2 space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Unit Details</label>
                                    <textarea
                                        value={unitDetails}
                                        onChange={(e) => setUnitDetails(e.target.value)}
                                        placeholder="Provide details about the unit you want to teach..."
                                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-indigo-500/10 resize-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Session Duration (Minutes)</label>
                                    <input
                                        type="number"
                                        value={sessionDuration}
                                        onChange={(e) => setSessionDuration(e.target.value)}
                                        min="15"
                                        max="180"
                                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-indigo-500/10"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Number of Sessions</label>
                                    <input
                                        type="number"
                                        value={numSessions}
                                        onChange={(e) => setNumSessions(e.target.value)}
                                        min="1"
                                        max="20"
                                        className="flex h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-indigo-500/10"
                                    />
                                </div>
                            </>
                        )}

                        {mode === 'quiz' && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Difficulty</label>
                                    <Select
                                        value={quizDifficulty}
                                        onValueChange={setQuizDifficulty}
                                    >
                                        <SelectTrigger className="bg-slate-50 border-slate-200 h-14 rounded-xl text-base font-bold">
                                            <SelectValue placeholder="Difficulty" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Beginner" className="text-sm font-bold">Beginner</SelectItem>
                                            <SelectItem value="Intermediate" className="text-sm font-bold">Intermediate</SelectItem>
                                            <SelectItem value="Advanced" className="text-sm font-bold">Advanced</SelectItem>
                                            <SelectItem value="Mixed" className="text-sm font-bold">Mixed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">No. of Questions</label>
                                    <div className="flex items-center h-14 w-full min-w-[140px] rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 ring-indigo-500/10 transition-all">
                                        <button
                                            onClick={() => setQuizNumQuestions(prev => Math.max(1, (typeof prev === 'number' ? prev : 5) - 1))}
                                            className="h-full w-10 shrink-0 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors border-r border-slate-200"
                                        >
                                            <span className="text-lg font-bold">-</span>
                                        </button>
                                        <input
                                            type="number"
                                            value={quizNumQuestions}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === "") {
                                                    // @ts-ignore
                                                    setQuizNumQuestions("");
                                                    return;
                                                }
                                                const num = parseInt(val);
                                                setQuizNumQuestions(isNaN(num) ? 5 : num);
                                            }}
                                            onBlur={() => {
                                                if (!quizNumQuestions || quizNumQuestions < 1) setQuizNumQuestions(5);
                                                if (quizNumQuestions > 20) setQuizNumQuestions(20);
                                            }}
                                            className="flex-1 h-full min-w-0 bg-transparent border-none text-center text-lg font-bold text-slate-700 focus:outline-none focus:ring-0 px-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <button
                                            onClick={() => setQuizNumQuestions(prev => Math.min(20, (typeof prev === 'number' ? prev : 5) + 1))}
                                            className="h-full w-10 shrink-0 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors border-l border-slate-200"
                                        >
                                            <span className="text-lg font-bold">+</span>
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>


            {/* Content Area */}
            <main className="flex-1 p-6 md:p-10">
                <AnimatePresence mode="wait">
                    {isGenerating ? (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="min-h-[400px] flex flex-col items-center justify-center text-center"
                        >
                            <div className="relative w-24 h-24 mb-6">
                                <div className="absolute inset-0 border-4 border-indigo-50/50 rounded-full"></div>
                                <motion.div
                                    className="absolute inset-0 border-4 border-[#0D5355] rounded-full border-t-transparent"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-[#0D5355] animate-pulse" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Generating your {mode}...</h2>
                            <p className="text-slate-500 font-bold mb-8 animate-pulse text-sm tracking-wide">Magic is happening for {topic}</p>

                            <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <motion.div
                                    className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${generationProgress}% ` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>
                            <p className="text-[10px] font-black text-indigo-500 mt-3 uppercase tracking-widest">
                                {generationProgress < 30 ? "Initializing..." :
                                    generationProgress < 60 ? "Drafting Content..." :
                                        generationProgress < 90 ? "Polishing Results..." : "Finalizing..."}
                            </p>
                        </motion.div>
                    ) : !result ? (
                        <motion.div
                            key="placeholder"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="min-h-[400px] flex flex-col items-center justify-center text-center py-20"
                        >
                            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center mb-6">
                                <Brain className="w-10 h-10 text-indigo-600 opacity-20" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 mb-2">Ready to Build?</h2>
                            <p className="text-slate-500 max-w-sm font-medium">
                                Configure the settings above and click generate to create your premium {mode}.
                            </p>
                        </motion.div>
                    ) : activeActivityIndex !== null ? (
                        <motion.div
                            key="activity-presentation"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="max-w-4xl mx-auto flex flex-col gap-8 pb-20"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <Button
                                    variant="ghost"
                                    onClick={() => setActiveActivityIndex(null)}
                                    className="gap-2 font-bold text-slate-500 hover:text-indigo-600"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back to Lesson Plan
                                </Button>
                                <div className="flex gap-2">
                                    {(typeof result.activities === 'string' ? JSON.parse(result.activities) : result.activities).map((_: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`h - 1.5 w - 8 rounded - full transition - all ${idx === activeActivityIndex ? 'bg-indigo-600' : 'bg-slate-200'} `}
                                        />
                                    ))}
                                </div>
                            </div>

                            <Card className="border-none shadow-2xl shadow-indigo-100 rounded-[2.5rem] bg-white overflow-visible">
                                <div className="p-10 border-b border-slate-50 bg-gradient-to-br from-indigo-50/30 to-white">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="px-4 py-2 bg-indigo-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-indigo-200">
                                            Activity {activeActivityIndex + 1}
                                        </div>
                                        <div className="h-px flex-1 bg-slate-100" />
                                        <div className="text-slate-400 font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                            <Loader2 className="w-4 h-4" /> {(typeof result.activities === 'string' ? JSON.parse(result.activities) : result.activities)[activeActivityIndex].time}
                                        </div>
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-900 font-display leading-tight">
                                        {(typeof result.activities === 'string' ? JSON.parse(result.activities) : result.activities)[activeActivityIndex].task || (typeof result.activities === 'string' ? JSON.parse(result.activities) : result.activities)[activeActivityIndex].description}
                                    </h2>
                                </div>

                                <div className="p-10 space-y-12">
                                    {(typeof result.activities === 'string' ? JSON.parse(result.activities) : result.activities)[activeActivityIndex].recap && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-amber-600">
                                                <Brain className="w-5 h-5" />
                                                <span className="text-xs font-black uppercase tracking-[0.2em]">Concept Refresher</span>
                                            </div>
                                            <div className="text-xl text-slate-700 font-medium leading-relaxed italic border-l-4 border-amber-200 pl-6 py-2">
                                                "{(typeof result.activities === 'string' ? JSON.parse(result.activities) : result.activities)[activeActivityIndex].recap}"
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <Sparkles className="w-5 h-5" />
                                            <span className="text-xs font-black uppercase tracking-[0.2em]">Full Guidance</span>
                                        </div>
                                        <p className="text-lg text-slate-600 leading-relaxed font-medium">
                                            {(typeof result.activities === 'string' ? JSON.parse(result.activities) : result.activities)[activeActivityIndex].description || (typeof result.activities === 'string' ? JSON.parse(result.activities) : result.activities)[activeActivityIndex].task}
                                        </p>
                                    </div>

                                    <div className="p-8 bg-indigo-50/50 rounded-[2rem] border border-indigo-100 border-dashed relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <GraduationCap className="w-24 h-24" />
                                        </div>
                                        <h4 className="font-bold text-indigo-900 mb-2 flex items-center gap-2 relative z-10">
                                            <GraduationCap className="w-5 h-5" /> Teacher's Pro Tip
                                        </h4>
                                        <p className="text-indigo-700 font-medium leading-relaxed relative z-10">
                                            {(typeof result.activities === 'string' ? JSON.parse(result.activities) : result.activities)[activeActivityIndex].tip ||
                                                "Encourage students to ask \"Why?\" during this phase. If you notice the energy dipping, try a quick 30-second peer-discussion to re-activate the classroom environment."}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                                    <Button
                                        variant="outline"
                                        disabled={activeActivityIndex === 0}
                                        onClick={() => setActiveActivityIndex(activeActivityIndex - 1)}
                                        className="h-14 px-8 rounded-2xl font-bold border-slate-200 bg-white"
                                    >
                                        <ChevronLeft className="w-4 h-4 mr-2" /> Previous Step
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            const acts = (typeof result.activities === 'string' ? JSON.parse(result.activities) : result.activities);
                                            if (activeActivityIndex < acts.length - 1) {
                                                setActiveActivityIndex(activeActivityIndex + 1);
                                            } else {
                                                setActiveActivityIndex(null);
                                                toast.success("Lesson completed! 🎉 Great job!");
                                            }
                                        }}
                                        className="h-14 px-10 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                                    >
                                        {activeActivityIndex === (typeof result.activities === 'string' ? JSON.parse(result.activities) : result.activities).length - 1 ? 'Finish Lesson' : 'Next Activity'} <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="max-w-[95%] mx-auto bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-full flex flex-col overflow-hidden print:max-w-full print:shadow-none print:border-none print:rounded-none"
                        >
                            {/* Result Header - Premium Glassmorphism style */}
                            {/* Result Header - Premium Glassmorphism style */}
                            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-xl border-b border-slate-100 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm print:static print:shadow-none print:border-none print:bg-white">
                                <div className="flex items-center gap-5">
                                    <div className={`w - 16 h - 16 rounded - 2xl flex items - center justify - center shadow - lg ${mode === 'lesson' ? 'bg-[#0D5355] text-white shadow-teal-100' :
                                            mode === 'quiz' ? 'bg-amber-500 text-white shadow-amber-200' :
                                                'bg-[#0D5355] text-white shadow-teal-100'
                                        } `}>
                                        {mode === 'lesson' ? <GraduationCap className="w-8 h-8" /> :
                                            mode === 'quiz' ? <HelpCircle className="w-8 h-8" /> :
                                                <FileText className="w-8 h-8" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                                                {mode === 'lesson' ? 'Lesson Plan' : mode === 'quiz' ? 'Quiz Generator' : 'Teaching Material'}
                                            </span>
                                            {result?.instituteName && (
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                                                    {result.instituteName}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-black text-slate-900 font-display leading-tight">{result?.title || title || `Generated Content`}</h2>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            {topic && <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                                <BookOpen className="w-3.5 h-3.5" /> {topic}
                                            </div>}
                                            {grade && grade !== "General" && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                                        <GraduationCap className="w-3.5 h-3.5" /> Grade {grade}
                                                    </div>
                                                </>
                                            )}
                                            {result?.totalMarks && (
                                                <>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs uppercase tracking-wider">
                                                        <ShieldCheck className="w-3.5 h-3.5" /> {result.totalMarks} Marks
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 print:hidden">
                                    <Button
                                        variant="ghost"
                                        onClick={() => setResult(null)}
                                        className="rounded-xl h-12 font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all px-6"
                                    >
                                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                                    </Button>

                                    {mode === 'lesson' && (
                                        <Button
                                            onClick={() => setShowQuickAction(true)}
                                            className="rounded-xl h-12 px-4 font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-lg border border-slate-800 transition-all"
                                        >
                                            <Sparkles className="w-4 h-4 mr-2 text-indigo-400" /> AI Tools
                                        </Button>
                                    )}

                                    {mode === 'quiz' && result?.id && (
                                        <Button
                                            onClick={() => navigate(`/ quiz / ${result.id} `)}
                                            className="rounded-xl h-12 px-6 font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-100 transition-all"
                                        >
                                            <PlayCircle className="w-4 h-4 mr-2" /> Start Quiz
                                        </Button>
                                    )}
                                    <Button
                                        variant="outline"
                                        onClick={() => handleDownloadPDF()}
                                        className="rounded-xl h-12 px-6 font-bold border-2 border-indigo-100 text-indigo-600 hover:bg-indigo-50 transition-all gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Download PDF
                                    </Button>
                                    <Button
                                        className={`rounded - xl h - 12 px - 8 font - bold shadow - lg transition - all ${result?.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'} `}
                                        onClick={handleSaveToLibrary}
                                        disabled={isSaving || result?.status === 'PUBLISHED'}
                                    >
                                        {isSaving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : result?.status === 'PUBLISHED' ? (
                                            <CheckCircle2 className="w-4 h-4 mr-2" />
                                        ) : (
                                            <Sparkles className="w-4 h-4 mr-2" />
                                        )}
                                        {result?.status === 'PUBLISHED' ? 'Saved' : 'Save to Library'}
                                    </Button>
                                </div>
                            </div>

                            <div className="p-8 prose prose-slate max-w-none bg-slate-50/50 min-h-screen">
                                {/* ... (Other rendering logic omitted for brevity, focusing on Quiz below) ... */}
                                {mode === 'assignment' ? (
                                    <div className="space-y-8">
                                        {/* Assignment Questions */}
                                        <div className="bg-slate-50 rounded-2xl p-6 md:p-8">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900">Assignment Questions</h3>
                                            </div>
                                            <ul className="space-y-4">
                                                {(result?.assignmentQuestions || result?.content?.questions || result?.content?.sectionD_ShortAnswers || []).map((q: string, idx: number) => (
                                                    <li key={idx} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-violet-200 transition-colors">
                                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 text-sm">{idx + 1}</span>
                                                        <p className="pt-1 text-slate-700 font-medium leading-relaxed">{q}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Fill in the Blanks Section */}
                                        {(result?.fillInTheBlanks || result?.content?.sectionB_FillBlanks) && (result?.fillInTheBlanks || result?.content?.sectionB_FillBlanks).length > 0 && (
                                            <div className="bg-amber-50/50 rounded-2xl p-6 md:p-8 border border-amber-100">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                                                        <Edit3 className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-900">Fill in the Blanks</h3>
                                                </div>
                                                <ul className="space-y-4">
                                                    {(result?.fillInTheBlanks || result?.content?.sectionB_FillBlanks).map((q: string, idx: number) => (
                                                        <li key={idx} className="flex gap-4 p-4 bg-white/80 rounded-xl border border-amber-100/50 shadow-sm hover:border-amber-200 transition-colors">
                                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-black text-amber-600 text-sm">F{idx + 1}</span>
                                                            <p className="pt-1 text-slate-800 font-medium leading-relaxed">{q}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Activity Questions */}
                                        <div className="bg-indigo-50/50 rounded-2xl p-6 md:p-8 border border-indigo-100">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                                    <Sparkles className="w-5 h-5" />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900">Activity Questions</h3>
                                            </div>
                                            <ul className="space-y-4">
                                                {(result?.activityQuestions || result?.content?.activities || []).map((q: string, idx: number) => (
                                                    <li key={idx} className="flex gap-4 p-4 bg-white/80 rounded-xl border border-indigo-100/50 shadow-sm">
                                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-sm">A{idx + 1}</span>
                                                        <p className="pt-1 text-slate-800 font-medium leading-relaxed">{q}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Answers Section (Toggle) */}
                                        <div className="border-t-2 border-dashed border-slate-200 pt-8 mt-12">
                                            <Button
                                                onClick={() => setShowAnswerKey(!showAnswerKey)}
                                                className="w-full h-14 rounded-xl border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-lg mb-6 flex items-center justify-center gap-2"
                                            >
                                                {showAnswerKey ? <ChevronRight className="w-5 h-5 rotate-90" /> : <ChevronRight className="w-5 h-5" />}
                                                {showAnswerKey ? "Hide Answer Key" : "View Answer Key (Next Page)"}
                                            </Button>

                                            <AnimatePresence>
                                                {showAnswerKey && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100">
                                                            <div className="flex items-center gap-3 mb-6">
                                                                <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                                                    <CheckCircle2 className="w-5 h-5" />
                                                                </div>
                                                                <h3 className="text-xl font-bold text-emerald-900">Answer Key</h3>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                                <div>
                                                                    <h4 className="font-bold text-emerald-800 mb-4 uppercase tracking-wider text-xs">Assignment Answers</h4>
                                                                    <ul className="space-y-4">
                                                                        {(result?.answers?.assignmentQuestions || result?.answerKey?.Questions || result?.answerKey?.questions || result?.answerKey?.["Section D (Short Answers)"] || []).map((a: string, idx: number) => (
                                                                            <li key={idx} className="text-sm text-emerald-900/80 bg-white/50 p-3 rounded-lg">
                                                                                <span className="font-bold mr-2 text-emerald-600">Q{idx + 1}.</span> {a}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                                {(result?.answers?.fillInTheBlanks || result?.answerKey?.["Section B (Fill in the Blanks)"]) && (
                                                                    <div>
                                                                        <h4 className="font-bold text-emerald-800 mb-4 uppercase tracking-wider text-xs">Fill in the Blanks Answers</h4>
                                                                        <ul className="space-y-4">
                                                                            {(result?.answers?.fillInTheBlanks || result?.answerKey?.["Section B (Fill in the Blanks)"] || []).map((a: string, idx: number) => (
                                                                                <li key={idx} className="text-sm text-emerald-900/80 bg-white/50 p-3 rounded-lg">
                                                                                    <span className="font-bold mr-2 text-emerald-600">F{idx + 1}.</span> {a}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <h4 className="font-bold text-emerald-800 mb-4 uppercase tracking-wider text-xs">Activity Answers</h4>
                                                                    <ul className="space-y-4">
                                                                        {(result?.answers?.activityQuestions || result?.answerKey?.Activities || result?.answerKey?.activities || []).map((a: string, idx: number) => (
                                                                            <li key={idx} className="text-sm text-emerald-900/80 bg-white/50 p-3 rounded-lg">
                                                                                <span className="font-bold mr-2">A{idx + 1}.</span> {a}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </div>
                                ) : mode === 'lesson' ? (
                                    <div className="space-y-8 text-slate-800">
                                        {/* Header Section */}
                                        <div className="border-b border-slate-200 pb-6">
                                            <h2 className="text-3xl font-black text-slate-900 mb-4">Lesson Plan</h2>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-600">
                                                <span><span className="font-bold text-indigo-700">Unit:</span> {unitDetails || title || topic}</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                <span><span className="font-bold text-indigo-700">Session Duration:</span> {sessionDuration} Minutes</span>
                                                <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                                <span><span className="font-bold text-indigo-700">Number of Sessions:</span> {numSessions}</span>
                                            </div>
                                        </div>

                                        {/* Learning Outcomes */}
                                        <div>
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Target className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-bold text-lg text-slate-900">Learning Outcomes:</h4>
                                            </div>
                                            {Array.isArray(result?.objective) ? (
                                                <ol className="list-decimal pl-5 space-y-2 marker:text-indigo-600 marker:font-bold">
                                                    {result.objective.map((obj: string, i: number) => (
                                                        <li key={i} className="text-slate-700 leading-relaxed pl-2">{obj}</li>
                                                    ))}
                                                </ol>
                                            ) : (
                                                <p className="text-slate-700 leading-relaxed pl-2 border-l-4 border-indigo-100 bg-slate-50/50 p-4 rounded-r-xl">{result?.objective}</p>
                                            )}
                                        </div>

                                        {/* Materials Needed */}
                                        {result?.materials && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="font-bold text-lg text-slate-900">Materials Needed:</h4>
                                                </div>
                                                <ul className="list-disc pl-5 space-y-1 marker:text-slate-400">
                                                    {(Array.isArray(result.materials) ? result.materials : [result.materials]).map((m: string, i: number) => (
                                                        <li key={i} className="text-slate-700 leading-relaxed pl-2">{m}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Core Concept Explanation */}
                                        {(result?.explanation || result?.content?.explanation) && (
                                            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <Brain className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="font-bold text-lg text-slate-900">Concept Explanation:</h4>
                                                </div>
                                                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                                                    {result?.explanation || result?.content?.explanation}
                                                </div>
                                            </div>
                                        )}

                                        {/* Pedagogy */}
                                        {result?.pedagogy && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <GraduationCap className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="font-bold text-lg text-slate-900">Pedagogy:</h4>
                                                </div>
                                                <div className="text-slate-700 leading-relaxed pl-2 border-l-4 border-indigo-100 bg-slate-50/50 p-4 rounded-r-xl whitespace-pre-wrap text-sm font-medium">
                                                    {result.pedagogy}
                                                </div>
                                            </div>
                                        )}

                                        {/* Inquiry based learning */}
                                        {result?.inquiryBasedLearning && (
                                            <div className="bg-white rounded-2xl border border-dashed border-indigo-200 p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <BookOpen className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="font-bold text-lg text-indigo-900">Inquiry based learning:</h4>
                                                </div>
                                                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                                                    {result.inquiryBasedLearning}
                                                </div>
                                            </div>
                                        )}

                                        {/* Lesson Activities and Descriptions */}
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <ClipboardList className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-bold text-lg text-slate-900">Lesson Activities:</h4>
                                            </div>
                                            <div className="space-y-4">
                                                {result?.activities && (typeof result.activities === 'string' ? JSON.parse(result.activities) : result.activities).map((act: any, i: number) => (
                                                    <div key={i} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-all group">
                                                        <div className="flex items-start justify-between gap-4 mb-3">
                                                            <div className="flex-1">
                                                                <h5 className="font-black text-slate-900 leading-tight">
                                                                    <span className="text-indigo-600 mr-2">{i + 1}.</span>
                                                                    {act.task || act.description}
                                                                </h5>
                                                            </div>
                                                            {act.time && (
                                                                <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100">
                                                                    {act.time}
                                                                </span>
                                                            )}
                                                        </div>
                                                        {(act.recap || act.tip) && (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-50">
                                                                {act.recap && (
                                                                    <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-50">
                                                                        <span className="text-[10px] font-black uppercase text-indigo-400 block mb-1">Concept Recap</span>
                                                                        <p className="text-xs text-indigo-900/70 font-medium leading-relaxed">{act.recap}</p>
                                                                    </div>
                                                                )}
                                                                {act.tip && (
                                                                    <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-50">
                                                                        <span className="text-[10px] font-black uppercase text-emerald-400 block mb-1">Teacher Tip</span>
                                                                        <p className="text-xs text-emerald-900/70 font-medium leading-relaxed">{act.tip}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Teaching Strategies */}
                                        {result?.teachingStrategies && result.teachingStrategies.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <Lightbulb className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="font-bold text-lg text-slate-900">Teaching Strategies to Increase Student Engagement:</h4>
                                                </div>
                                                <ul className="list-disc pl-5 space-y-2 marker:text-slate-400">
                                                    {(Array.isArray(result.teachingStrategies) ? result.teachingStrategies : []).map((s: string, i: number) => (
                                                        <li key={i} className="text-slate-700 leading-relaxed pl-2">{s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Assessment Methods */}
                                        {result?.assessmentMethods && result.assessmentMethods.length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="font-bold text-lg text-slate-900">Assessment Methods:</h4>
                                                </div>
                                                <ul className="list-disc pl-5 space-y-2 marker:text-slate-400">
                                                    {(Array.isArray(result.assessmentMethods) ? result.assessmentMethods : []).map((m: string, i: number) => (
                                                        <li key={i} className="text-slate-700 leading-relaxed pl-2">{m}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Homework */}
                                        {result?.homework && (
                                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                                <h4 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
                                                    <BookOpen className="w-5 h-5 text-indigo-600" />
                                                    Homework Assignment:
                                                </h4>
                                                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                                                    {result.homework}
                                                </div>
                                            </div>
                                        )}

                                        {/* Review Questions */}
                                        {(result?.questions || result?.content?.questions) && (
                                            <div className="p-8 bg-[#1A3263] rounded-3xl text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 p-6 opacity-10">
                                                    <HelpCircle className="w-20 h-20" />
                                                </div>
                                                <h4 className="text-white/70 font-black uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                                    Review & Evaluation
                                                </h4>
                                                <div className="space-y-6">
                                                    {(Array.isArray(result?.questions || result?.content?.questions) ? (result?.questions || result?.content?.questions) : []).map((q: any, i: number) => (
                                                        <div key={i} className="flex gap-4">
                                                            <span className="text-indigo-400 font-black">Q{i + 1}.</span>
                                                            <div className="flex-1">
                                                                <p className="font-bold text-lg leading-relaxed">{typeof q === 'string' ? q : (q.question || q.text)}</p>
                                                                {q.options && (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                                                                        {q.options.map((opt: string, idx: number) => (
                                                                            <div key={idx} className="text-sm bg-white/10 p-2 rounded-lg border border-white/5">
                                                                                {String.fromCharCode(65 + idx)}. {opt}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Differentiation */}
                                        {result?.differentiation && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                    <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4" />
                                                        For Advanced Learners:
                                                    </h5>
                                                    <p className="text-sm text-emerald-800 leading-relaxed">{result.differentiation.advanced}</p>
                                                </div>
                                                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                                    <h5 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                                                        <Settings2 className="w-4 h-4" />
                                                        For Struggling Learners:
                                                    </h5>
                                                    <p className="text-sm text-amber-800 leading-relaxed">{result.differentiation.struggling}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Estimated Time Breakdown */}
                                        {result?.estimatedTime && result.estimatedTime.length > 0 && (
                                            <div>
                                                <h4 className="font-bold text-lg mb-4 text-slate-900">Time Allocation:</h4>
                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                    {(Array.isArray(result.estimatedTime) ? result.estimatedTime : []).map((item: any, i: number) => (
                                                        <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 text-center">
                                                            <span className="block text-[10px] font-black uppercase text-slate-400 mb-1">{item.section}</span>
                                                            <span className="text-sm font-bold text-indigo-600">{item.time}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Reference URL */}
                                        {result?.referenceUrl && (
                                            <div className="relative group/ref">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-sm">
                                                            <Youtube className="w-4 h-4" />
                                                        </div>
                                                        <h4 className="font-bold text-lg text-slate-900">Recommended Videos for "{result?.title?.replace('Lesson: ', '') || topic}":</h4>
                                                    </div>
                                                    {!isEditingLink && (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => {
                                                                const currentLink = result.referenceUrl;
                                                                if (typeof currentLink === 'string') {
                                                                    setTempLink({ title: "Video Resource", url: currentLink });
                                                                } else if (typeof currentLink === 'object') {
                                                                    setTempLink({ title: currentLink.title || "Video Resource", url: currentLink.url || "" });
                                                                } else {
                                                                    setTempLink({ title: "", url: "" });
                                                                }
                                                                setIsEditingLink(true);
                                                            }}
                                                            className="text-slate-400 hover:text-indigo-600 h-8 w-8 p-0"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </div>

                                                {isEditingLink ? (
                                                    <div className="flex flex-col gap-3 p-6 bg-slate-50 border border-indigo-100 rounded-3xl mb-4">
                                                        <input
                                                            value={tempLink.title}
                                                            onChange={(e) => setTempLink({ ...tempLink, title: e.target.value })}
                                                            placeholder="Video Title"
                                                            className="flex h-12 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-indigo-500/10"
                                                        />
                                                        <div className="flex gap-2">
                                                            <input
                                                                value={tempLink.url}
                                                                onChange={(e) => setTempLink({ ...tempLink, url: e.target.value })}
                                                                placeholder="YouTube URL"
                                                                className="flex h-12 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-indigo-500/10"
                                                            />
                                                            <Button
                                                                onClick={() => {
                                                                    setResult({ ...result, referenceUrl: tempLink });
                                                                    setIsEditingLink(false);
                                                                }}
                                                                className="h-12 w-12 rounded-xl bg-indigo-600 text-white"
                                                            >
                                                                <Check className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                onClick={() => setIsEditingLink(false)}
                                                                className="h-12 w-12 rounded-xl text-slate-400 hover:text-rose-600"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-md transition-all">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Youtube className="w-4 h-4 text-red-600" />
                                                                <h5 className="font-bold text-slate-900">
                                                                    YouTube Video Search
                                                                </h5>
                                                            </div>
                                                            <p className="text-sm text-slate-500 font-medium">
                                                                Find curated videos for: <span className="text-indigo-600 font-bold">"{result.videoSearchQuery || topic}"</span>
                                                            </p>
                                                        </div>
                                                        <a
                                                            href={`https://www.youtube.com/results?search_query=${encodeURIComponent(result.videoSearchQuery || topic + ' lesson for grade ' + grade)}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-sm active:scale-95"
                                                        >
                                                            <Youtube className="w-4 h-4" /> Open Search
                                                        </a >
                                                    </div >
                                                )}

                                                {/* YouTube Embed - Only show for direct video links */}
                                                {
                                                    !isEditingLink && typeof result.referenceUrl === 'object' && result.referenceUrl.url && !result.referenceUrl.url.includes('results?search_query') && (
                                                        (() => {
                                                            const url = result.referenceUrl.url;
                                                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                                            const match = url.match(regExp);
                                                            const embedId = (match && match[2].length === 11) ? match[2] : null;

                                                            if (embedId) {
                                                                return (
                                                                    <div className="mt-6 aspect-video rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-slate-900">
                                                                        <iframe
                                                                            width="100%"
                                                                            height="100%"
                                                                            src={`https://www.youtube.com/embed/${embedId}`}
                                                                            title="YouTube video player"
                                                                            frameBorder="0"
                                                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                                            allowFullScreen
                                                                        />
                                                                    </div>
                                                                );
                                                            }
                                                            return null;
                                                        })()
                                                    )
                                                }

                                                <p className="text-slate-400 text-[10px] mt-4 italic px-2 flex items-center gap-2">
                                                    <Search className="w-3 h-3" />
                                                    Note: This will open a YouTube search for the most relevant and high-quality educational videos on this topic.
                                                </p>
                                            </div >
                                        )}

                                        {/* Motivational Quote */}
                                        {
                                            result?.motivationalQuote && (
                                                <div className="mt-12 p-8 bg-[#FF7444] text-slate-900 rounded-[2rem] shadow-xl shadow-orange-100 relative overflow-hidden group">
                                                    <div className="absolute -left-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                                                        <Sparkles className="w-32 h-32" />
                                                    </div>
                                                    <div className="relative z-10">
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900/60 mb-4 block">Teacher's Inspiration</span>
                                                        <p className="text-2xl font-black italic leading-tight">"{result.motivationalQuote}"</p>
                                                    </div>
                                                </div>
                                            )
                                        }
                                    </div >
                                ) : mode === 'quiz' ? (
                                    <div className="space-y-6">
                                        {(result?.questions || []).map((q: any, i: number) => {
                                            const selectedAnswer = userAnswers[i];
                                            const isAnswered = selectedAnswer !== undefined;

                                            return (
                                                <div key={i} className="p-10 bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 mb-8 last:mb-0 group hover:border-indigo-200 transition-all relative overflow-hidden">
                                                    <div className="absolute -top-6 -right-6 opacity-[0.02] rotate-12 transition-transform group-hover:rotate-0 group-hover:scale-110 pointer-events-none">
                                                        <Brain className="w-32 h-32 text-indigo-900" />
                                                    </div>
                                                    <div className="flex items-start gap-6 relative z-10">
                                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg border border-indigo-100 shadow-sm shrink-0">
                                                            {i + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-xl font-bold text-slate-800 mb-6 leading-snug">{q.question}</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {(q.options || []).map((opt: string, j: number) => {
                                                                    const isCorrect = opt === q.correctAnswer;
                                                                    const isSelected = selectedAnswer === opt;

                                                                    let variantClass = "bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100 hover:border-slate-200 cursor-pointer";

                                                                    if (isAnswered) {
                                                                        if (isCorrect) {
                                                                            variantClass = "bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm shadow-emerald-100";
                                                                        } else if (isSelected) {
                                                                            variantClass = "bg-rose-50 border-rose-200 text-rose-700 shadow-sm shadow-rose-100";
                                                                        } else {
                                                                            variantClass = "bg-slate-50 border-slate-100 text-slate-400 opacity-60";
                                                                        }
                                                                    }

                                                                    return (
                                                                        <button
                                                                            key={j}
                                                                            disabled={isAnswered}
                                                                            onClick={() => setUserAnswers(prev => ({ ...prev, [i]: opt }))}
                                                                            className={`group flex items-center justify-between p-4 rounded-2xl border text-base font-bold transition-all text-left ${variantClass}`}
                                                                        >
                                                                            <span className="flex items-center gap-3">
                                                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] border transition-colors ${isSelected ? 'bg-white border-transparent' : 'bg-white border-slate-200 group-hover:border-slate-300'
                                                                                    }`}>
                                                                                    {String.fromCharCode(65 + j)}
                                                                                </span>
                                                                                {opt}
                                                                            </span>

                                                                            {isAnswered && (
                                                                                isCorrect ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> :
                                                                                    (isSelected ? <div className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white text-[10px]">✕</div> : null)
                                                                            )}
                                                                        </button>
                                                                    );
                                                                })}
                                                            </div>
                                                            {isAnswered && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, height: 0 }}
                                                                    animate={{ opacity: 1, height: 'auto' }}
                                                                    className={`mt-4 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${selectedAnswer === q.correctAnswer ? 'text-emerald-600 bg-emerald-50/50' : 'text-rose-600 bg-rose-50/50'}`}
                                                                >
                                                                    {selectedAnswer === q.correctAnswer ? (
                                                                        <><Sparkles className="w-3.5 h-3.5" /> Correct! Great job.</>
                                                                    ) : (
                                                                        <><Brain className="w-3.5 h-3.5" /> Keep learning! The correct answer is <u>{q.correctAnswer}</u></>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : mode === 'material' ? (
                                    <div className="flex flex-col gap-6">
                                        {/* Pagination Header */}
                                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <Button
                                                    variant={currentPage === 1 ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(1)}
                                                    className={`rounded-xl font-bold ${currentPage === 1 ? 'bg-[#1A3263]' : ''}`}
                                                >
                                                    Page 1: Content
                                                </Button>
                                                <Button
                                                    variant={currentPage === 2 ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(2)}
                                                    className={`rounded-xl font-bold ${currentPage === 2 ? 'bg-[#1A3263]' : ''}`}
                                                >
                                                    Page 2: Review
                                                </Button>
                                            </div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                                Textbook View • {currentPage} of 2
                                            </div>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {currentPage === 1 ? (
                                                <motion.div
                                                    key="page1"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: 20 }}
                                                    className="flex flex-col bg-[#FAF9F6] rounded-[2.5rem] overflow-hidden border border-slate-200"
                                                >
                                                    {/* Result Header */}
                                                    <div className="p-10 border-b border-slate-200 bg-white flex items-start justify-between relative overflow-hidden">
                                                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none" />

                                                        <div className="flex items-start gap-8 relative z-10 w-full">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Lesson</span>
                                                                <div className="w-20 h-20 rounded-full bg-[#1A3263] flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-100 shrink-0">
                                                                    {result?.chapterNumber || "1"}
                                                                </div>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h1 className="text-4xl font-black text-[#1A3263] mb-4 tracking-tight leading-tight">
                                                                    {result?.title}
                                                                </h1>
                                                                <div className="flex items-center gap-3">
                                                                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                                                                        Lesson {result?.chapterNumber || "1"}
                                                                    </span>
                                                                    <span className="text-slate-300 font-light px-2">|</span>
                                                                    <span className="text-slate-500 text-sm font-semibold italic">
                                                                        {result?.footer || `${subject} | Grade ${grade}`}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Body Content */}
                                                    <div className="p-10 lg:p-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
                                                        {/* Main Content Column */}
                                                        <div className="lg:col-span-8 space-y-10">
                                                            {/* Introduction */}
                                                            <div className="relative">
                                                                <p className="text-xl font-medium text-slate-800 leading-relaxed first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-indigo-600 first-letter:mt-1">
                                                                    {result?.intro}
                                                                </p>
                                                            </div>

                                                            {/* Sections */}
                                                            <div className="space-y-12">
                                                                {result?.sections?.map((section: any, idx: number) => (
                                                                    <motion.div
                                                                        key={idx}
                                                                        initial={{ opacity: 0, y: 10 }}
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
                                                            {/* In This Chapter Box */}
                                                            <div className="bg-indigo-50 p-8 rounded-[2.5rem] border-2 border-dashed border-indigo-200 relative overflow-hidden">
                                                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                                                    <BookOpen className="w-12 h-12 text-indigo-600" />
                                                                </div>
                                                                <h4 className="text-indigo-900 font-black uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                                                                    <span className="w-2 h-2 rounded-full bg-indigo-600" />
                                                                    In This Lesson
                                                                </h4>
                                                                <ul className="space-y-4">
                                                                    {result?.learningObjectives?.map((obj: string, i: number) => (
                                                                        <li key={i} className="flex gap-3 text-sm font-bold text-indigo-900/70">
                                                                            <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                                                                            {obj}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>

                                                            {/* Illustration Area */}
                                                            <div className="aspect-square bg-white rounded-[2.5rem] border border-slate-100 shadow-xl shadow-indigo-50 flex flex-col items-center justify-center p-4 text-center gap-4 group cursor-help transition-all hover:scale-[1.02] relative overflow-hidden">
                                                                {generatedImage ? (
                                                                    <div className="w-full h-full flex flex-col items-center justify-center relative">
                                                                        <img
                                                                            src={generatedImage}
                                                                            alt="Topic Illustration"
                                                                            className="w-full h-full object-contain rounded-3xl"
                                                                            onError={(e) => {
                                                                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1600&q=80";
                                                                            }}
                                                                        />
                                                                        <div className="absolute bottom-4 left-0 right-0 opacity-0 group-hover:opacity-100 transition-all">
                                                                            <span className="bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-lg border border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                                                                AI Generated Diagram
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                ) : result?.title?.toLowerCase().includes('human body') ||
                                                                    result?.illustrationDescription?.toLowerCase().includes('human body') ||
                                                                    result?.illustrationDescription?.toLowerCase().includes('anatomy') ||
                                                                    result?.illustrationDescription?.toLowerCase().includes('internal parts') ? (
                                                                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
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
                                                                                {result?.illustrationDescription || "Detailed diagram for " + result?.title}
                                                                            </p>
                                                                        </div>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-8 bg-white border-t border-slate-100 flex items-center justify-center">
                                                        <Button
                                                            onClick={() => setCurrentPage(2)}
                                                            className="rounded-xl h-12 px-8 font-black bg-[#1A3263] hover:bg-[#2A4273] text-white uppercase tracking-[0.2em] shadow-lg shadow-indigo-100"
                                                        >
                                                            Go to Review Page <ChevronRight className="w-5 h-5 ml-2" />
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="page2"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 min-h-[600px]"
                                                >
                                                    {/* Page 2 Header */}
                                                    <div className="p-10 border-b border-slate-100 bg-emerald-50/30 flex items-center justify-between">
                                                        <div>
                                                            <h2 className="text-3xl font-black text-[#064E3B] mb-2 tracking-tight">Review & Mastery</h2>
                                                            <p className="text-emerald-700/60 font-medium">Concept check for {result?.title}</p>
                                                        </div>
                                                        <div className="w-16 h-16 rounded-3xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-100">
                                                            <CheckCircle2 className="w-8 h-8" />
                                                        </div>
                                                    </div>

                                                    <div className="p-10 lg:p-14 flex-1 space-y-10">
                                                        {/* Section 1: Preparation Tips (Suggestion Points) */}
                                                        {result?.preparationTips && (
                                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                                                                <div className="lg:col-span-12">
                                                                    <div className="p-10 bg-[#569F9C] rounded-[3rem] text-white relative overflow-hidden shadow-2xl shadow-teal-100 group">
                                                                        <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform">
                                                                            <Lightbulb className="w-32 h-32 text-white/30" />
                                                                        </div>
                                                                        <div className="relative z-10">
                                                                            <h4 className="text-white/70 font-black uppercase tracking-[0.2em] text-[10px] mb-4">Preparation Tips & Suggestions</h4>
                                                                            <h3 className="text-3xl font-black mb-10 leading-tight">How to Master this Lesson</h3>

                                                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                                                {result?.preparationTips?.map((tip: string, i: number) => (
                                                                                    <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/20 transition-all group/tip">
                                                                                        <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white font-black mb-4 group-hover/tip:scale-110 transition-transform">
                                                                                            {i + 1}
                                                                                        </div>
                                                                                        <p className="text-white font-bold leading-relaxed">{tip}</p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Section 2: Lesson Reflection */}
                                                        <div className="p-10 rounded-[3rem] bg-[#FFFBEB] border border-[#FEF3C7] relative overflow-hidden">
                                                            <div className="absolute -left-4 -top-4 opacity-[0.03]">
                                                                <Brain className="w-40 h-40 text-indigo-900" />
                                                            </div>
                                                            <div className="relative z-10 flex items-center gap-8">
                                                                <div className="w-16 h-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shrink-0">
                                                                    <MessageSquare className="w-8 h-8" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="text-indigo-900 font-black uppercase tracking-widest text-xs mb-3">Lesson Reflection</h4>
                                                                    <p className="text-indigo-900/70 text-xl font-medium leading-relaxed italic">
                                                                        "Think about how the concepts you learned in Page 1 apply to your daily life. Can you identify these patterns in your own surroundings?"
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Section 3: Check Out! (Review Questions) */}
                                                        <div className="bg-[#1A3263] p-12 rounded-[3.5rem] border-4 border-double border-white/10 shadow-2xl shadow-indigo-900/20 relative overflow-hidden group">
                                                            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/5 rounded-full opacity-30 group-hover:scale-125 transition-transform" />

                                                            <div className="flex items-center gap-6 mb-12 relative z-10">
                                                                <div className="w-20 h-20 rounded-[2rem] bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20 shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                                                                    <GraduationCap className="w-10 h-10" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="text-4xl font-black text-white tracking-tight">Check Out!</h3>
                                                                    <p className="text-white/50 font-black uppercase tracking-[0.2em] text-[10px]">End of Lesson Review</p>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                                                {result?.reviewQuestions?.map((q: string, i: number) => (
                                                                    <div key={i} className="flex gap-6 p-6 rounded-3xl bg-white/10 border border-white/10 shadow-sm hover:bg-white/15 transition-all group/q">
                                                                        <span className="text-white/40 font-black text-2xl group-hover/q:text-white transition-colors">{i + 1}.</span>
                                                                        <p className="text-lg font-bold text-white/90 leading-relaxed">{q}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="p-10 bg-slate-50 border-t border-slate-200 flex items-center justify-between font-black text-[10px] uppercase tracking-[0.3em] text-slate-400">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-2 h-2 rounded-full bg-indigo-600" />
                                                            <span>Page 2: Knowledge Assessment & Tips</span>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            onClick={() => setCurrentPage(1)}
                                                            className="text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white rounded-xl"
                                                        >
                                                            <ChevronLeft className="w-4 h-4 mr-2" /> Back to Lesson
                                                        </Button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-10">
                                        <div className="prose prose-slate prose-indigo max-w-none prose-headings:font-display prose-headings:text-slate-900 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600 prose-strong:text-slate-900">
                                            <ReactMarkdown>
                                                {result?.content || result?.explanation || ""}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div >
                        </motion.div >
                    )}
                </AnimatePresence >
            </main >

            <QuickActionDialog
                open={showQuickAction}
                onOpenChange={setShowQuickAction}
                contentToProcess={(() => {
                    if (!result) return "";
                    // Build a clean, readable text summary for the AI - do NOT pass raw JSON
                    const parts: string[] = [];
                    if (result.title) parts.push(`Title: ${result.title}`);
                    // Lesson plan fields
                    if (result.objective) parts.push(`Learning Objectives:\n${(Array.isArray(result.objective) ? result.objective : [result.objective]).map((o: string) => `- ${o}`).join('\n')}`);
                    if (result.explanation) parts.push(`Explanation:\n${result.explanation}`);
                    if (result.pedagogy) parts.push(`Pedagogy:\n${result.pedagogy}`);
                    if (result.inquiryBasedLearning) parts.push(`Inquiry Based Learning:\n${result.inquiryBasedLearning}`);
                    if (result.homework) parts.push(`Homework:\n${result.homework}`);
                    // Activities (may be a JSON string)
                    try {
                        const acts = result.activities ? (Array.isArray(result.activities) ? result.activities : JSON.parse(result.activities)) : [];
                        if (acts.length) parts.push(`Activities:\n${acts.map((a: any) => `- ${a.time || ''}: ${a.description || a.task || ''}`).join('\n')}`);
                    } catch { }
                    // Material / quiz / assignment fields
                    if (result.sections?.length) parts.push(`Sections:\n${result.sections.map((s: any) => `${s.heading}: ${s.content}`).join('\n')}`);
                    if (result.questions?.length) parts.push(`Questions:\n${result.questions.map((q: any, i: number) => `${i + 1}. ${q.question || q}`).join('\n')}`);
                    if (result.intro) parts.push(`Introduction:\n${result.intro}`);
                    if (result.assessmentMethods?.length) parts.push(`Assessment Methods:\n${result.assessmentMethods.join(', ')}`);
                    if (result.materials?.length) parts.push(`Materials: ${(Array.isArray(result.materials) ? result.materials : [result.materials]).join(', ')}`);
                    return parts.length > 0 ? parts.join('\n\n') : `Topic: ${topic}, Subject: ${subject}, Grade: ${grade}`;
                })()}
            />
        </div >
    );
}
