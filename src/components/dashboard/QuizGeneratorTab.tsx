import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Loader2, Save, Send, Trash2, CheckCircle2, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function QuizGeneratorTab() {
    const [selectedGrade, setSelectedGrade] = useState("10");
    const [selectedCurriculum, setSelectedCurriculum] = useState("CBSE");
    const [topicId, setTopicId] = useState("");
    const [questionType, setQuestionType] = useState("MCQ");
    const [questions, setQuestions] = useState<any[]>([]);

    // New Fields
    const [instituteName, setInstituteName] = useState("");
    const [quizTitle, setQuizTitle] = useState("");
    const [difficultyLevel, setDifficultyLevel] = useState("Beginner");
    const [numQuestions, setNumQuestions] = useState(5);
    const [showPreview, setShowPreview] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false); // New state for intermediate screen

    const queryClient = useQueryClient();

    // ... (topics query remains same) ...

    const generateMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/quizzes/generate', data);
            return res.data;
        },
        onSuccess: (data) => {
            setQuestions(data.questions);
            setIsReviewMode(false); // Reset to show selection card
            setShowPreview(false);
            toast.success("AI generated " + data.questions.length + " questions!");
        }
    });

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await api.post('/quizzes/save', data);
            return res.data;
        },
        onSuccess: () => {
            toast.success("Quiz saved successfully!");
            queryClient.invalidateQueries({ queryKey: ['quizzes'] });
        }
    });

    const handleGenerate = () => {
        if (!topicId) {
            toast.error("Please enter a topic first.");
            return;
        }

        // Map Difficulty to Bloom's
        let bloomLevel = "Remember";
        if (difficultyLevel === "Intermediate") bloomLevel = "Apply";
        if (difficultyLevel === "Advanced") bloomLevel = "Evaluate";
        if (difficultyLevel === "Mixed") bloomLevel = "Mixed";

        generateMutation.mutate({
            topic: topicId,
            subject: "General",
            grade: selectedGrade,
            curriculum: selectedCurriculum,
            count: numQuestions,
            questionType,
            bloomLevel,
            instituteName,
            quizTitle
        });
    };

    const updateQuestion = (index: number, field: string, value: any) => {
        const newQuestions = [...questions];
        newQuestions[index] = { ...newQuestions[index], [field]: value };
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, optIndex: number, value: string) => {
        const newQuestions = [...questions];
        const newOptions = [...newQuestions[qIndex].options];
        const oldValue = newOptions[optIndex];

        // Sync correct answer if it matches the edited option
        if (newQuestions[qIndex].correctAnswer === oldValue) {
            newQuestions[qIndex].correctAnswer = value;
        }

        newOptions[optIndex] = value;
        newQuestions[qIndex].options = newOptions;
        setQuestions(newQuestions);
    };

    const removeQuestion = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    // 1. Play Mode (KBC)
    if (showPreview) {
        return <QuizPreview questions={questions} topic={topicId || 'General Knowledge'} onClose={() => setShowPreview(false)} />;
    }

    // 2. Quiz Generated - Selection Screen (New)
    if (questions.length > 0 && !isReviewMode) {
        return (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Button variant="ghost" onClick={() => setQuestions([])} className="pl-0 text-slate-500">
                    ← Create New Quiz
                </Button>

                <div className="text-center space-y-4 mb-12">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl sm:text-4xl font-black font-display text-slate-900">Quiz Generated Successfully!</h2>
                    <p className="text-base sm:text-xl text-slate-500 max-w-2xl mx-auto px-4">
                        Your AI quiz on <span className="font-bold text-indigo-600">{topicId}</span> is ready.
                        How would you like to proceed?
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card
                        className="group hover:ring-2 hover:ring-indigo-600 cursor-pointer transition-all hover:shadow-xl border-dashed border-2 border-slate-200"
                        onClick={() => setIsReviewMode(true)}
                    >
                        <CardContent className="p-4 sm:p-8 flex flex-col items-center text-center h-full justify-center space-y-4">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                <Textarea className="w-8 h-8 text-slate-500 group-hover:text-indigo-600 border-none shadow-none pointer-events-none" />
                                {/* Using icon abstractly */}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Review & Edit</h3>
                                <p className="text-slate-500 mt-2">Check questions, edit options, or add custom questions layout.</p>
                            </div>
                            <Button variant="outline" className="w-full mt-4 font-bold border-slate-200">
                                Open Editor
                            </Button>
                        </CardContent>
                    </Card>

                    <Card
                        className="group bg-gradient-to-br from-indigo-600 to-violet-700 text-white cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.02] border-none relative overflow-hidden"
                        onClick={() => setShowPreview(true)}
                    >
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                        <CardContent className="p-4 sm:p-8 flex flex-col items-center text-center h-full justify-center space-y-4 relative z-10">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                <Sparkles className="w-8 h-8 text-yellow-300" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Play Quiz (Student View)</h3>
                                <p className="text-indigo-100 mt-2">Experience the quiz in KBC style with timer, lifelines and result analysis.</p>
                            </div>
                            <Button className="w-full mt-4 font-bold bg-white text-indigo-600 hover:bg-slate-100 shadow-lg">
                                Start Quiz 🚀
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    // 3. Initial Form (No Questions)
    if (questions.length === 0) {
        return (
            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-display">MCQ Quiz Generator</h2>
                    <p className="text-slate-500 font-medium">Create interactive assessments in seconds</p>
                </div>

                <Card className="border-none shadow-sm bg-white p-4 sm:p-8">
                    <div className="space-y-6 max-w-2xl mx-auto">
                        {/* Institute Name */}
                        <div className="space-y-2">
                            <Label>Enter the Name of Institute:</Label>
                            <Input
                                placeholder="e.g. Deccan Institute"
                                value={instituteName}
                                onChange={(e) => setInstituteName(e.target.value)}
                                className="h-12"
                            />
                        </div>

                        {/* Quiz Title */}
                        <div className="space-y-2">
                            <Label>Enter the quiz title:</Label>
                            <Input
                                placeholder="e.g. Introduction to Algebra"
                                value={quizTitle}
                                onChange={(e) => setQuizTitle(e.target.value)}
                                className="h-12"
                            />
                        </div>

                        {/* Curriculum */}
                        <div className="space-y-2">
                            <Label>Select the curriculum:</Label>
                            <Select value={selectedCurriculum} onValueChange={setSelectedCurriculum}>
                                <SelectTrigger className="h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {["CBSE", "ICSE", "SSC"].map(b => (
                                        <SelectItem key={b} value={b}>{b}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Grade Level */}
                        <div className="space-y-2">
                            <Label>Select the grade/class:</Label>
                            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
                                <SelectTrigger className="h-12">
                                    <SelectValue placeholder="Select Class" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 12 }, (_, i) => (i + 1).toString()).map(g => (
                                        <SelectItem key={g} value={g}>Class {g}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Topic Name */}
                        <div className="space-y-2">
                            <Label>Enter the topic:</Label>
                            <Input
                                placeholder="e.g. Photosynthesis"
                                value={topicId}
                                onChange={(e) => setTopicId(e.target.value)}
                                className="h-12"
                            />
                        </div>

                        {/* Difficulty Level */}
                        <div className="space-y-2">
                            <Label>Select the difficulty level:</Label>
                            <Select value={difficultyLevel} onValueChange={setDifficultyLevel}>
                                <SelectTrigger className="h-12">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Beginner">Beginner</SelectItem>
                                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                                    <SelectItem value="Advanced">Advanced</SelectItem>
                                    <SelectItem value="Mixed">Mixed</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Number of Questions */}
                        <div className="space-y-2">
                            <Label>Enter the number of questions:</Label>
                            <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setNumQuestions(prev => Math.max(1, prev - 1))}
                                    className="h-10 w-10 shrink-0"
                                >
                                    <span className="text-xl font-bold">-</span>
                                </Button>
                                <div className="flex-1 text-center font-bold text-lg bg-white h-10 flex items-center justify-center rounded-lg border border-slate-100">
                                    {numQuestions}
                                </div>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => setNumQuestions(prev => Math.min(20, prev + 1))}
                                    className="h-10 w-10 shrink-0"
                                >
                                    <span className="text-xl font-bold">+</span>
                                </Button>
                            </div>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={generateMutation.isPending}
                            className="h-14 bg-[#4F46E5] hover:bg-[#4338CA] font-bold rounded-xl w-full text-lg shadow-lg shadow-indigo-500/20 mt-4"
                        >
                            {generateMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                            Generate Quiz
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // 4. Editor / Review Mode (Fallthrough)
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => setIsReviewMode(false)} className="pl-0 text-slate-500">
                    ← Back to Options
                </Button>
            </div>

            {questions.length > 0 && (
                <div className="space-y-6">
                    <div className="flex flex-col gap-4">
                        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-lg text-blue-600 shrink-0">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-blue-900 text-sm">Review & Edit Mode</h4>
                                <p className="text-blue-700 text-sm mt-1">
                                    You are currently editing the quiz. To verify the student experience, click "Play Quiz".
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <h3 className="text-xl font-bold text-slate-800">Generated Questions (Editor)</h3>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                                <Button
                                    className="font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 text-xs sm:text-sm h-9 sm:h-10"
                                    onClick={() => setShowPreview(true)}
                                >
                                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                                    Play Quiz
                                </Button>
                                <Button
                                    onClick={() => saveMutation.mutate({ title: "New Quiz", topicId, questions })}
                                    className="bg-emerald-600 hover:bg-emerald-700 font-bold text-xs sm:text-sm h-9 sm:h-10"
                                    disabled={saveMutation.isPending}
                                >
                                    {saveMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />}
                                    Save
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {questions.map((q, idx) => (
                            <Card key={idx} className="border border-slate-100 shadow-none hover:border-indigo-100 transition-colors group relative">
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" onClick={() => removeQuestion(idx)} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                <CardContent className="p-6 space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question {idx + 1} ({q.type || 'MCQ'} - {q.bloomLevel || 'General'})</Label>
                                        <Textarea
                                            value={q.question}
                                            onChange={(e) => updateQuestion(idx, 'question', e.target.value)}
                                            className="font-bold text-slate-900 border-none shadow-none focus-visible:ring-0 p-0 resize-none min-h-[60px] text-lg"
                                            placeholder="Enter question text..."
                                        />
                                    </div>

                                    {(q.type === 'MCQ' || !q.type) && q.options && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {q.options.map((opt: string, i: number) => (
                                                <div
                                                    key={i}
                                                    className="relative"
                                                >
                                                    <Input
                                                        value={opt}
                                                        onChange={(e) => updateOption(idx, i, e.target.value)}
                                                        className={`h-10 ${opt === q.correctAnswer ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'bg-slate-50 border-slate-200'}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* For non-MCQ, maybe show the model answer if available to edit, or just hide options */}
                                    {q.type !== 'MCQ' && (
                                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                                            <Label className="text-xs text-slate-400 mb-1 block">Model Answer / Key Points</Label>
                                            <Input
                                                value={q.correctAnswer || ""}
                                                onChange={(e) => updateQuestion(idx, 'correctAnswer', e.target.value)}
                                                className="bg-transparent border-none shadow-none p-0 h-auto focus-visible:ring-0 text-slate-600"
                                                placeholder="Enter correct answer..."
                                            />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function QuizPreview({ questions, topic, onClose }: { questions: any[], topic: string, onClose: () => void }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);

    // Game State
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isLocked, setIsLocked] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [timeLeft, setTimeLeft] = useState(30);

    // Lifelines State
    const [fiftyFiftyUsed, setFiftyFiftyUsed] = useState(false); // Global usage for 50:50
    const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
    const [hintText, setHintText] = useState(""); // Presence of text implies hint used for *curr* question

    // AI Suggestions State
    const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
    const topRef = useRef<HTMLDivElement>(null);

    const currentQuestion = questions[currentIndex];
    const isLastQuestion = currentIndex === questions.length - 1;

    // Timer Logic
    useEffect(() => {
        if (showResult || isLocked) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleTimeUp();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentIndex, showResult, isLocked]);

    // Reset state on new question
    useEffect(() => {
        setIsLocked(false);
        setShowFeedback(false);
        setSelectedOption(null);
        setTimeLeft(30);
        setHiddenOptions([]);
        setHintText(""); // Reset hint for new question
        topRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [currentIndex]);

    const handleTimeUp = () => {
        setIsLocked(true);
        setShowFeedback(true);
        // Auto advance after short delay
        setTimeout(() => nextQuestion(), 2000);
    };

    const handleOptionSelect = (option: string) => {
        if (isLocked) return;
        setSelectedOption(option);
    };

    const submitAnswer = () => {
        if (!selectedOption || isLocked) return;

        setIsLocked(true);

        // Simulate "Is that your final answer?" moment
        setTimeout(() => {
            const isCorrect = selectedOption === currentQuestion.correctAnswer;
            if (isCorrect) setScore(prev => prev + 1);
            setUserAnswers(prev => ({ ...prev, [currentIndex]: selectedOption }));
            setShowFeedback(true);

            // Auto advance
            setTimeout(() => nextQuestion(), 2500);
        }, 1000);
    };

    const nextQuestion = () => {
        if (isLastQuestion) {
            generateAISuggestions();
            setShowResult(true);
        } else {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const useFiftyFifty = () => {
        if (fiftyFiftyUsed || isLocked) return;

        const correctIndex = currentQuestion.options.findIndex((opt: string) => opt === currentQuestion.correctAnswer);
        const wrongIndices = currentQuestion.options
            .map((_: string, idx: number) => idx)
            .filter((idx: number) => idx !== correctIndex);

        // Shuffle and take 2 wrong indices to hide
        const shuffled = wrongIndices.sort(() => 0.5 - Math.random());
        const toHide = shuffled.slice(0, 2);

        setHiddenOptions(toHide);
        setFiftyFiftyUsed(true); // Mark as used globally
    };

    const useHint = () => {
        if (hintText || isLocked) return;

        // Generate a more subtle hint without giving away the answer directly
        const answer = currentQuestion.correctAnswer;
        const options = currentQuestion.options;
        const correctIndex = options.indexOf(answer);

        // Strategy: Provide a hint by eliminating a clearly wrong answer, or giving a generic nudge.
        // Since we don't have real AI context here, we will simulate a "Teacher's Nudge".

        // Find a wrong option to eliminate
        const wrongOptions = options.filter((opt: string) => opt !== answer);
        const randomWrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];

        const hints = [
            `Tip: It is definitely NOT "${randomWrong}".`,
            "Hint: Read the question carefully and look for keywords that match the answer.",
            "Think: Recall the core concept of this topic. The answer is related to its primary function.",
            `Clue: The answer is ${answer.length > 15 ? 'one of the longer options' : 'short and precise'}.`
        ];

        // Pick a random hint strategy
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        setHintText(randomHint);
    };

    const generateAISuggestions = () => {
        const suggestions = [];
        const percentage = (score / questions.length) * 100;

        if (percentage >= 80) {
            suggestions.push(`Excellent mastery of ${topic}! You answered ${score}/${questions.length} correctly.`);
            suggestions.push("Strengths: Consistent performance across all difficulty levels.");
            suggestions.push("Recommendation: Attempt 'Advanced' quizzes or explore related complex topics.");
        } else if (percentage >= 50) {
            suggestions.push(`Good foundation in ${topic}. Score: ${score}/${questions.length}.`);
            suggestions.push("Weaknesses: Missed some application-based questions.");
            suggestions.push(`Tip: Review the concepts of '${topic}' specifically Chapter 4 & 5.`);
        } else {
            suggestions.push(`Needs improvement in ${topic}. Score: ${score}/${questions.length}.`);
            suggestions.push("Weaknesses: Fundamental concepts seem unclear.");
            suggestions.push("Action Plan: Re-read the core textbook chapter and try 'Beginner' mode again.");
        }

        setAiSuggestions(suggestions);
    };

    if (showResult) {
        return (
            <div ref={topRef} className="max-w-4xl mx-auto pb-20 animate-in fade-in zoom-in-50 duration-500">
                <Card className="bg-[#547792] text-white border-none shadow-2xl overflow-hidden relative min-h-[600px] flex flex-col justify-center">
                    {/* Background Decoration */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl opacity-50"></div>

                    <CardContent className="p-6 sm:p-12 text-center relative z-10">
                        <div className="mb-8">
                            <h2 className="text-3xl sm:text-4xl font-black font-display mb-2 tracking-tight">QUIZ RESULT</h2>
                            <p className="text-slate-400 text-sm sm:text-lg uppercase tracking-widest font-bold">Performance Summary</p>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
                            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm text-center">
                                <div className="text-slate-400 font-bold mb-2 text-[10px] sm:text-xs">SCORE</div>
                                <div className="text-3xl sm:text-5xl font-black text-yellow-400">{score} / {questions.length}</div>
                            </div>
                            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm text-center">
                                <div className="text-slate-400 font-bold mb-2 text-[10px] sm:text-xs">ACCURACY</div>
                                <div className="text-3xl sm:text-5xl font-black text-emerald-400">{Math.round((score / questions.length) * 100)}%</div>
                            </div>
                            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm text-center">
                                <div className="text-slate-400 font-bold mb-2 text-[10px] sm:text-xs">GRADE</div>
                                <div className="text-3xl sm:text-5xl font-black text-indigo-400">
                                    {(score / questions.length) >= 0.8 ? 'A' : (score / questions.length) >= 0.5 ? 'B' : 'C'}
                                </div>
                            </div>
                            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-6 backdrop-blur-sm relative overflow-hidden group text-center">
                                <div className="text-slate-400 font-bold mb-2 text-[10px] sm:text-xs">MASTERY</div>
                                <div className="text-xl sm:text-3xl font-black text-cyan-400 uppercase tracking-tighter">
                                    {(score / questions.length) >= 0.9 ? 'Master' :
                                        (score / questions.length) >= 0.7 ? 'Advanced' :
                                            (score / questions.length) >= 0.5 ? 'Proficient' :
                                                (score / questions.length) >= 0.3 ? 'Learner' : 'Novice'}
                                </div>
                                <div className="flex gap-1 mt-3 justify-center">
                                    {[1, 2, 3, 4, 5].map((lvl) => {
                                        const threshold = [0, 0.3, 0.5, 0.7, 0.9][lvl - 1];
                                        const isActive = (score / questions.length) >= threshold;
                                        return (
                                            <div
                                                key={lvl}
                                                className={`h-2 w-full rounded-full transition-all duration-500 ${isActive
                                                    ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]'
                                                    : 'bg-white/10'
                                                    }`}
                                                style={{ transitionDelay: `${lvl * 100}ms` }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* AI Suggestions Box */}
                        <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-8 mb-10 text-left relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-400 to-cyan-400"></div>
                            <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-6">
                                <Sparkles className="w-6 h-6 text-yellow-400" />
                                AI Personalized Analysis
                            </h3>
                            <ul className="space-y-4">
                                {aiSuggestions.map((suggestion, idx) => (
                                    <li key={idx} className="flex items-start gap-4 text-indigo-100 text-lg">
                                        <div className="w-2 h-2 rounded-full bg-cyan-400 mt-2.5 shrink-0 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />
                                        <span>{suggestion}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex flex-wrap justify-center gap-4">
                            <Button
                                onClick={() => {
                                    // Reset Game
                                    setCurrentIndex(0);
                                    setUserAnswers({});
                                    setScore(0);
                                    setFiftyFiftyUsed(false);
                                    setShowResult(false);
                                }}
                                size="lg"
                                className="bg-[#FFB800] hover:bg-[#E6A600] text-slate-900 font-bold px-8 h-12 text-lg shadow-lg shadow-amber-500/20"
                            >
                                Retry Quiz
                            </Button>
                            <Button
                                onClick={onClose}
                                variant="outline"
                                size="lg"
                                className="border-white/20 text-white hover:bg-white/10 font-bold px-8 h-12 text-lg bg-transparent"
                            >
                                Exit
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div ref={topRef} className="max-w-5xl mx-auto pb-20 space-y-6 min-h-[600px] flex flex-col">
            {/* Game Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-[#547792] text-white p-4 rounded-2xl shadow-lg border border-white/10 gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-white/10 p-2 h-auto rounded-full">
                        ← Exit
                    </Button>
                    <div>
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Topic</div>
                        <div className="font-bold text-indigo-300">{topic}</div>
                    </div>
                </div>

                {/* Progress & Score */}
                <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-8 border-t border-white/10 sm:border-none pt-2 sm:pt-0">
                    <div className="text-center">
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Question</div>
                        <div className="font-mono text-2xl font-bold">{currentIndex + 1}<span className="text-slate-500 text-lg">/{questions.length}</span></div>
                    </div>
                    <div className="text-center">
                        <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Score</div>
                        <div className="font-mono text-2xl font-bold text-yellow-400">{score}</div>
                    </div>
                </div>
            </div>

            {/* Timer Bar */}
            <div className="h-6 bg-slate-200 rounded-full overflow-hidden relative shadow-inner">
                <div
                    className={`h-full transition-all duration-1000 ease-linear ${timeLeft < 10 ? 'bg-red-500' : 'bg-indigo-600'}`}
                    style={{ width: `${(timeLeft / 30) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-white drop-shadow-md">
                    {timeLeft}s
                </div>
            </div>

            {/* Question Area */}
            <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-8 duration-500">
                <Card className="border-none shadow-xl overflow-hidden bg-white ring-1 ring-slate-200 mb-6">
                    <CardContent className="p-6 sm:p-10 md:p-12 text-center">
                        <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 leading-snug">
                            {currentQuestion.question}
                        </h3>
                    </CardContent>
                </Card>

                {/* AI Hint Visualization (New Placement) */}
                {hintText && (
                    <div className="mb-6 animate-in zoom-in-95 slide-in-from-bottom-2 fade-in duration-300">
                        <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl border-2 border-indigo-400/50 flex items-center gap-4 relative overflow-hidden mx-auto max-w-2xl">
                            {/* Animated Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 opacity-20 animate-pulse"></div>

                            <div className="bg-white/20 p-2.5 rounded-xl shrink-0 backdrop-blur-sm border border-white/10 relative z-10">
                                <Sparkles className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                            </div>
                            <div className="relative z-10 flex-1">
                                <h4 className="font-bold text-indigo-100 text-xs uppercase tracking-wider mb-0.5">AI Teacher Hint</h4>
                                <p className="text-lg font-bold leading-tight text-white shadow-black drop-shadow-sm">{hintText}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-indigo-200 hover:text-white hover:bg-white/10 relative z-10 h-8 w-8 rounded-full"
                                onClick={() => setHintText("")}
                            >
                                <span className="sr-only">Dismiss</span>
                                <div className="text-xl leading-none">×</div>
                            </Button>
                        </div>
                        {/* Triangle Pointer */}
                        <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-indigo-600 mx-auto -mt-[1px] opacity-90"></div>
                    </div>
                )}

                {/* Options Grid (2x2) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentQuestion.options?.map((opt: string, i: number) => {
                        if (hiddenOptions.includes(i)) {
                            return <div key={i} className="invisible" />; // Maintain grid layout
                        }

                        const isSelected = selectedOption === opt;
                        const isCorrect = opt === currentQuestion.correctAnswer;
                        const label = String.fromCharCode(65 + i); // A, B, C, D

                        // Determine Styling based on state
                        let containerClass = "bg-white border-2 border-slate-200 hover:border-indigo-400 hover:bg-slate-50";
                        let badgeClass = "bg-slate-100 text-slate-500";

                        if (isLocked) {
                            if (showFeedback) {
                                if (isCorrect) {
                                    containerClass = "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-[1.02]";
                                    badgeClass = "bg-white/20 text-white";
                                } else if (isSelected) {
                                    containerClass = "bg-red-500 border-red-600 text-white shadow-lg shadow-red-500/30";
                                    badgeClass = "bg-white/20 text-white";
                                } else {
                                    containerClass = "bg-white border-slate-200 opacity-50";
                                }
                            } else {
                                // Locked but waiting for feedback (Yellow state)
                                if (isSelected) {
                                    containerClass = "bg-amber-400 border-amber-500 text-white shadow-lg shadow-amber-500/30 scale-[1.02]";
                                    badgeClass = "bg-white/20 text-white";
                                } else {
                                    containerClass = "bg-white border-slate-200 opacity-50";
                                }
                            }
                        } else if (isSelected) {
                            containerClass = "bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500";
                            badgeClass = "bg-indigo-100 text-indigo-700";
                        }

                        return (
                            <button
                                key={i}
                                disabled={isLocked}
                                onClick={() => handleOptionSelect(opt)}
                                className={`group relative w-full text-left p-4 sm:p-6 rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 flex items-center gap-3 sm:gap-4 ${containerClass}`}
                            >
                                {/* Option Label Badge (A, B, C, D) */}
                                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-xs sm:text-sm font-black shrink-0 transition-colors ${badgeClass}`}>
                                    {label}
                                </div>
                                <span className="leading-snug text-sm sm:text-base">{opt}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Footer / Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
                {/* Lifelines */}
                <div className="flex gap-3">
                    <Button
                        disabled={fiftyFiftyUsed || isLocked}
                        onClick={useFiftyFifty}
                        variant="outline"
                        className={`h-12 border-slate-200 font-bold ${fiftyFiftyUsed ? 'opacity-50 grayscale' : 'hover:border-indigo-300 hover:bg-indigo-50 text-indigo-600'}`}
                    >
                        50:50 ({fiftyFiftyUsed ? 0 : 1})
                    </Button>
                    <Button
                        disabled={!!hintText || isLocked}
                        onClick={useHint}
                        variant="outline"
                        className={`h-12 border-slate-200 font-bold ${!!hintText ? 'opacity-50 grayscale' : 'hover:border-indigo-300 hover:bg-indigo-50 text-indigo-600'}`}
                    >
                        💡 Hint
                    </Button>
                </div>

                {/* Submit Button - Only show if option selected and not locked */}
                {!isLocked && selectedOption && (
                    <Button
                        onClick={submitAnswer}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-indigo-600/20 animate-in zoom-in"
                    >
                        Lock Answer🔒
                    </Button>
                )}

                {/* Feedback Message */}
                {showFeedback && (
                    <div className="animate-in fade-in slide-in-from-bottom-2 font-bold text-lg text-slate-500">
                        {userAnswers[currentIndex] === currentQuestion.correctAnswer ? (
                            <span className="text-emerald-600">Correct! 🎉</span>
                        ) : (
                            <span className="text-red-500">Wrong Answer ❌</span>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
