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
    Search,
    RotateCcw,
    Eye,
    UserCheck,
    Languages,
    Bookmark
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
    const [responseLanguage, setResponseLanguage] = useState("auto");
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
    const [subjectSearch, setSubjectSearch] = useState("");
    const [topicSearch, setTopicSearch] = useState("");
    const [activeActivityIndex, setActiveActivityIndex] = useState<number | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [visualImages, setVisualImages] = useState<string[]>([]);
    const [isPrinting, setIsPrinting] = useState(false);

    const getSafeActivities = (res: any) => {
        if (!res) return [];
        const actsSource = res.activities || res.content?.activities || [];
        try {
            return typeof actsSource === 'string' ? JSON.parse(actsSource) : (Array.isArray(actsSource) ? actsSource : []);
        } catch (e) {
            console.error("Error parsing activities:", e);
            return [];
        }
    };

    const safeActivities = getSafeActivities(result);
    const [showAnswerKey, setShowAnswerKey] = useState(false);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [showQuickAction, setShowQuickAction] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isEditingLink, setIsEditingLink] = useState(false);
    const [tempLink, setTempLink] = useState({ title: "", url: "" });

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

    // Auto-fetch topic-relevant image from Unsplash when result loads
    useEffect(() => {
        if ((mode === 'material' || mode === 'assignment' || mode === 'lesson') && result && topic) {
            setGeneratedImage(null);
            setVisualImages([]);

            // Use visualAids from AI if available (usually in English for better search)
            const prompts = result?.visualAids || [];

            if (prompts.length > 0) {
                // Fetch multiple images
                const imageUrls: string[] = [];
                prompts.forEach((prompt: string, idx: number) => {
                    const searchQuery = encodeURIComponent(prompt.trim().substring(0, 60));
                    const seed = encodeURIComponent(topic + subject + idx);
                    imageUrls.push(`https://source.unsplash.com/800x800/?${searchQuery}&sig=${seed}`);
                });
                setVisualImages(imageUrls);
                setGeneratedImage(imageUrls[0]); // Primary image
            } else {
                // Legacy single-image fallback
                const illustrationHint = result?.illustrationDescription || "";
                const searchQuery = encodeURIComponent(
                    `${topic} ${subject}`.trim().substring(0, 40)
                );
                const seed = encodeURIComponent(topic + subject);
                const unsplashUrl = `https://source.unsplash.com/800x800/?${searchQuery}&sig=${seed}`;
                const img = new Image();
                img.onload = () => setGeneratedImage(unsplashUrl);
                img.onerror = () => {
                    const fallback = `https://picsum.photos/seed/${seed}/800/800`;
                    setGeneratedImage(fallback);
                };
                img.src = unsplashUrl;
            }
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
        // If PDF is uploaded, we allow topic to be missing as AI can infer it.
        if (mode !== 'quiz' && !pdfText && (!grade || !subject || !topic)) {
            toast.error("Please select all required fields or upload a PDF");
            return;
        }
        if (mode === 'quiz' && !topic && !pdfText) {
            toast.error("Please enter a topic or upload a PDF");
            return;
        }

        // Token Check: Ensure user is actually authenticated before trying to generate
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error("Authentication Error", {
                description: "You've been signed out. Please refresh or login again.",
            });
            // Force logout state if we're clearly in the dashboard without a token
            if (window.location.pathname.startsWith('/dashboard')) {
                window.location.href = '/login?expired=true';
            }
            return;
        }

        // Trial Limit Check: Removed for testing as per user request
        /*
                try {
                    const statsRes = await api.get('/dashboard/stats');
                    const lessonsCount = statsRes.data.lessonsCreated || 0;
                    if (lessonsCount >= 1) {
                        toast.error("Free trial limit reached (1 lesson). Upgrade to create more!", {
                            description: "You've used your 1 free lesson plan.",
                            duration: 5000,
                        });
                        return;
                    }
                } catch (err) {
                    console.error("Stats check failed", err);
                    // If it's a 401, the interceptor will handle it, but we should stop here too
                    if ((err as any).response?.status === 401) return;
                }
        */

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
            const effectiveSubject = subject || (pdfText ? "Context from PDF" : "General");

            let payload: any = {
                curriculum: board,
                grade: effectiveGrade,
                subject: effectiveSubject, // Sending Name
                topic,   // Sending Name
                title,
                pdfText,

                duration: sessionDuration,
                unitDetails,
                numSessions,
                language: responseLanguage
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
            console.log("[DEBUG] API Response data:", JSON.stringify(res.data, null, 2));
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
                ${result.answerKey?.length ? `<div class="pdf-section"><h3>Answer Key</h3><ol>${result.answerKey.map((a: string) => `<li>${a}</li>`).join('')}</ol></div>` : ''}
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
        <div className="flex flex-col bg-transparent min-h-[calc(100vh-140px)] relative">
            {/* Sticky Horizontal Config Bar - Compact Version */}
            {true && (
                <div className="sticky top-[64px] md:top-[70px] z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 py-1.5 shadow-md print:hidden">
                    <div className="max-w-[1600px] mx-auto flex flex-col items-stretch gap-1.5">
                        {/* Row 1: Selectors - Higher Z-index for dropdowns */}
                        <div className="flex flex-wrap items-end gap-2 flex-1 overflow-visible relative z-20">
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Type</label>
                                <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200 h-9 rounded-lg text-[11px] font-bold ring-offset-white focus:ring-2 ring-indigo-500/10 min-w-[110px]">
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

                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Curriculum</label>
                                <Select value={board} onValueChange={setBoard}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200 h-9 rounded-lg text-[11px] font-bold ring-offset-white focus:ring-2 ring-indigo-500/10 min-w-[80px]">
                                        <SelectValue placeholder="Board" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {["CBSE", "ICSE", "SSC"].map(b => (
                                            <SelectItem key={b} value={b} className="text-xs font-bold">{b}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Grade</label>
                                <Select value={grade} onValueChange={setGrade}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200 h-9 rounded-lg text-[11px] font-bold ring-offset-white focus:ring-2 ring-indigo-500/10 min-w-[90px]">
                                        <SelectValue placeholder="Grade" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(g => (
                                            <SelectItem key={g} value={g} className="text-xs font-bold">Class {g}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1 sm:min-w-[130px]">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                                <Popover open={openSubject} onOpenChange={setOpenSubject}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openSubject}
                                            disabled={isLoadingMetadata}
                                            className="w-full h-9 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold ring-offset-white focus:ring-2 ring-indigo-500/10 hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                                        >
                                            <span className="truncate flex-1 text-left">
                                                {subject || (isLoadingMetadata ? "Loading..." : "Select subject...")}
                                            </span>
                                            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[110]" align="start">
                                        <Command value={subjectSearch} onValueChange={setSubjectSearch}>
                                            <CommandInput placeholder="Search or type custom subject..." />
                                            <CommandList>
                                                <CommandEmpty>
                                                    <div className="p-2">
                                                        <p className="text-xs text-muted-foreground mb-2">No subject found.</p>
                                                        {subjectSearch && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="w-full justify-start text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                                onClick={() => {
                                                                    setSubject(subjectSearch);
                                                                    setTopic("");
                                                                    setOpenSubject(false);
                                                                    setSubjectSearch("");
                                                                }}
                                                            >
                                                                <Sparkles className="mr-2 h-3.5 w-3.5" />
                                                                Add "{subjectSearch}"
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CommandEmpty>
                                                <CommandGroup heading="Curriculum Subjects">
                                                    {subjectsList.map((s) => (
                                                        <CommandItem
                                                            key={s}
                                                            value={s}
                                                            onSelect={(val) => {
                                                                setSubject(val);
                                                                setTopic("");
                                                                setOpenSubject(false);
                                                                setSubjectSearch("");
                                                            }}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", subject === s ? "opacity-100" : "opacity-0")} />
                                                            {s}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                                {subjectSearch && !subjectsList.some(s => s.toLowerCase() === subjectSearch.toLowerCase()) && (
                                                    <CommandGroup heading="Custom Content">
                                                        <CommandItem
                                                            value={subjectSearch}
                                                            onSelect={() => {
                                                                setSubject(subjectSearch);
                                                                setTopic("");
                                                                setOpenSubject(false);
                                                                setSubjectSearch("");
                                                            }}
                                                            className="text-indigo-600 font-bold"
                                                        >
                                                            <Sparkles className="mr-2 h-4 w-4" />
                                                            Add "{subjectSearch}"
                                                        </CommandItem>
                                                    </CommandGroup>
                                                )}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>

                            {/* Topic - Combobox with Custom Input */}
                            <div className="flex flex-col gap-1 sm:min-w-[160px] flex-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Topic</label>
                                <Popover open={openTopic} onOpenChange={setOpenTopic}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={openTopic}
                                            disabled={isLoadingMetadata}
                                            className="w-full h-9 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold ring-offset-white focus:ring-2 ring-indigo-500/10 hover:bg-slate-50 text-slate-700 hover:text-slate-900"
                                        >
                                            <span className="truncate flex-1 text-left">
                                                {topic || (isLoadingMetadata ? "Loading..." : "Select topic...")}
                                            </span>
                                            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0 z-[110]" align="start">
                                        <Command value={topicSearch} onValueChange={setTopicSearch}>
                                            <CommandInput
                                                placeholder="Search or type new topic..."
                                            />
                                            <CommandList>
                                                <CommandEmpty>
                                                    <div className="p-2">
                                                        <p className="text-xs text-muted-foreground mb-2">No topic found.</p>
                                                        {topicSearch && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="w-full justify-start text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                                                                onClick={() => {
                                                                    setTopic(topicSearch);
                                                                    setOpenTopic(false);
                                                                    setTopicSearch("");
                                                                }}
                                                            >
                                                                <Sparkles className="mr-2 h-3.5 w-3.5" />
                                                                Add "{topicSearch}"
                                                            </Button>
                                                        )}
                                                    </div>
                                                </CommandEmpty>

                                                {!subject ? (
                                                    Object.entries(topicsMap).map(([subj, topics]) => (
                                                        <CommandGroup key={subj} heading={subj}>
                                                            {topics.map((t) => (
                                                                <CommandItem
                                                                    key={`${subj}-${t}`}
                                                                    value={`${t} (${subj})`}
                                                                    onSelect={() => {
                                                                        setSubject(subj);
                                                                        setTopic(t);
                                                                        setOpenTopic(false);
                                                                        setTopicSearch("");
                                                                    }}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4 opacity-0")} />
                                                                    {t} <span className="ml-2 text-[10px] text-slate-400 font-medium">({subj})</span>
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    ))
                                                ) : (
                                                    <CommandGroup heading={`Topics for ${subject}`}>
                                                        {(topicsMap[subject] || []).map((t) => (
                                                            <CommandItem
                                                                key={t}
                                                                value={t}
                                                                onSelect={(currentValue) => {
                                                                    setTopic(currentValue);
                                                                    setOpenTopic(false);
                                                                    setTopicSearch("");
                                                                }}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", topic === t ? "opacity-100" : "opacity-0")} />
                                                                {t}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                )}

                                                {topicSearch && (
                                                    <CommandGroup heading="Custom Content">
                                                        <CommandItem
                                                            value={topicSearch}
                                                            onSelect={() => {
                                                                setTopic(topicSearch);
                                                                setOpenTopic(false);
                                                                setTopicSearch("");
                                                            }}
                                                            className="text-indigo-600 font-bold"
                                                        >
                                                            <Sparkles className="mr-2 h-4 w-4" />
                                                            Add "{topicSearch}"
                                                        </CommandItem>
                                                    </CommandGroup>
                                                )}
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Row 2: Secondary Controls - Lower Z-index */}
                        <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-2 relative z-10 mt-1 sm:mt-0">
                            <div className="flex flex-col gap-1 min-w-[180px] flex-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">
                                    {mode === 'quiz' ? 'Quiz Title' : 'Lesson Title'}
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder={mode === 'quiz' ? "e.g. Algebra Quiz 1" : "e.g. Intro to Trigonometry"}
                                    className="flex h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 ring-indigo-500/10"
                                />
                            </div>

                            {/* Language Selector */}
                            <div className="flex flex-col gap-1 min-w-[110px]">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Language</label>
                                <Select value={responseLanguage} onValueChange={setResponseLanguage}>
                                    <SelectTrigger className="bg-slate-50 border-slate-200 h-9 rounded-lg text-[11px] font-bold ring-offset-white focus:ring-2 ring-indigo-500/10">
                                        <SelectValue placeholder="Lang" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="auto" className="text-xs font-bold flex items-center gap-2">
                                            <Sparkles className="w-3 h-3 text-indigo-500" /> Auto
                                        </SelectItem>
                                        <SelectItem value="Urdu" className="text-xs font-bold">Urdu</SelectItem>
                                        <SelectItem value="Hindi" className="text-xs font-bold">Hindi</SelectItem>
                                        <SelectItem value="Telugu" className="text-xs font-bold">Telugu</SelectItem>
                                        <SelectItem value="English" className="text-xs font-bold">English</SelectItem>
                                    </SelectContent>
                                </Select>
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
                        <div className="flex items-center justify-between gap-3 pt-1.5 border-t border-slate-100/50">
                            <div className="flex-1 flex flex-wrap items-center gap-3">
                                {mode === 'lesson' && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <label className="text-[9px] font-black uppercase text-slate-400">Unit:</label>
                                            <input
                                                value={unitDetails}
                                                onChange={(e) => setUnitDetails(e.target.value)}
                                                placeholder="Unit details..."
                                                className="h-8 bg-slate-50 border border-slate-200 rounded-lg px-3 text-[11px] font-medium w-[200px]"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-[9px] font-black uppercase text-slate-400">Mins:</label>
                                            <input
                                                type="number"
                                                value={sessionDuration}
                                                onChange={(e) => setSessionDuration(e.target.value)}
                                                className="h-8 w-14 bg-slate-50 border border-slate-200 rounded-lg px-2 text-[11px] font-medium"
                                            />
                                        </div>
                                    </>
                                )}
                                {mode === 'quiz' && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <label className="text-[9px] font-black uppercase text-slate-400">Institute:</label>
                                            <input
                                                value={instituteName}
                                                onChange={(e) => setInstituteName(e.target.value)}
                                                placeholder="Institute..."
                                                className="h-8 bg-slate-50 border border-slate-200 rounded-lg px-2 text-[10px] font-medium w-[140px]"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-[9px] font-black uppercase text-slate-400">Diff:</label>
                                            <Select value={quizDifficulty} onValueChange={setQuizDifficulty}>
                                                <SelectTrigger className="h-8 w-24 bg-slate-50 border-slate-200 rounded-lg text-[10px] font-bold">
                                                    <SelectValue placeholder="Diff" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Beginner" className="text-xs">Beginner</SelectItem>
                                                    <SelectItem value="Intermediate" className="text-xs">Intermediate</SelectItem>
                                                    <SelectItem value="Advanced" className="text-xs">Advanced</SelectItem>
                                                    <SelectItem value="Mixed" className="text-xs">Mixed</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <label className="text-[9px] font-black uppercase text-slate-400">Qs:</label>
                                            <input
                                                type="number"
                                                value={quizNumQuestions}
                                                onChange={(e) => setQuizNumQuestions(parseInt(e.target.value) || 5)}
                                                className="h-8 w-12 bg-slate-50 border border-slate-200 rounded-lg px-2 text-[10px] font-medium"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    />
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className={`h-9 px-3 rounded-lg border-slate-200 font-bold text-[11px] ${pdfText ? 'bg-emerald-50 text-emerald-600' : ''}`}
                                    >
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <FileUp className="w-3.5 h-3.5 mr-1" />}
                                        {pdfText ? 'PDF Added' : 'Add PDF'}
                                    </Button>
                                </div>

                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating || (!topic && !pdfText)}
                                    size="sm"
                                    className="h-9 px-5 bg-[#0D5355] hover:bg-[#083334] text-white rounded-lg font-black text-[11px] uppercase tracking-wider"
                                >
                                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
                                    {isGenerating ? 'Wait...' : result ? 'Refresh' : 'Generate'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Content Area */}
            <main className="flex-1 p-6 md:p-10 relative z-0">
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
                                    {safeActivities.map((_: any, idx: number) => (
                                        <div
                                            key={idx}
                                            className={`h-1.5 w-8 rounded-full transition-all ${idx === activeActivityIndex ? 'bg-indigo-600' : 'bg-slate-200'}`}
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
                                    {safeActivities[activeActivityIndex]?.recap && (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-amber-600">
                                                <Brain className="w-5 h-5" />
                                                <span className="text-xs font-black uppercase tracking-[0.2em]">Concept Refresher</span>
                                            </div>
                                            <div className="text-xl text-slate-700 font-medium leading-relaxed italic border-l-4 border-amber-200 pl-6 py-2">
                                                "{safeActivities[activeActivityIndex].recap}"
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
                                            {safeActivities[activeActivityIndex]?.tip ||
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
                                            if (activeActivityIndex !== null && activeActivityIndex < safeActivities.length - 1) {
                                                setActiveActivityIndex(activeActivityIndex + 1);
                                            } else {
                                                setActiveActivityIndex(null);
                                                toast.success("Lesson completed! 🎉 Great job!");
                                            }
                                        }}
                                        className="h-14 px-10 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100"
                                    >
                                        {activeActivityIndex === safeActivities.length - 1 ? 'Finish Lesson' : 'Next Activity'} <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full md:max-w-[95%] mx-auto bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 min-h-full flex flex-col print:max-w-full print:shadow-none print:border-none print:rounded-none"
                        >
                            {/* Result Header - Ultra Compact & Fitted */}
                            <div className="sticky top-[130px] md:top-[125px] lg:top-[120px] z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 p-2 md:p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm print:static print:shadow-none print:border-none print:bg-white">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-md ${mode === 'lesson' ? 'bg-[#0D5355] text-white shadow-teal-100' :
                                        mode === 'quiz' ? 'bg-amber-500 text-white shadow-amber-200' :
                                            'bg-[#0D5355] text-white shadow-teal-100'}`}>
                                        {mode === 'lesson' ? <GraduationCap className="w-6 h-6" /> :
                                            mode === 'quiz' ? <HelpCircle className="w-6 h-6" /> :
                                                <FileText className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="text-[8px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                                {mode === 'lesson' ? 'Lesson Plan' : mode === 'quiz' ? 'Quiz' : 'Material'}
                                            </span>
                                        </div>
                                        <h2 className="text-sm md:text-lg font-black text-slate-900 font-display leading-tight line-clamp-1">{result?.title || title || `Generated Content`}</h2>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5">
                                            {topic && <div className="flex items-center gap-1 sm:gap-1.5 text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                                                <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> {topic}
                                            </div>}
                                            {grade && grade !== "General" && (
                                                <>
                                                    <span className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-slate-300" />
                                                    <div className="flex items-center gap-1 sm:gap-1.5 text-slate-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                                                        <GraduationCap className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> Grade {grade}
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
                                        size="sm"
                                        onClick={() => setResult(null)}
                                        className="rounded-lg h-8 px-2 md:px-3 font-bold text-slate-500 hover:text-indigo-600 transition-all text-xs"
                                    >
                                        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
                                    </Button>

                                    <div className="flex items-center gap-1.5 sm:gap-2 scale-90 md:scale-100 origin-right">
                                        {mode === 'lesson' && (
                                            <Button
                                                onClick={() => setShowQuickAction(true)}
                                                className="rounded-lg h-8 md:h-9 px-2 md:px-3 font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm transition-all text-[10px] md:text-xs"
                                            >
                                                AI Actions
                                            </Button>
                                        )}
                                        <Button
                                            onClick={handleDownloadPDF}
                                            variant="outline"
                                            className="rounded-lg h-8 md:h-9 px-2 md:px-3 font-bold border-slate-200 text-slate-700 shadow-sm text-[10px] md:text-xs"
                                        >
                                            <Download className="w-3.5 h-3.5 mr-1 md:mr-1.5" /> PDF
                                        </Button>
                                        <Button
                                            className={`rounded-lg h-8 md:h-9 px-3 md:px-4 font-bold shadow-sm transition-all text-[10px] md:text-xs ${result?.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} `}
                                            onClick={handleSaveToLibrary}
                                            disabled={isSaving || result?.status === 'PUBLISHED'}
                                        >
                                            {isSaving ? (
                                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                                            ) : result?.status === 'PUBLISHED' ? (
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                            ) : (
                                                <Bookmark className="w-3 h-3 mr-1" />
                                            )}
                                            {result?.status === 'PUBLISHED' ? 'Saved' : 'Save'}
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-8 bg-white scroll-mt-20 relative z-10 w-full overflow-visible">



                                {mode === 'assignment' ? (
                                    <div className="space-y-12">
                                        {/* Assignment Header with Image and Key Points */}
                                        <div className="flex flex-col lg:flex-row gap-10 border-b border-slate-100 pb-12">
                                            <div className="flex-1 space-y-8">
                                                <div>
                                                    <h2 className="text-4xl font-black text-slate-900 mb-4">{result?.title || topic}</h2>
                                                    <p className="text-lg text-slate-600 font-medium leading-relaxed max-w-2xl">
                                                        {result?.intro || result?.content?.intro || `This assignment explores the core concepts of ${topic}. Complete all sections to evaluate your understanding.`}
                                                    </p>
                                                </div>

                                                {(result?.keyPoints || result?.content?.keyPoints) && (
                                                    <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
                                                        <h4 className="flex items-center gap-2 text-indigo-900 font-black text-lg mb-6 uppercase tracking-wider">
                                                            <Target className="w-5 h-5" />
                                                            Quick Review Points
                                                        </h4>
                                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {(result?.keyPoints || result?.content?.keyPoints || []).map((kp: string, i: number) => (
                                                                <li key={i} className="flex items-start gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-black mt-0.5">{i + 1}</span>
                                                                    <span className="text-sm font-bold text-slate-700 leading-tight">{kp}</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>

                                            {generatedImage && (
                                                <div className="w-full lg:w-80 group">
                                                    <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 group-hover:scale-105 transition-transform duration-500">
                                                        <div className="flex items-center gap-2 mb-3 px-2">
                                                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Assignment Focus</span>
                                                        </div>
                                                        <img
                                                            src={generatedImage}
                                                            alt={topic}
                                                            className="w-full aspect-square object-cover rounded-[1.75rem] shadow-sm mb-2"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        {/* Multiple Choice Questions */}
                                        {(result?.mcqs || result?.content?.mcqs) && (result?.mcqs || result?.content?.mcqs).length > 0 && (
                                            <div className="bg-indigo-950 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden group/mcq">
                                                {/* Decorative background elements */}
                                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32 transition-transform duration-1000 group-hover/mcq:scale-110"></div>
                                                <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

                                                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-16 h-16 rounded-[1.25rem] bg-indigo-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/40">
                                                            <CheckCircle2 className="w-8 h-8" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-3xl font-black tracking-tight leading-none mb-2">Multiple Choice</h3>
                                                            <p className="text-indigo-300 font-medium">Test your knowledge with these selections</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="relative space-y-8">
                                                    {(result?.mcqs || result?.content?.mcqs).map((m: any, idx: number) => (
                                                        <div key={idx} className="bg-white/5 backdrop-blur-sm rounded-[2rem] p-6 md:p-10 border border-white/10 hover:border-white/20 transition-all duration-300 group">
                                                            <div className="flex gap-6 mb-8">
                                                                <span className="flex-shrink-0 w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg ring-4 ring-indigo-900/50">{idx + 1}</span>
                                                                <p className="text-2xl font-bold leading-tight pt-1">{m.question}</p>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-[4.5rem]">
                                                                {m.options.map((opt: string, oi: number) => (
                                                                    <div key={oi} className="group/opt relative p-5 bg-white/5 rounded-2xl border border-white/5 text-slate-100 font-medium hover:bg-white hover:text-indigo-950 hover:shadow-2xl transition-all duration-300 cursor-default flex items-center gap-5">
                                                                        <span className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-sm font-black group-hover/opt:bg-indigo-50 group-hover/opt:text-indigo-600 transition-all uppercase italic tracking-tighter shadow-sm">{String.fromCharCode(65 + oi)}</span>
                                                                        <span className="text-lg leading-snug">{opt}</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Match the Following */}
                                        {(result?.matchFollowing || result?.content?.matchFollowing) && (result?.matchFollowing || result?.content?.matchFollowing).length > 0 && (
                                            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/50 relative group/match">
                                                <div className="flex items-center gap-3 mb-12">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white shadow-2xl shadow-emerald-200">
                                                        <RotateCcw className="w-7 h-7" />
                                                    </div>
                                                    <div>
                                                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-1">Match Items</h3>
                                                        <p className="text-slate-500 font-medium">Relate Column A with correct Column B matches</p>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 relative">
                                                    {/* Center divider dashed line */}
                                                    <div className="hidden md:block absolute left-1/2 top-4 bottom-4 w-px border-l-2 border-dashed border-slate-200 -translate-x-1/2" />

                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Column A</h4>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse"></span>
                                                        </div>
                                                        {(result?.matchFollowing || result?.content?.matchFollowing).map((m: any, idx: number) => (
                                                            <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-700 flex items-center group/item hover:bg-emerald-50 hover:border-emerald-200 transition-all duration-300">
                                                                <span className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-sm text-slate-400 mr-5 group-hover/item:text-emerald-600 group-hover/item:border-emerald-100 transition-all font-black uppercase">0{idx + 1}</span>
                                                                <span className="text-lg leading-tight">{m.left}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div className="space-y-6">
                                                        <div className="flex items-center justify-between mb-4">
                                                            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-violet-600 bg-violet-50 px-3 py-1 rounded-full">Column B</h4>
                                                            <span className="w-1.5 h-1.5 rounded-full bg-violet-300 animate-pulse"></span>
                                                        </div>
                                                        {(result?.matchFollowing || result?.content?.matchFollowing).map((m: any, idx: number, arr: any[]) => {
                                                            // Stable logic for displaying B column (stable shift)
                                                            const itemIdx = (idx + 3) % arr.length;
                                                            return (
                                                                <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 font-bold text-slate-700 flex items-center group/item hover:bg-violet-50 hover:border-violet-200 transition-all duration-300">
                                                                    <span className="w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-sm text-slate-400 mr-5 group-hover/item:text-violet-600 group-hover/item:border-violet-100 transition-all font-black uppercase italic tracking-tighter">{String.fromCharCode(65 + idx)}</span>
                                                                    <span className="text-lg leading-tight">{arr[itemIdx].right}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Assignment Questions */}
                                        <div className="bg-white/50 rounded-2xl p-6 md:p-8 border border-slate-100">
                                            <div className="flex items-center gap-3 mb-6">
                                                <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg shadow-violet-200">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900">Descriptive Questions</h3>
                                            </div>
                                            <ul className="space-y-4">
                                                {(result?.assignmentQuestions || result?.content?.assignmentQuestions || result?.content?.questions || result?.content?.sectionD_ShortAnswers || []).map((q: any, idx: number) => (
                                                    <li key={idx} className="flex gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-violet-200 transition-colors">
                                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-500 text-sm">{idx + 1}</span>
                                                        <p className="pt-1 text-slate-700 font-medium leading-relaxed">{typeof q === 'string' ? q : String(q || "")}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Fill in the Blanks Section */}
                                        {(result?.fillInTheBlanks || result?.content?.fillInTheBlanks || result?.content?.sectionB_FillBlanks) && (result?.fillInTheBlanks || result?.content?.fillInTheBlanks || result?.content?.sectionB_FillBlanks).length > 0 && (
                                            <div className="bg-amber-50/50 rounded-2xl p-6 md:p-8 border border-amber-100">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-200">
                                                        <Edit3 className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-900">Fill in the Blanks</h3>
                                                </div>
                                                <ul className="space-y-4">
                                                    {(result?.fillInTheBlanks || result?.content?.fillInTheBlanks || result?.content?.sectionB_FillBlanks).map((q: any, idx: number) => (
                                                        <li key={idx} className="flex gap-4 p-4 bg-white/80 rounded-xl border border-amber-100/50 shadow-sm hover:border-amber-200 transition-colors">
                                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center font-black text-amber-600 text-sm">F{idx + 1}</span>
                                                            <p className="pt-1 text-slate-800 font-medium leading-relaxed">{typeof q === 'string' ? q : String(q || "")}</p>
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
                                                <h3 className="text-xl font-bold text-slate-900">Activity & Assessment Projects</h3>
                                            </div>
                                            <ul className="space-y-4">
                                                {(result?.activityQuestions || result?.content?.activityQuestions || result?.content?.activities || []).map((q: any, idx: number) => (
                                                    <li key={idx} className="flex gap-4 p-4 bg-white/80 rounded-xl border border-indigo-100/50 shadow-sm">
                                                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-sm">A{idx + 1}</span>
                                                        <p className="pt-1 text-slate-800 font-medium leading-relaxed">{typeof q === 'string' ? q : String(q || "")}</p>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        {/* Project Ideas */}
                                        {(result?.projectIdeas || result?.content?.projectIdeas) && (result?.projectIdeas || result?.content?.projectIdeas).length > 0 && (
                                            <div className="bg-emerald-50/50 rounded-2xl p-6 md:p-8 border border-emerald-100">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                                                        <Lightbulb className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="text-xl font-bold text-slate-900">Project Based Assessments</h3>
                                                </div>
                                                <ul className="space-y-4">
                                                    {(result?.projectIdeas || result?.content?.projectIdeas).map((q: any, idx: number) => (
                                                        <li key={idx} className="flex gap-4 p-4 bg-white/80 rounded-xl border border-emerald-100/50 shadow-sm">
                                                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center font-black text-emerald-600 text-sm">P{idx + 1}</span>
                                                            <p className="pt-1 text-slate-800 font-medium leading-relaxed">{typeof q === 'string' ? q : String(q || "")}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

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
                                                                {/* MCQ Answers */}
                                                                {(result?.mcqs || result?.content?.mcqs || result?.answers?.mcqs) && (
                                                                    <div>
                                                                        <h4 className="font-bold text-emerald-800 mb-4 uppercase tracking-wider text-xs">MCQ Answers</h4>
                                                                        <ul className="space-y-3">
                                                                            {(result?.answers?.mcqs || (result?.mcqs || result?.content?.mcqs || []).map((m: any) => m.correct)).map((ans: string, i: number) => (
                                                                                <li key={i} className="text-sm text-emerald-900/80 bg-white/50 p-3 rounded-lg flex items-center gap-3">
                                                                                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">{i + 1}</span>
                                                                                    {ans}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                {/* Match Following Answers */}
                                                                {(result?.matchFollowing || result?.content?.matchFollowing || result?.answers?.matchFollowing) && (
                                                                    <div>
                                                                        <h4 className="font-bold text-emerald-800 mb-4 uppercase tracking-wider text-xs">Match Following Answers</h4>
                                                                        <ul className="space-y-3">
                                                                            {(result?.answers?.matchFollowing || (result?.matchFollowing || result?.content?.matchFollowing || []).map((m: any) => `${m.left} → ${m.right}`)).map((ans: string, i: number) => (
                                                                                <li key={i} className="text-sm text-emerald-900/80 bg-white/50 p-3 rounded-lg">
                                                                                    {ans}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                <div>
                                                                    <h4 className="font-bold text-emerald-800 mb-4 uppercase tracking-wider text-xs">Descriptive Answers</h4>
                                                                    <ul className="space-y-4">
                                                                        {(result?.answers?.assignmentQuestions || result?.answerKey?.Questions || result?.answerKey?.questions || result?.answerKey?.["Section D (Short Answers)"] || result?.content?.answers?.assignmentQuestions || []).map((a: string, idx: number) => (
                                                                            <li key={idx} className="text-sm text-emerald-900/80 bg-white/50 p-3 rounded-lg">
                                                                                <span className="font-bold mr-2 text-emerald-600">Q{idx + 1}.</span> {a}
                                                                            </li>
                                                                        ))}
                                                                    </ul>
                                                                </div>

                                                                {(result?.answers?.fillInTheBlanks || result?.answerKey?.["Section B (Fill in the Blanks)"] || result?.content?.answers?.fillInTheBlanks) && (
                                                                    <div>
                                                                        <h4 className="font-bold text-emerald-800 mb-4 uppercase tracking-wider text-xs">Fill in the Blanks Answers</h4>
                                                                        <ul className="space-y-4">
                                                                            {(result?.answers?.fillInTheBlanks || result?.answerKey?.["Section B (Fill in the Blanks)"] || result?.content?.answers?.fillInTheBlanks || []).map((a: string, idx: number) => (
                                                                                <li key={idx} className="text-sm text-emerald-900/80 bg-white/50 p-3 rounded-lg">
                                                                                    <span className="font-bold mr-2 text-emerald-600">F{idx + 1}.</span> {a}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                <div>
                                                                    <h4 className="font-bold text-emerald-800 mb-4 uppercase tracking-wider text-xs">Activity & Project Guides</h4>
                                                                    <ul className="space-y-4">
                                                                        {(result?.answers?.activityQuestions || result?.answerKey?.Activities || result?.answerKey?.activities || result?.content?.answers?.activityQuestions || result?.answers?.projectIdeas || []).map((a: string, idx: number) => (
                                                                            <li key={idx} className="text-sm text-emerald-900/80 bg-white/50 p-3 rounded-lg">
                                                                                <span className="font-bold mr-2 text-emerald-600">G{idx + 1}.</span> {a}
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
                                        <div className="flex flex-col md:flex-row gap-8 border-b border-slate-200 pb-8">
                                            <div className="flex-1">
                                                <h2 className="text-4xl font-black text-slate-900 mb-6 font-display">Lesson Plan</h2>
                                                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-bold text-slate-500 uppercase tracking-tight">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                        <span><span className="text-slate-400">Unit:</span> {String(unitDetails || result?.unitDetails || result?.title || result?.content?.title || title || topic || "N/A")}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                        <span><span className="text-slate-400">Duration:</span> {String(sessionDuration || "60")} Min</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                        <span><span className="text-slate-400">Sessions:</span> {String(numSessions || "1")}</span>
                                                    </div>
                                                    {(result?.groupSize || result?.content?.groupSize) && (
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                            <span><span className="text-slate-400">Groups:</span> {String(result.groupSize || result.content?.groupSize)}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {generatedImage && (
                                                <div className="shrink-0 flex gap-4">
                                                    {visualImages.length > 0 ? (
                                                        visualImages.map((imgUrl, idx) => (
                                                            <div key={idx} className={`w-28 h-28 md:w-32 md:h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl ${idx === 0 ? 'rotate-3' : idx === 1 ? '-rotate-3' : 'rotate-1'} hover:rotate-0 transition-all duration-500 hover:scale-105`}>
                                                                <img src={imgUrl} alt={`${topic} visual aid ${idx + 1}`} className="w-full h-full object-cover" />
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl rotate-3 hover:rotate-0 transition-all duration-500">
                                                            <img src={generatedImage} alt={topic} className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Visual Aids Gallery (if multiple) */}
                                        {visualImages.length > 1 && (
                                            <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100">
                                                <div className="flex items-center gap-3 mb-6">
                                                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                                                        <Eye className="w-5 h-5" />
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-900">Visual Aids Gallery</h3>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    {visualImages.map((imgUrl, idx) => (
                                                        <div key={idx} className="group relative aspect-video rounded-3xl overflow-hidden shadow-md hover:shadow-xl transition-all border-2 border-white">
                                                            <img src={imgUrl} alt={`${topic} aid ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all" />
                                                            <div className="absolute bottom-4 left-4">
                                                                <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black uppercase text-slate-900">Visual Aid #{idx + 1}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Learning Outcomes */}
                                        <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Target className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-bold text-lg text-slate-900">Learning Outcomes:</h4>
                                            </div>
                                            {
                                                (Array.isArray(result?.objective || result?.content?.objective)) ? (
                                                    <ol className="list-decimal pl-5 space-y-2 marker:text-indigo-600 marker:font-bold">
                                                        {(result.objective || result.content?.objective).map((obj: string, i: number) => (
                                                            <li key={i} className="text-slate-700 leading-relaxed pl-2">{String(obj)}</li>
                                                        ))}
                                                    </ol>
                                                ) : (
                                                    <p className="text-slate-700 leading-relaxed pl-2 border-l-4 border-indigo-100 bg-white p-4 rounded-r-xl shadow-sm">
                                                        {String(result?.objective || result?.content?.objective || result?.learningOutcomes || result?.content?.learningOutcomes || "Ready to view learning objectives.")}
                                                    </p>
                                                )
                                            }
                                        </div>

                                        {/* Materials Needed */}
                                        {
                                            result?.materials && (
                                                <div>
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        <h4 className="font-bold text-lg text-slate-900">Materials Needed:</h4>
                                                    </div>
                                                    <ul className="list-disc pl-5 space-y-1 marker:text-slate-400">
                                                        {(Array.isArray(result.materials) ? result.materials : [result.materials]).map((m: any, i: number) => (
                                                            <li key={i} className="text-slate-700 leading-relaxed pl-2">{typeof m === 'string' ? m : String(m || "")}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )
                                        }

                                        {/* Core Concept Explanation */}
                                        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Brain className="w-4 h-4" />
                                                </div>
                                                <h4 className="font-bold text-lg text-slate-900">Concept Explanation:</h4>
                                            </div>
                                            <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                                                {String(
                                                    result?.explanation ||
                                                    result?.content?.explanation ||
                                                    result?.conceptExplanation ||
                                                    result?.content?.conceptExplanation ||
                                                    result?.overview ||
                                                    "Detailed explanation will be displayed here."
                                                )}
                                            </div>
                                        </div>

                                        {/* Pedagogy */}
                                        {(result?.pedagogy || result?.content?.pedagogy) && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <GraduationCap className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="font-bold text-lg text-slate-900">Pedagogy:</h4>
                                                </div>
                                                <div className="text-slate-700 leading-relaxed pl-2 border-l-4 border-indigo-100 bg-slate-50/50 p-4 rounded-r-xl whitespace-pre-wrap text-sm font-medium">
                                                    {String(result.pedagogy || result.content?.pedagogy || "")}
                                                </div>
                                            </div>
                                        )}

                                        {/* Inquiry based learning */}
                                        {(result?.inquiryBasedLearning || result?.content?.inquiryBasedLearning) && (
                                            <div className="bg-white rounded-2xl border border-dashed border-indigo-200 p-6">
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <BookOpen className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="font-bold text-lg text-indigo-900">Inquiry based learning:</h4>
                                                </div>
                                                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                                                    {String(result.inquiryBasedLearning || result.content?.inquiryBasedLearning || "")}
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
                                                {
                                                    (() => {
                                                        const acts = safeActivities;

                                                        if (acts.length === 0) return <p className="text-slate-400 italic">No activities listed.</p>;

                                                        return acts.map((act: any, i: number) => (
                                                            <div key={i} className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-indigo-100 transition-all group">
                                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                                    <div className="flex-1">
                                                                        <h5 className="font-black text-slate-900 leading-tight">
                                                                            <span className="text-indigo-600 mr-2">{i + 1}.</span>
                                                                            {act.task || act.description || "Activity " + (i + 1)}
                                                                        </h5>
                                                                    </div>
                                                                    {act.time && (
                                                                        <span className="px-3 py-1 bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-lg border border-slate-100">
                                                                            {act.time}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                {(act.recap || act.tip || (act.task && act.description)) && (
                                                                    <div className="space-y-3">
                                                                        {act.task && act.description && (
                                                                            <p className="text-sm text-slate-600 leading-relaxed font-medium">
                                                                                {act.description}
                                                                            </p>
                                                                        )}
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
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ));
                                                    })()
                                                }
                                            </div>
                                        </div>

                                        {/* Closure Activity */}
                                        {(result?.closure || result?.content?.closure) && (
                                            <div className="p-8 bg-indigo-50/40 rounded-3xl border border-indigo-100 border-dashed relative overflow-hidden mt-8">
                                                <div className="absolute -right-4 -bottom-4 opacity-5">
                                                    <RotateCcw className="w-24 h-24 text-indigo-900" />
                                                </div>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                                        <RotateCcw className="w-5 h-5" />
                                                    </div>
                                                    <h4 className="font-bold text-lg text-indigo-900">Closure & Reflection:</h4>
                                                </div>
                                                <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm font-bold italic pl-13">
                                                    {String(result.closure || result.content?.closure || "")}
                                                </div>
                                            </div>
                                        )}
                                        {/* Teaching Strategies */}
                                        {
                                            result?.teachingStrategies && result.teachingStrategies.length > 0 && (
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
                                            )
                                        }

                                        {/* Assessment Breakdown */}
                                        {(result?.assessment || result?.content?.assessment) ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                                    <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                                        <Eye className="w-4 h-4 text-indigo-600" />
                                                        Formative Assessment:
                                                    </h5>
                                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{String((result.assessment || result.content?.assessment)?.formative || "")}</p>
                                                </div>
                                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                                    <h5 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                                        <UserCheck className="w-4 h-4 text-emerald-600" />
                                                        Individual Assessment:
                                                    </h5>
                                                    <p className="text-sm text-slate-700 leading-relaxed font-medium">{String((result.assessment || result.content?.assessment)?.individual || "")}</p>
                                                </div>
                                            </div>
                                        ) : (result?.assessmentMethods || result?.content?.assessmentMethods) && (result.assessmentMethods || result.content?.assessmentMethods).length > 0 && (
                                            <div>
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                        <ShieldCheck className="w-4 h-4" />
                                                    </div>
                                                    <h4 className="font-bold text-lg text-slate-900">Assessment Methods:</h4>
                                                </div>
                                                <ul className="list-disc pl-5 space-y-2 marker:text-slate-400">
                                                    {(Array.isArray(result.assessmentMethods || result.content?.assessmentMethods) ? (result.assessmentMethods || result.content?.assessmentMethods) : []).map((m: any, i: number) => (
                                                        <li key={i} className="text-slate-700 leading-relaxed pl-2">{String(m)}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Homework */}
                                        {
                                            result?.homework && (
                                                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                                                    <h4 className="font-bold text-lg text-slate-900 mb-3 flex items-center gap-2">
                                                        <BookOpen className="w-5 h-5 text-indigo-600" />
                                                        Homework Assignment:
                                                    </h4>
                                                    <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm font-medium">
                                                        {String(result.homework || result.content?.homework || "")}
                                                    </div>
                                                </div>
                                            )
                                        }

                                        {/* Review Questions */}
                                        {
                                            (result?.questions || result?.content?.questions) && (
                                                <div className="p-8 bg-[#0D5355] rounded-3xl text-white shadow-xl shadow-teal-100 relative overflow-hidden mb-8">
                                                    <div className="absolute top-0 right-0 p-6 opacity-10">
                                                        <HelpCircle className="w-20 h-20" />
                                                    </div>
                                                    <h4 className="text-white/70 font-black uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                                                        Review & Evaluation
                                                    </h4>
                                                    <div className="space-y-6">
                                                        {(Array.isArray(result?.questions || result?.content?.questions) ? (result?.questions || result?.content?.questions) : []).map((q: any, i: number) => (
                                                            <div key={i} className="flex gap-4">
                                                                <span className="text-teal-400 font-black">Q{i + 1}.</span>
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
                                            )
                                        }

                                        {/* Differentiation */}
                                        {(result?.differentiation || result?.content?.differentiation) && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                                <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100">
                                                    <h5 className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4" />
                                                        Advanced:
                                                    </h5>
                                                    <p className="text-xs text-emerald-800 leading-relaxed font-medium">{String((result.differentiation || result.content?.differentiation)?.advanced || "")}</p>
                                                </div>
                                                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100">
                                                    <h5 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                                                        <Settings2 className="w-4 h-4" />
                                                        Struggling:
                                                    </h5>
                                                    <p className="text-xs text-amber-800 leading-relaxed font-medium">{String((result.differentiation || result.content?.differentiation)?.struggling || "")}</p>
                                                </div>
                                                {(result.differentiation || result.content?.differentiation)?.ell && (
                                                    <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                                                        <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                                            <Languages className="w-4 h-4" />
                                                            ELL Support:
                                                        </h5>
                                                        <p className="text-xs text-blue-800 leading-relaxed font-medium">{String((result.differentiation || result.content?.differentiation)?.ell || "")}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Estimated Time Breakdown */}
                                        {
                                            result?.estimatedTime && result.estimatedTime.length > 0 && (
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
                                            )
                                        }

                                        {/* Reference URL */}
                                        {
                                            result?.referenceUrl && (
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
                                            )
                                        }

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
                                    </div>
                                ) : mode === 'quiz' ? (
                                    <div className="space-y-6">
                                        {(result?.questions || []).map((q: any, i: number) => {
                                            const selectedAnswer = userAnswers[i];
                                            const isAnswered = selectedAnswer !== undefined;

                                            return (
                                                <div key={i} className="p-6 sm:p-10 bg-white rounded-[1.5rem] sm:rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-100/50 mb-6 sm:mb-8 last:mb-0 group hover:border-indigo-200 transition-all relative overflow-hidden">
                                                    <div className="absolute -top-6 -right-6 opacity-[0.02] rotate-12 transition-transform group-hover:rotate-0 group-hover:scale-110 pointer-events-none">
                                                        <Brain className="w-32 h-32 text-indigo-900" />
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 relative z-10">
                                                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-base sm:text-lg border border-indigo-100 shadow-sm shrink-0">
                                                            {i + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-lg sm:text-xl font-bold text-slate-800 mb-4 sm:mb-6 leading-snug">{q.question}</p>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
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
                                                                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] border transition-colors ${isSelected ? 'bg-white border-transparent' : 'bg-white border-slate-200 group-hover:border-slate-300'}`}>
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
                                            )
                                        })}
                                    </div>
                                ) : mode === 'material' ? (
                                    <div className="flex flex-col gap-6">
                                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <Button
                                                    variant={currentPage === 1 ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(1)}
                                                    className={`rounded-xl px-4 font-bold ${currentPage === 1 ? 'bg-indigo-600 text-white' : 'text-slate-600 border-slate-200'}`}
                                                >
                                                    Content
                                                </Button>
                                                <Button
                                                    variant={currentPage === (result?.sections?.length || 0) + 2 ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage((result?.sections?.length || 0) + 2)}
                                                    className={`rounded-xl px-4 font-bold ${currentPage === (result?.sections?.length || 0) + 2 ? 'bg-indigo-600 text-white' : 'text-slate-600 border-slate-200'}`}
                                                >
                                                    Review
                                                </Button>
                                            </div>
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
                                                    <div className="p-10 border-b border-slate-200 bg-white">
                                                        <div className="flex flex-col lg:flex-row gap-10">
                                                            {/* Main Content Area */}
                                                            <div className="flex-1 prose prose-slate max-w-none">
                                                                <h1 className="text-4xl font-black text-slate-900 mb-6">{result?.title || topic}</h1>

                                                                <div className="text-lg leading-relaxed text-slate-700 mb-8 font-medium">
                                                                    <ReactMarkdown>{result?.intro || ""}</ReactMarkdown>
                                                                </div>

                                                                {/* Key Points - Desktop Side / Mobile Top */}
                                                                {(result?.keyPoints || result?.content?.keyPoints) && (
                                                                    <div className="bg-indigo-50/50 rounded-3xl p-8 border border-indigo-100 mb-10">
                                                                        <h4 className="text-indigo-900 font-black text-xl mb-4 flex items-center gap-2">
                                                                            <Target className="w-5 h-5" />
                                                                            Key Points to Remember:
                                                                        </h4>
                                                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                            {(result?.keyPoints || result?.content?.keyPoints || []).map((kp: string, i: number) => (
                                                                                <li key={i} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                                                                                    <div className="w-5 h-5 rounded-full bg-indigo-600 flex-shrink-0 flex items-center justify-center text-[10px] text-white mt-0.5">{i + 1}</div>
                                                                                    {kp}
                                                                                </li>
                                                                            ))}
                                                                        </ul>
                                                                    </div>
                                                                )}

                                                                <div className="space-y-12">
                                                                    {(result?.sections || result?.content?.sections || []).map((s: any, idx: number) => (
                                                                        <div key={idx} className="group">
                                                                            <h3 className="text-2xl font-black text-slate-800 mb-4 border-l-4 border-indigo-600 pl-4">{s.heading}</h3>
                                                                            <div className="text-slate-600 leading-relaxed text-base font-medium mb-6">
                                                                                <ReactMarkdown>{s.content}</ReactMarkdown>
                                                                            </div>
                                                                            {s.bulletPoints && s.bulletPoints.length > 0 && (
                                                                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                                                                                    {s.bulletPoints.map((bp: string, bi: number) => (
                                                                                        <li key={bi} className="bg-white p-4 rounded-xl border border-slate-100 flex items-start gap-3 shadow-sm group-hover:border-indigo-100 transition-all">
                                                                                            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                                                            <span className="text-sm font-bold text-slate-700">{bp}</span>
                                                                                        </li>
                                                                                    ))}
                                                                                </ul>
                                                                            )}
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Sidebar - Diagram and Stats */}
                                                            <div className="w-full lg:w-80 space-y-6">
                                                                {generatedImage && (
                                                                    <div className="bg-white p-4 rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 sticky top-10">
                                                                        <div className="flex items-center gap-2 mb-3 px-2">
                                                                            <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Educational Diagram</span>
                                                                        </div>
                                                                        <img
                                                                            src={generatedImage}
                                                                            alt="Topic Diagram"
                                                                            className="w-full aspect-square object-cover rounded-2xl mb-4 border border-slate-100"
                                                                        />
                                                                        <p className="text-[11px] font-bold text-slate-500 text-center leading-relaxed px-2">
                                                                            {result?.illustrationDescription || result?.content?.illustrationDescription || "Visual representation of the core concepts described in this lesson."}
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    key="page2"
                                                    initial={{ opacity: 0, x: 20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -20 }}
                                                    className="flex flex-col bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 p-10"
                                                >
                                                    {/* Study Tips Section */}
                                                    {(result?.preparationTips || result?.content?.preparationTips) && (result?.preparationTips || result?.content?.preparationTips).length > 0 && (
                                                        <div className="mb-12">
                                                            <div className="flex items-center gap-3 mb-6">
                                                                <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-lg shadow-amber-100">
                                                                    <Lightbulb className="w-5 h-5" />
                                                                </div>
                                                                <h2 className="text-3xl font-black text-slate-800">Study Tips</h2>
                                                            </div>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {(result?.preparationTips || result?.content?.preparationTips).map((tip: string, i: number) => (
                                                                    <div key={i} className="p-5 bg-amber-50/50 rounded-2xl border border-amber-100 flex items-start gap-3">
                                                                        <div className="mt-1 text-amber-600 font-black text-lg">💡</div>
                                                                        <p className="text-sm font-bold text-amber-900/80">{tip}</p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-10 h-10 rounded-xl bg-[#1A3263] flex items-center justify-center text-white shadow-lg shadow-blue-100">
                                                            <HelpCircle className="w-5 h-5" />
                                                        </div>
                                                        <h2 className="text-3xl font-black text-[#1A3263]">Review Questions</h2>
                                                    </div>

                                                    <div className="space-y-6 mb-12">
                                                        {(result?.reviewQuestions || result?.content?.reviewQuestions || []).map((q: string, i: number) => (
                                                            <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-4">
                                                                <span className="font-black text-indigo-600 min-w-8">Q{i + 1}.</span>
                                                                <p className="text-slate-800 font-bold leading-relaxed">{q}</p>
                                                            </div>
                                                        ))}
                                                    </div>

                                                    {/* Answer Key for Material */}
                                                    {(result?.answerKey || result?.content?.answerKey) && (result?.answerKey || result?.content?.answerKey).length > 0 && (
                                                        <div className="mt-6 pt-10 border-t border-slate-100">
                                                            <Button
                                                                variant="outline"
                                                                onClick={() => setShowAnswerKey(!showAnswerKey)}
                                                                className={`w-full h-14 rounded-2xl border-2 transition-all flex items-center justify-center gap-2 font-black ${showAnswerKey ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-white border-slate-100 text-slate-600 hover:border-indigo-200 hover:text-indigo-600'}`}
                                                            >
                                                                {showAnswerKey ? <ChevronRight className="w-5 h-5 rotate-90" /> : <ChevronRight className="w-5 h-5" />}
                                                                {showAnswerKey ? "Hide Answer Key" : "View Answers for Questions"}
                                                            </Button>

                                                            <AnimatePresence>
                                                                {showAnswerKey && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, height: 0 }}
                                                                        animate={{ opacity: 1, height: 'auto' }}
                                                                        exit={{ opacity: 0, height: 0 }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="mt-6 space-y-4">
                                                                            {(result?.answerKey || result?.content?.answerKey).map((ans: string, i: number) => (
                                                                                <div key={i} className="p-6 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-start gap-4">
                                                                                    <span className="font-black text-emerald-600 min-w-8">A{i + 1}.</span>
                                                                                    <p className="text-emerald-900 font-bold leading-relaxed">{ans}</p>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ) : mode === 'presentation' ? (
                                    <div className="space-y-12">
                                        <div className="bg-slate-900 rounded-[2rem] p-10 text-white relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-8 opacity-20 rotate-12 transition-transform group-hover:rotate-0">
                                                <Presentation className="w-32 h-32" />
                                            </div>
                                            <h2 className="text-4xl font-black mb-4 relative z-10">{result?.title || "Presentation Slides"}</h2>
                                            <p className="text-slate-400 text-lg font-medium relative z-10">{result?.explanation || "A comprehensive slide deck for your lesson."}</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {(result?.slides || []).map((slide: any, i: number) => (
                                                <div key={i} className="bg-white rounded-[2rem] border-2 border-slate-100 p-8 shadow-xl shadow-slate-100/50 hover:border-indigo-100 transition-all flex flex-col min-h-[300px]">
                                                    <div className="flex items-center gap-3 mb-6">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black">
                                                            {i + 1}
                                                        </div>
                                                        <h3 className="text-xl font-bold text-slate-900">{slide.title || slide.heading}</h3>
                                                    </div>
                                                    <div className="flex-1 text-slate-700 font-medium leading-relaxed">
                                                        <ReactMarkdown>{slide.content || (Array.isArray(slide.points) ? slide.points.join('\n') : "")}</ReactMarkdown>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-10">
                                        <div className="prose prose-slate prose-indigo max-w-none">
                                            <ReactMarkdown>
                                                {typeof (result?.content || result?.explanation) === 'string'
                                                    ? (result?.content || result?.explanation)
                                                    : String(result?.content || result?.explanation || "")}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
            <QuickActionDialog
                open={showQuickAction}
                onOpenChange={setShowQuickAction}
                contentToProcess={(() => {
                    if (!result) return "";
                    const parts: string[] = [];
                    if (result.title) parts.push(`Title: ${result.title}`);
                    if (result.objective) parts.push(`Learning Objectives:\n${(Array.isArray(result.objective) ? result.objective : [result.objective]).map((o: string) => `- ${o}`).join('\n')}`);
                    if (result.explanation) parts.push(`Explanation:\n${result.explanation}`);
                    if (result.pedagogy) parts.push(`Pedagogy:\n${result.pedagogy}`);
                    if (result.inquiryBasedLearning) parts.push(`Inquiry Based Learning:\n${result.inquiryBasedLearning}`);
                    if (result.homework) parts.push(`Homework:\n${result.homework}`);
                    try {
                        const acts = result.activities ? (Array.isArray(result.activities) ? result.activities : JSON.parse(result.activities)) : [];
                        if (acts.length) parts.push(`Activities:\n${acts.map((a: any) => `- ${a.time || ''}: ${a.description || a.task || ''}`).join('\n')}`);
                    } catch { }
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
