import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    ChevronRight,
    Timer,
    AlertCircle,
    Flag,
    Home,
    X,
    Trophy,
    RefreshCcw,
    XCircle,
    Sparkles,
    CheckCircle2,
    Info,
    ArrowLeft,
    Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import api from "@/api/client";

export default function QuizPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState<any>(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft] = useState(600); // 10 minutes default
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isReviewMode, setIsReviewMode] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                // Fetch directly by ID for efficiency and reliability
                const res = await api.get(`/lessons/${id}`);
                const found = res.data;
                if (found) {
                    // Parse questions if they are stored as string
                    const questions = typeof found.questions === 'string' ? JSON.parse(found.questions) : found.questions;
                    const totalMarks = found.totalMarks || (questions?.length || 0);
                    setQuiz({ ...found, questions, totalMarks });
                } else {
                    toast.error("Quiz not found");
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load quiz");
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    useEffect(() => {
        if (timeLeft > 0 && !isSubmitted && !isLoading) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        } else if (timeLeft === 0 && !isSubmitted) {
            handleSubmit();
        }
    }, [timeLeft, isSubmitted, isLoading]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleOptionSelect = (option: string) => {
        if (isSubmitted) return;
        setUserAnswers(prev => ({
            ...prev,
            [currentQuestionIndex]: option
        }));
    };

    const calculateResults = () => {
        if (!quiz || !quiz.questions) return { correct: 0, wrong: 0, skipped: 0, total: 0, level: 'Beginner', xp: 0 };

        let correct = 0;
        let wrong = 0;
        let skipped = 0;

        quiz.questions.forEach((q: any, i: number) => {
            if (userAnswers[i] === undefined) {
                skipped++;
            } else if (userAnswers[i] === q.correctAnswer) {
                correct++;
            } else {
                wrong++;
            }
        });

        const percentage = Math.round((correct / quiz.questions.length) * 100);

        let level = "Beginner";
        if (percentage > 90) level = "Expert 🏆";
        else if (percentage >= 75) level = "Advanced 🚀";
        else if (percentage >= 50) level = "Intermediate 📈";

        // Motivation Points: 20 XP per correct, 50 bonus for completion
        const xp = (correct * 20) + 50;

        return {
            correct,
            wrong,
            skipped,
            total: quiz.questions.length,
            percentage,
            level,
            xp
        };
    };

    const handleSubmit = () => {
        if (isSubmitted) return;
        setIsSubmitted(true);
        toast.success("Quiz completed!");
    };

    const handleRestart = () => {
        setUserAnswers({});
        setCurrentQuestionIndex(0);
        setIsSubmitted(false);
        setIsReviewMode(false);
        setTimeLeft(600);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#6b5ea7] border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-bold animate-pulse">Loading Quiz Questions...</p>
                </div>
            </div>
        );
    }

    if (!quiz || !quiz.questions) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center border border-slate-100">
                    <AlertCircle className="w-16 h-16 text-rose-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Quiz Not Found</h2>
                    <p className="text-slate-500 mb-6">The quiz you are looking for does not exist or has been removed.</p>
                    <Button onClick={() => navigate('/dashboard')} className="w-full h-12 rounded-xl bg-[#6b5ea7] font-bold">
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    const currentQuestion = quiz.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
    const results = calculateResults();

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
            {/* Sticky Top Bar */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 transition-all">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/dashboard')}
                            className="rounded-xl hover:bg-slate-100"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </Button>
                        <div className="hidden sm:block">
                            <h1 className="text-lg font-black text-slate-900 leading-none mb-1">{quiz.title}</h1>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{quiz.subjectName || 'General Knowledge'}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-6 bg-purple-50 px-4 py-2 rounded-2xl border border-purple-100 shadow-sm">
                        <Timer className="w-5 h-5 text-[#6b5ea7] animate-pulse" />
                        <span className={`font-mono text-xl font-black tracking-tighter ${timeLeft < 60 ? 'text-rose-500' : 'text-[#6b5ea7]'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitted}
                        className="rounded-xl h-10 sm:h-12 px-3 sm:px-6 font-bold bg-[#6b5ea7] hover:bg-[#6b5ea7] text-white shadow-lg shadow-purple-100 transition-all text-xs sm:text-base"
                    >
                        Submit <span className="hidden sm:inline">Quiz</span>
                    </Button>
                </div>
                <div className="h-1 w-full bg-slate-100">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-[#6b5ea7] shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                    />
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 md:p-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={isSubmitted ? 'results' : currentQuestionIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                        className="w-full max-w-4xl"
                    >
                        {isSubmitted && !isReviewMode ? (
                            <div className="bg-white rounded-[2.5rem] p-10 sm:p-14 shadow-2xl shadow-purple-100/50 border border-slate-100 text-center relative overflow-hidden">
                                {/* Celebratory Background Element */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-50 rounded-full opacity-50 blur-3xl pointer-events-none" />

                                <div className="relative z-10 flex flex-col items-center">
                                    <div className="w-24 h-24 bg-[#0D5355] rounded-3xl flex items-center justify-center text-white mb-8 shadow-xl shadow-teal-200 rotate-3 transition-transform hover:rotate-0">
                                        <Trophy className="w-12 h-12" />
                                    </div>

                                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-2 leading-tight">Quiz Summary</h2>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-8 sm:mb-10 px-4">
                                        {results.percentage >= 90 ? "Awesome! You're a true subject master! 🌟" :
                                            results.percentage >= 75 ? "Great work! You're racing ahead! 🚀" :
                                                results.percentage >= 50 ? "Good effort! Solid progress being made! 📈" :
                                                    "Work Hard! Every attempt counts towards mastery! 💪"}
                                    </p>

                                    {/* Main Stats Header */}
                                    <div className="flex flex-col lg:flex-row gap-6 w-full mb-8">
                                        {/* Box 1: Motivation Points - Custom #BCD9A2 */}
                                        <div className="flex-1 bg-[#BCD9A2] p-8 rounded-[2.5rem] text-slate-800 shadow-2xl shadow-slate-200/50 flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500 hover:shadow-slate-300/60">
                                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                                                <Sparkles className="w-24 h-24 text-slate-700" />
                                            </div>

                                            <div className="absolute top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white/40 backdrop-blur-md rounded-full border border-white/30 text-[10px] font-black uppercase tracking-widest z-20 whitespace-nowrap text-slate-700">
                                                {results.percentage >= 40 ? "Points Gained!" : "Starting Out!"}
                                            </div>

                                            <div className="pt-6 flex flex-col items-center">
                                                <p className="text-slate-700 text-[11px] font-black uppercase tracking-[0.2em] mb-2 relative z-10 opacity-70">Motivation Points</p>
                                                <div className="flex items-baseline gap-2 relative z-10">
                                                    <span className="text-7xl font-black tabular-nums text-slate-900">{results.xp}</span>
                                                    <span className="text-2xl font-black opacity-70 uppercase tracking-tighter text-slate-700">XP</span>
                                                </div>
                                                <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-2 relative z-10">Points Earned!</p>
                                            </div>
                                        </div>

                                        {/* Box 2: Teacher's Praise - Custom #6D9E51 */}
                                        <div className="flex-1 bg-[#6D9E51] p-8 rounded-[2.5rem] text-white shadow-2xl shadow-slate-200/50 flex flex-col items-center justify-center relative overflow-hidden group transition-all duration-500 hover:shadow-slate-300/60">
                                            <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:scale-125 transition-transform duration-700">
                                                <Trophy className="w-24 h-24 text-white" />
                                            </div>
                                            <p className="text-white/80 text-xs font-black uppercase tracking-widest mb-3 relative z-10">Teacher's Praise</p>
                                            <div className="text-center relative z-10">
                                                <p className="text-4xl font-black leading-tight drop-shadow-md text-white">
                                                    {results.percentage >= 90 ? "AWESOME! 🌟" :
                                                        results.percentage >= 75 ? "GREAT! 🚀" :
                                                            results.percentage >= 50 ? "GOOD JOB! 📈" :
                                                                "WORK HARD! 💪"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Box 3: Student Proficiency - Custom #E8F5BD */}
                                        <div className="flex-1 bg-[#E8F5BD] p-8 rounded-[2.5rem] text-slate-800 shadow-2xl shadow-slate-200/50 flex flex-col items-center justify-center group transition-all duration-500 hover:shadow-slate-300/60 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-4 opacity-15 group-hover:scale-125 transition-transform duration-700">
                                                <Target className="w-24 h-24 text-slate-700" />
                                            </div>
                                            <p className="text-slate-600 text-xs font-black uppercase tracking-widest mb-3 relative z-10">Student Proficiency</p>
                                            <p className="text-4xl font-black relative z-10 drop-shadow-sm text-slate-900">{results.level}</p>
                                            <div className="mt-4 flex gap-1.5 relative z-10 bg-slate-900/10 p-2 rounded-full backdrop-blur-sm">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <div key={s} className={`w-2 h-2 rounded-full transition-all duration-500 ${s <= (results.percentage / 20) ? 'bg-slate-800 scale-110' : 'bg-slate-400/30'}`} />
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detailed Stats Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 w-full mb-10 sm:mb-12">
                                        <div className="bg-slate-50 border border-slate-100 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                                            <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider mb-1 sm:mb-2 text-center">Accuracy</p>
                                            <p className="text-2xl sm:text-3xl font-black text-slate-800 text-center">{results.percentage}%</p>
                                        </div>
                                        <div className="bg-emerald-50 border border-emerald-100 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                                            <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider mb-1 sm:mb-2 text-center">Correct</p>
                                            <p className="text-2xl sm:text-3xl font-black text-emerald-600 text-center">{results.correct}</p>
                                        </div>
                                        <div className="bg-rose-50 border border-rose-100 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                                            <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider mb-1 sm:mb-2 text-center">Wrong</p>
                                            <p className="text-2xl sm:text-3xl font-black text-rose-600 text-center">{results.wrong}</p>
                                        </div>
                                        <div className="bg-slate-50 border border-slate-100 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                                            <p className="text-slate-500 text-[9px] sm:text-[10px] font-black uppercase tracking-wider mb-1 sm:mb-2 text-center">Skipped</p>
                                            <p className="text-2xl sm:text-3xl font-black text-slate-600 text-center">{results.skipped}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 w-full mb-6">
                                        <Button
                                            onClick={() => setIsReviewMode(true)}
                                            className="h-14 sm:h-16 flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base sm:text-lg shadow-xl shadow-emerald-100 transition-all flex items-center justify-center gap-3"
                                        >
                                            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" /> Review Answers
                                        </Button>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 w-full">
                                        <Button
                                            onClick={handleRestart}
                                            className="h-16 flex-1 rounded-2xl bg-white border-2 border-[#6b5ea7] text-[#6b5ea7] hover:bg-purple-50 font-black text-lg shadow-sm transition-all flex items-center justify-center gap-3"
                                        >
                                            <RefreshCcw className="w-6 h-6" /> Restart Quiz
                                        </Button>
                                        <Button
                                            onClick={() => navigate('/dashboard')}
                                            className="h-16 flex-1 rounded-2xl bg-[#0D5355] hover:bg-[#083334] text-white font-black text-lg shadow-xl shadow-teal-100 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Home className="w-6 h-6" /> Dashboard
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : isReviewMode ? (
                            <div className="bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-purple-100/50 border border-slate-100 relative max-h-[80vh] flex flex-col">
                                <div className="flex items-center justify-between mb-8 shrink-0">
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setIsReviewMode(false)}
                                            className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-[#6b5ea7] hover:bg-purple-50 transition-all"
                                        >
                                            <ArrowLeft className="w-6 h-6" />
                                        </button>
                                        <div>
                                            <h2 className="text-2xl font-black text-slate-900 leading-tight">Review Answers</h2>
                                            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Learn from your results</p>
                                        </div>
                                    </div>
                                    <div className="bg-[#6b5ea7] px-4 py-2 rounded-xl text-white font-black text-sm">
                                        {results.correct} / {results.total} Correct
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar space-y-8 pb-4">
                                    {quiz.questions.map((q: any, i: number) => {
                                        const isUserCorrect = userAnswers[i] === q.correctAnswer;
                                        const userAns = userAnswers[i];

                                        return (
                                            <div key={i} className={`p-6 rounded-3xl border-2 transition-all ${isUserCorrect ? 'border-emerald-100 bg-emerald-50/30' : 'border-rose-100 bg-rose-50/30'}`}>
                                                <div className="flex items-start gap-4 mb-4">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-sm ${isUserCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                                        {i + 1}
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 pt-1">{q.question}</h3>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                                    {q.options.map((opt: string, optIdx: number) => {
                                                        const isCorrect = opt.trim() === q.correctAnswer?.trim() ||
                                                            (q.correctAnswer?.toString().length === 1 && (opt.startsWith(q.correctAnswer + ")") || opt.startsWith(q.correctAnswer + ".")));
                                                        const isSelected = opt === userAns;

                                                        let bgColor = "bg-white border-slate-100";
                                                        let textColor = "text-slate-600";
                                                        let borderColor = "border-slate-100";

                                                        if (isCorrect) {
                                                            bgColor = "bg-emerald-100 border-emerald-200";
                                                            textColor = "text-emerald-700";
                                                            borderColor = "border-emerald-200";
                                                        } else if (isSelected && !isCorrect) {
                                                            bgColor = "bg-rose-100 border-rose-200";
                                                            textColor = "text-rose-700";
                                                            borderColor = "border-rose-200";
                                                        }

                                                        return (
                                                            <div
                                                                key={optIdx}
                                                                className={`p-4 rounded-2xl border-2 ${bgColor} ${borderColor} flex items-center justify-between group transition-all`}
                                                            >
                                                                <span className={`font-bold text-sm ${textColor}`}>{opt}</span>
                                                                {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                                                                {isSelected && !isCorrect && <XCircle className="w-4 h-4 text-rose-600" />}
                                                            </div>
                                                        );
                                                    })}
                                                </div>

                                                <div className="bg-white/60 rounded-2xl p-4 border border-slate-100 flex gap-3">
                                                    <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center shrink-0">
                                                        <Info className="w-4 h-4 text-[#6b5ea7]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#6b5ea7] mb-1">Explanation</p>
                                                        <p className="text-sm font-medium text-purple-900/80 leading-relaxed italic">
                                                            {q.explanation || "No detailed explanation available for this older quiz. Try generating a new quiz to see full answer explanations!"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            /* Question Card */
                            <div className="bg-white rounded-[1.5rem] sm:rounded-[2rem] p-5 sm:p-12 shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
                                <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                                    <span className="text-[10px] sm:text-xs font-black text-[#6b5ea7] bg-purple-50 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full border border-purple-100 uppercase tracking-widest">
                                        {currentQuestionIndex + 1} / {quiz.questions.length}
                                    </span>
                                </div>

                                <div className="mt-8 sm:mt-4">
                                    <h2 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight mb-8 sm:mb-10 pr-12 sm:pr-0">
                                        {currentQuestion.question}
                                    </h2>

                                    <div className="grid gap-4">
                                        {currentQuestion.options.map((option: string, index: number) => {
                                            const isSelected = userAnswers[currentQuestionIndex] === option;
                                            const isCorrect = isSubmitted && option === currentQuestion.correctAnswer;
                                            const isWrong = isSubmitted && isSelected && option !== currentQuestion.correctAnswer;

                                            return (
                                                <motion.button
                                                    key={index}
                                                    whileHover={!isSubmitted ? { scale: 1.01, transition: { duration: 0.2 } } : {}}
                                                    whileTap={!isSubmitted ? { scale: 0.99 } : {}}
                                                    onClick={() => handleOptionSelect(option)}
                                                    disabled={isSubmitted}
                                                    className={`
                                                        group relative w-full p-5 sm:p-6 rounded-2xl border-2 text-left transition-all duration-300 flex items-center gap-4
                                                        ${isSelected ? 'bg-purple-50 border-[#6b5ea7] shadow-md ring-4 ring-purple-50/50' : 'bg-white border-slate-100 hover:border-purple-200 hover:shadow-lg'}
                                                        ${isCorrect ? 'bg-emerald-50 border-emerald-500 ring-4 ring-emerald-50/50' : ''}
                                                        ${isWrong ? 'bg-rose-50 border-rose-500 ring-4 ring-rose-50/50' : ''}
                                                    `}
                                                >
                                                    <div className={`
                                                        w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all border-2
                                                        ${isSelected ? 'bg-[#6b5ea7] text-white border-[#6b5ea7]' : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-purple-50 group-hover:text-[#6b5ea7]'}
                                                        ${isCorrect ? 'bg-emerald-500 text-white border-emerald-500' : ''}
                                                        ${isWrong ? 'bg-rose-500 text-white border-rose-500' : ''}
                                                    `}>
                                                        {String.fromCharCode(65 + index)}
                                                    </div>
                                                    <span className={`text-base sm:text-lg font-bold transition-all ${isSelected ? 'text-purple-900' : 'text-slate-600'} ${isCorrect ? 'text-emerald-900' : ''} ${isWrong ? 'text-rose-900' : ''}`}>
                                                        {option}
                                                    </span>
                                                    {(isSelected || isCorrect || isWrong) && (
                                                        <div className="ml-auto">
                                                            {isCorrect ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> :
                                                                isWrong ? <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-black">✕</div> :
                                                                    <div className={`w-3 h-3 rounded-full bg-[#6b5ea7] shadow-[0_0_10px_rgba(79,70,229,0.5)]`} />}
                                                        </div>
                                                    )}
                                                </motion.button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* Bottom Navigation */}
            {!isSubmitted && (
                <footer className="sticky bottom-0 bg-white border-t border-slate-200/60 p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] backdrop-blur-xl">
                    <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
                        <Button
                            variant="ghost"
                            disabled={currentQuestionIndex === 0}
                            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                            className="h-12 px-6 sm:px-8 rounded-xl font-bold text-slate-500 hover:text-[#6b5ea7] transition-all flex items-center gap-2"
                        >
                            <ChevronLeft className="w-5 h-5" /> <span className="hidden sm:inline">Previous</span>
                        </Button>

                        <div className="flex gap-2">
                            {quiz.questions.map((_: any, i: number) => (
                                <div
                                    key={i}
                                    className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${i === currentQuestionIndex ? 'w-8 bg-[#6b5ea7]' :
                                        userAnswers[i] ? 'bg-purple-200' : 'bg-slate-200'
                                        }`}
                                />
                            ))}
                        </div>

                        <div className="flex gap-3">
                            {currentQuestionIndex === quiz.questions.length - 1 ? (
                                <Button
                                    onClick={handleSubmit}
                                    disabled={isSubmitted}
                                    className="h-12 px-8 rounded-xl font-bold bg-[#6b5ea7] hover:bg-[#6b5ea7] text-white shadow-lg shadow-purple-100 transition-all"
                                >
                                    Finish Quiz
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                                    className="h-12 px-6 sm:px-8 rounded-xl font-bold bg-white border-2 border-[#6b5ea7] text-[#6b5ea7] hover:bg-purple-50 transition-all flex items-center gap-2"
                                >
                                    <span className="hidden sm:inline">Next Question</span> <ChevronRight className="w-5 h-5" />
                                </Button>
                            )}
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}
