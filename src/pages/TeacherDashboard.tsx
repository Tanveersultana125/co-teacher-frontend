import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Plus,
  Brain,
  ClipboardCheck,
  Video,
  Calendar,
  ChevronRight,
  MoreVertical,
  Loader2,
  CheckCircle2,
  ScrollText,
  TrendingUp,
  MessageSquare,
  Sparkles,
  Presentation,
  Menu
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { Suspense, lazy } from "react";

// Lazy load heavy components

const AssignmentsTab = lazy(() => import("@/components/dashboard/AssignmentsTab").then(m => ({ default: m.AssignmentsTab })));
const QuizGeneratorTab = lazy(() => import("@/components/dashboard/QuizGeneratorTab").then(m => ({ default: m.QuizGeneratorTab })));
const TeachingMaterialTab = lazy(() => import("@/components/dashboard/TeachingMaterialTab").then(m => ({ default: m.TeachingMaterialTab })));
const AttendanceTab = lazy(() => import("@/components/dashboard/AttendanceTab").then(m => ({ default: m.AttendanceTab })));
const QuestionPaperTab = lazy(() => import("@/components/dashboard/QuestionPaperTab").then(m => ({ default: m.QuestionPaperTab })));
const MessagesTab = lazy(() => import("@/components/dashboard/MessagesTab").then(m => ({ default: m.MessagesTab })));
const StudentsTab = lazy(() => import("@/components/dashboard/StudentsTab").then(m => ({ default: m.StudentsTab })));
const AIAssistantTab = lazy(() => import("@/components/dashboard/AIAssistantTab").then(m => ({ default: m.AIAssistantTab })));
const AILessonPlanGeneratorTab = lazy(() => import("@/components/dashboard/AILessonPlanGeneratorTab").then(m => ({ default: m.AILessonPlanGeneratorTab })));
const AnalyticsTab = lazy(() => import("@/components/dashboard/AnalyticsTab").then(m => ({ default: m.AnalyticsTab })));
const PPTGeneratorTab = lazy(() => import("@/components/dashboard/PPTGeneratorTab").then(m => ({ default: m.PPTGeneratorTab })));
const CalendarTab = lazy(() => import("@/components/dashboard/CalendarTab").then(m => ({ default: m.CalendarTab })));
const DataAnalysisTab = lazy(() => import("@/components/dashboard/DataAnalysisTab").then(m => ({ default: m.DataAnalysisTab })));
const LessonSummarizerTab = lazy(() => import("@/components/dashboard/LessonSummarizerTab").then(m => ({ default: m.LessonSummarizerTab })));
const PreviousPapersTab = lazy(() => import("@/components/dashboard/PreviousPapersTab").then(m => ({ default: m.PreviousPapersTab })));

