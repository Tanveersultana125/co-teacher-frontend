import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BookOpen, MoreVertical, Loader2, Search, Filter, Clock, FileText, HelpCircle, GraduationCap } from "lucide-react";

interface LessonsTabProps {
    onLessonSelect?: (lesson: any) => void;
}

export function LessonsTab({ onLessonSelect }: LessonsTabProps) {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week" | "month">("all");
    const { user } = useAuth();
    const { data: lessons, isLoading } = useQuery({
        queryKey: ['lessons'],
        queryFn: async () => {
            const res = await api.get('/lessons');
            return res.data;
        },
        enabled: !!user?.id,
        staleTime: 1000 * 60 * 30, // Library data shouldn't change much
    });

    const filteredLessons = lessons?.filter((lesson: any) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch = (
            lesson.title?.toLowerCase().includes(search) ||
            lesson.subject?.name?.toLowerCase().includes(search) ||
            lesson.subject?.toLowerCase?.().includes(search) ||
            lesson.topic?.name?.toLowerCase().includes(search) ||
            lesson.topic?.toLowerCase?.().includes(search)
        );

        if (!matchesSearch) return false;

        if (timeFilter === "all") return true;

        const lessonDate = new Date(lesson.createdAt || lesson.updatedAt);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - lessonDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (timeFilter === "today") return diffDays <= 1;
        if (timeFilter === "week") return diffDays <= 7;
        if (timeFilter === "month") return diffDays <= 30;

        return true;
    });

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-display">My Library</h2>
                    <p className="text-slate-500 font-medium">Create and organize your teaching curriculum</p>
                </div>

                <div className="flex flex-1 items-center justify-end gap-4 max-w-2xl">
                    <div className="flex-1 relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <Input
                            placeholder="Search lessons, subjects or topics..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-11 h-12 bg-white border-slate-200 rounded-2xl focus-visible:ring-indigo-500 shadow-sm"
                        />
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className={`h-12 rounded-2xl border-slate-200 font-bold bg-white hover:bg-slate-50 ${timeFilter !== 'all' ? 'text-indigo-600 border-indigo-200 bg-indigo-50/50' : ''}`}>
                                    <Filter className="w-4 h-4 mr-2" />
                                    {timeFilter === 'all' ? 'Filter' :
                                        timeFilter === 'today' ? 'Today' :
                                            timeFilter === 'week' ? 'Last Week' : 'Last Month'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 rounded-xl p-2">
                                <DropdownMenuItem onClick={() => setTimeFilter("all")} className="rounded-lg font-medium">All Time</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTimeFilter("today")} className="rounded-lg font-medium flex items-center gap-2">
                                    <Clock className="w-4 h-4" /> Today
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTimeFilter("week")} className="rounded-lg font-medium">Last Week</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTimeFilter("month")} className="rounded-lg font-medium">Last Month</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {isLoading ? (
                    <div className="flex justify-center p-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : filteredLessons?.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-3xl border border-dashed border-slate-200">
                        <BookOpen className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-500 font-medium">
                            {searchTerm || timeFilter !== 'all' ? `No lessons found matching your filters` : "No lesson plans yet. Create your first one!"}
                        </p>
                    </div>
                ) : (
                    filteredLessons?.map((lesson: any) => (
                        <Card
                            key={lesson.id}
                            onClick={() => onLessonSelect?.(lesson)}
                            className="border-none shadow-sm bg-white hover:shadow-md transition-all cursor-pointer group active:scale-[0.99]"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${lesson.type === 'QUIZ' ? 'bg-amber-50 text-amber-600' :
                                            lesson.type === 'MATERIAL' ? 'bg-emerald-50 text-emerald-600' :
                                                lesson.type === 'ASSIGNMENT' ? 'bg-indigo-50 text-indigo-600' :
                                                    'bg-blue-50 text-blue-600'
                                            }`}>
                                            {lesson.type === 'QUIZ' ? <HelpCircle className="w-7 h-7" /> :
                                                lesson.type === 'MATERIAL' ? <BookOpen className="w-7 h-7" /> :
                                                    lesson.type === 'ASSIGNMENT' ? <FileText className="w-7 h-7" /> :
                                                        <GraduationCap className="w-7 h-7" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors leading-none">{lesson.title}</h3>
                                                <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${lesson.type === 'QUIZ' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                    lesson.type === 'MATERIAL' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                        lesson.type === 'ASSIGNMENT' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' :
                                                            'bg-blue-50 text-blue-600 border-blue-100'
                                                    }`}>
                                                    {lesson.type || 'LESSON'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 mt-1">
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{lesson.subject?.name || lesson.subjectName || 'General'}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{lesson.topic?.name || lesson.topicName || 'Intro'}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-200" />
                                                <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider font-display">Grade {lesson.grade || 10}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        {lesson.type === 'QUIZ' && (
                                            <Button
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/quiz/${lesson.id}`);
                                                }}
                                                className="h-9 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 font-bold text-white shadow-sm"
                                            >
                                                Launch Quiz
                                            </Button>
                                        )}
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${lesson.status === 'PUBLISHED' ? 'bg-teal-50 text-[#0D5355]' : 'bg-slate-50 text-slate-400'}`}>
                                            {lesson.status}
                                        </span>
                                        <button className="p-2 text-slate-300 hover:text-slate-600">
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