const menuItems = [
  { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { id: "generator", icon: Brain, label: "AI Lesson Plan Generator" },
  { id: "summarizer", icon: FileText, label: "Summarize Lesson" },
  { id: "ppt", icon: Presentation, label: "AI PPT Generator" },
  { id: "assignments", icon: FileText, label: "Assignments" },
  { id: "quizzes", icon: ClipboardCheck, label: "Assessments" },
  { id: "exams", icon: ScrollText, label: "Exams" },
  { id: "previous-papers", icon: FileText, label: "Previous Papers" },
  { id: "attendance", icon: CheckCircle2, label: "Attendance" },
  { id: "messages", icon: MessageSquare, label: "Messages" },
  { id: "students", icon: Users, label: "Students" },
  { id: "analytics", icon: BarChart3, label: "Analytics" },
];

const TeacherDashboard = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [assistantMode, setAssistantMode] = useState<"lesson" | "material" | "quiz">("lesson");
  const [selectedLesson, setSelectedLesson] = useState<any>(null);
  const [generatorSubTab, setGeneratorSubTab] = useState<"generate" | "library">("generate");
  const navigate = useNavigate();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && menuItems.some(i => i.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const quickActions = [
    { icon: BookOpen, label: "Create Lesson Plan", color: "indigo", bgColor: "bg-purple-50", iconColor: "text-[#6b5ea7]", mode: "lesson" },
    { icon: Brain, label: "Generate Material", color: "amber", bgColor: "bg-amber-50", iconColor: "text-amber-600", mode: "material" },
    { icon: ClipboardCheck, label: "Create Quiz", color: "blue", bgColor: "bg-blue-50", iconColor: "text-blue-600", mode: "quiz" },
    { icon: FileText, label: "Assignments", color: "emerald", bgColor: "bg-emerald-50", iconColor: "text-emerald-600", mode: "lesson" },
  ];

  const { user } = useAuth();
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 30, // 30 minutes - stats are not real-time
    retry: 0, // Don't retry on failure (quota exhausted)
  });

  const { data: lessons, isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons', 'dashboard-preview'],
    queryFn: async () => {
      // Only fetch 10 for the dashboard preview (we only show 5)
      const res = await api.get('/lessons?limit=10');
      return res.data;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 20, // 20 minutes - lessons don't change that often
  });



  const stats = [
    { label: "Total Students", value: dashboardStats?.totalStudents || "0", change: "+12% from last month", icon: Users, iconColor: "text-[#6b5ea7]", iconBg: "bg-purple-50" },
    { label: "Lessons Created", value: dashboardStats?.lessonsCreated || "0", change: "+5 this week", icon: BookOpen, iconColor: "text-emerald-600", iconBg: "bg-emerald-50" },
    { label: "Avg. Performance", value: (dashboardStats?.avgPerformance || "0") + "%", change: "+3% since last term", icon: BarChart3, iconColor: "text-blue-600", iconBg: "bg-blue-50" },
    { label: "Attendance Rate", value: (dashboardStats?.attendanceRate || "0") + "%", change: "98% present today", icon: TrendingUp, iconColor: "text-orange-600", iconBg: "bg-orange-50" },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      {/* Mobile Menu Backdrop */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Mobile and Desktop */}
      <aside className={`fixed inset-y-0 left-0 bg-[#3d3151] border-r border-white/5 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 lg:w-64 print:hidden ${isMobileMenuOpen ? "translate-x-0 w-[280px]" : "-translate-x-full w-64"
        }`}>
        <div className="p-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-200">
              <img src="/aicoteacher.png" alt="Co-Teacher Logo" className="w-8 h-8 object-contain" />
            </div>
            <span className="text-xl font-bold text-white font-display tracking-tight">Co-Teacher</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden text-white/70 hover:text-white p-2"
          >
            <Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto overflow-x-hidden">
          <button
            onClick={() => {
              navigate("/");
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <div className="w-5 h-5 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 opacity-70" />
            </div>
            <span className="font-semibold text-[15px]">Home Page</span>
          </button>

          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeTab === item.id
                ? "bg-[#f5f3f7] text-[#6b5ea7] shadow-md"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}






            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-[#6b5ea7]" : "text-slate-400"}`} />






              <span className="font-semibold text-[15px]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all font-semibold text-[15px]"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 overflow-x-hidden min-h-screen mesh-gradient">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-3 sm:px-6 lg:px-8 py-3 sm:py-4 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Toggle Menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-lg lg:text-2xl font-bold text-slate-900 font-display transition-all">Welcome back!</h1>
                <p className="text-slate-500 text-[10px] lg:text-sm mt-0.5 font-medium hidden xs:block">Manage your classes and AI content</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center h-[400px] gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#6b5ea7]" />
              <p className="text-slate-400 font-medium animate-pulse">Loading experience...</p>
            </div>
          }>
            {activeTab === "dashboard" ? (
              <>
                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {statsLoading ? (
                    Array(4).fill(0).map((_, i) => (
                      <div key={i} className="h-32 rounded-2xl bg-white animate-pulse shadow-sm" />
                    ))
                  ) : (
                    stats.map((stat, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Card className="border-none shadow-sm bg-[#f3e8ff] backdrop-blur-md overflow-hidden">
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <p className="text-slate-500 text-sm font-semibold">{stat.label}</p>
                                <h3 className="text-3xl font-bold text-slate-900 font-display">{stat.value}</h3>
                                <p className={`text-xs font-bold ${stat.label === 'Attendance Rate' ? 'text-orange-600' : 'text-emerald-600'}`}>
                                  {stat.change}
                                </p>
                              </div>
                              <div className={`w-12 h-12 rounded-2xl ${stat.iconBg} flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))
                  )}
                </div>

                {/* Daily Mission Checklist & Featured Tool */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="h-full border-none shadow-xl bg-white/40 backdrop-blur-xl p-8 relative overflow-hidden group">
                      {/* Decorative Background Blob */}
                      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#6b5ea7]/10 rounded-full blur-3xl group-hover:bg-[#6b5ea7]/20 transition-all duration-700" />

                      <div className="relative z-10">
                        <h2 className="text-2xl font-black text-slate-900 mb-2 font-display italic">
                          What did you do <span className="text-[#6b5ea7]">after school</span> yesterday?
                        </h2>

                        <div className="flex items-center gap-2 mb-8 animate-bounce w-fit">
                          <Plus className="w-4 h-4 text-slate-400 rotate-45" />
                          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Your Daily Mission</div>
                        </div>

                        <div className="space-y-4">
                          {[
                            { id: 'assignments', label: 'Grade student essays', icon: FileText },
                            { id: 'messages', label: 'Respond to parent emails', icon: MessageSquare },
                            { id: 'generator', label: 'Write tomorrow’s lesson plan', icon: Brain },
                            { id: 'quizzes', label: 'Create Quizzes', icon: ClipboardCheck },
                            { id: 'data-analysis', label: 'Work on IEP goals & Analytics', icon: BarChart3 },
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setActiveTab(item.id)}
                              className="w-full flex items-center gap-4 p-4 rounded-2xl border border-white/50 bg-white/30 hover:bg-white/60 hover:shadow-lg transition-all text-left group/item"
                            >
                              <div className="relative">
                                <div className="w-6 h-6 rounded-lg border-2 border-slate-300 flex items-center justify-center group-hover/item:border-[#6b5ea7] transition-colors">
                                  <div className="w-3 h-3 bg-[#6b5ea7] rounded-sm scale-0 group-hover/item:scale-100 transition-transform shadow-sm shadow-[#6b5ea7]/20" />
                                </div>
                              </div>

                              <span className="font-bold text-slate-700 group-hover/item:text-slate-900 transition-colors">{item.label}</span>
                              <div className="ml-auto opacity-0 group-hover/item:opacity-100 transition-opacity">
                                <item.icon className="w-4 h-4 text-[#6b5ea7]" />
                              </div>

                            </button>
                          ))}
                        </div>
                      </div>
                    </Card>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                  >
                    <Card className="h-full border-none shadow-xl bg-[#f3e7ff] p-8 text-slate-900 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
                        <Sparkles className="w-32 h-32 text-[#6b5ea7]" />
                      </div>

                      <div className="relative z-10 flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="px-3 py-1 bg-[#6b5ea7]/10 text-[#6b5ea7] rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md">Featured Feature</div>
                        </div>
                        <h3 className="text-3xl font-black mb-4 font-display leading-tight">AI Data Intelligence <br /><span className="text-[#6b5ea7]">Superpowers.</span></h3>
                        <p className="text-slate-600 font-medium mb-8 leading-relaxed">
                          Analyze entire classes in seconds. Identify struggling students, generate improvement plans, and predict future performance with our proprietary AI engine.
                        </p>

                        <div className="mt-auto space-y-4">
                          <Button
                            onClick={() => setActiveTab('data-analysis')}
                            className="w-full h-14 bg-[#6b5ea7] hover:bg-[#6b5ea7]/90 text-white font-black text-lg rounded-2xl flex items-center justify-center gap-3 group/btn shadow-lg shadow-purple-200"
                          >
                            <span>Open Data Intelligence</span>
                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                          </Button>

                          <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
                            <div className="flex items-center gap-1"><Users className="w-3 h-3 text-[#6b5ea7]" /> 2.4k+ Teachers using</div>
                            <div className="flex items-center gap-1 underline underline-offset-4 cursor-pointer hover:text-[#6b5ea7] transition-colors">Watch Demo</div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </div>

                {/* Quick Actions */}
                <Card className="border-none shadow-sm bg-white p-5 sm:p-8">
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">AI Tools</h3>
                    <p className="text-slate-500 text-xs sm:text-sm font-medium">Generate assessments and materials instantly</p>
                  </div>
                  <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={index}
                        onClick={() => {
                          setAssistantMode(action.mode as any);
                          setGeneratorSubTab("generate");
                          setActiveTab('generator');
                        }}
                        className="group p-5 sm:p-8 rounded-2xl border-none bg-[#f3e8ff] hover:bg-[#e9d5ff] transition-all flex flex-col items-center gap-3 sm:gap-4 shadow-sm"
                      >
                        <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${action.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                          <action.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${action.iconColor}`} />
                        </div>
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">{action.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </Card>

                {/* Lessons and Schedule */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 pb-12">
                  <Card className="lg:col-span-2 border-none shadow-sm bg-[#f3e8ff] p-5 sm:p-8">
                    <div className="flex items-center justify-between mb-6 sm:mb-8">
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">Recent Lessons</h3>
                      <Button variant="ghost" onClick={() => {
                        setGeneratorSubTab("library");
                        setActiveTab('generator');
                      }} className="text-slate-500 hover:text-[#4F46E5] font-bold">
                        View All <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {lessonsLoading ? (
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#6b5ea7]" />
                      ) : (
                        lessons?.slice(0, 5).map((lesson: any) => (
                          <div
                            key={lesson.id}
                            onClick={() => {
                              setSelectedLesson(lesson);
                              setActiveTab("generator");
                            }}
                            className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-[#4F46E5]">
                                <BookOpen className="w-6 h-6" />
                              </div>
                              <div>
                                <h4 className="font-bold text-slate-900 group-hover:text-[#6b5ea7] transition-colors">{lesson.title}</h4>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{lesson.subject?.name || 'Science'} • Grade {lesson.grade || 10}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${lesson.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                              {lesson.status || 'Draft'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </Card>

                  <Card className="border-none shadow-sm bg-white p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-display">Today's Schedule</h3>
                        <p className="text-slate-500 text-xs sm:text-sm font-medium">Your upcoming classes</p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-2 font-bold text-slate-600 border-slate-200" onClick={() => setActiveTab('calendar')}>
                        <Calendar className="w-4 h-4" /> Calendar
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {[
                        { time: "09:00 AM", subject: "Mathematics", class: "Class 8A", students: 32 },
                        { time: "11:30 AM", subject: "Science", class: "Class 7B", students: 28 },
                        { time: "02:00 PM", subject: "English", class: "Class 9A", students: 35 },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-3 sm:p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors bg-white hover:bg-slate-50/50 group">
                          <div className="flex items-center gap-4 sm:gap-6">
                            <span className="font-bold text-[#6b5ea7] text-[10px] sm:text-sm whitespace-nowrap">{item.time}</span>
                            <div className="w-px h-6 sm:h-8 bg-slate-100"></div>
                            <div>
                              <h4 className="font-bold text-slate-900 text-sm sm:text-base">{item.subject}</h4>
                              <p className="text-[10px] sm:text-xs text-slate-500 font-bold">{item.class}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 text-slate-400">
                            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-[10px] sm:text-xs font-bold">{item.students}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </>
            ) : activeTab === "generator" ? (
              <AILessonPlanGeneratorTab initialMode={assistantMode} preloadedLesson={selectedLesson} initialActiveSubTab={generatorSubTab} />
            ) : activeTab === "summarizer" ? (
              <LessonSummarizerTab />
            ) : activeTab === "ppt" ? (
              <PPTGeneratorTab />
            ) : activeTab === "assignments" ? (
              <AssignmentsTab />
            ) : activeTab === "quizzes" ? (
              <QuizGeneratorTab />
            ) : activeTab === "exams" ? (
              <QuestionPaperTab />
            ) : activeTab === "previous-papers" ? (
              <PreviousPapersTab />
            ) : activeTab === "materials" ? (
              <TeachingMaterialTab />
            ) : activeTab === "attendance" ? (
              <AttendanceTab />
            ) : activeTab === "calendar" ? (
              <CalendarTab />
            ) : activeTab === "messages" ? (
              <MessagesTab />
            ) : activeTab === "students" ? (
              <StudentsTab />
            ) : activeTab === "analytics" ? (
              <AnalyticsTab />
            ) : activeTab === "data-analysis" ? (
              <DataAnalysisTab />
            ) : (
              <div className="flex items-center justify-center h-[400px]">
                <p className="text-slate-400 font-medium">Coming soon...</p>
              </div>
            )}
          </Suspense>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
