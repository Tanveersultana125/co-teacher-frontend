import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  FileText,
  ClipboardCheck,
  BarChart3,
  Settings,
  LogOut,
  Play,
  Calendar,
  Award,
  Clock,
  ChevronRight,
  Loader2,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/client";

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const menuItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "lessons", icon: BookOpen, label: "My Lessons" },
    { id: "assignments", icon: FileText, label: "Assignments" },
    { id: "quizzes", icon: ClipboardCheck, label: "Quizzes" },
    { id: "grades", icon: BarChart3, label: "Grades" },
  ];

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const res = await api.get('/student-dashboard/dashboard');
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const stats = [
    { label: "Lessons Completed", value: dashboardData?.stats.lessonsCompleted || "0", icon: BookOpen, color: "text-[#0D5355]", bg: "bg-teal-50" },
    { label: "Assignments Due", value: dashboardData?.stats.assignmentsDue || "0", icon: FileText, color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Average Score", value: (dashboardData?.stats.avgScore || "0") + "%", icon: Award, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Attendance", value: (dashboardData?.stats.attendanceRate || "0") + "%", icon: Calendar, color: "text-blue-600", bg: "bg-blue-50" },
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      {/* Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-[60] w-64 bg-white border-r border-slate-100 flex flex-col transition-all duration-300
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 lg:p-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#4F46E5] rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold text-slate-900 font-display tracking-tight">Co-Teacher</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium ${activeTab === item.id
                ? "bg-[#EEF2FF] text-[#4F46E5]"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? "text-[#4F46E5]" : "text-slate-400"}`} />
              <span className="font-semibold text-[15px]">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-semibold text-[15px]"
          >
            <LogOut className="w-5 h-5" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 overflow-auto min-w-0">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-4 sm:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 font-display truncate max-w-[150px] sm:max-w-none">Hello, {dashboardData?.profile.user.name.split(' ')[0]}!</h1>
                <p className="text-slate-500 text-[10px] sm:text-sm mt-0.5 font-medium truncate max-w-[150px] sm:max-w-none">Keep up the great work!</p>
              </div>
            </div>
            <div className="flex items-center gap-4 bg-indigo-50 px-4 py-2 rounded-xl">
              <span className="text-indigo-600 font-bold text-sm">Grade {dashboardData?.profile.grade}-{dashboardData?.profile.section}</span>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-slate-500 text-sm font-semibold">{stat.label}</p>
                        <h3 className="text-3xl font-bold text-slate-900 font-display">{stat.value}</h3>
                      </div>
                      <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm bg-white p-8">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-bold text-slate-900 font-display">My Lessons</h3>
                <Button variant="ghost" className="text-indigo-600 font-bold">View Curriculum</Button>
              </div>
              <div className="space-y-4">
                {dashboardData?.lessons.map((lesson: any) => (
                  <div key={lesson.id} className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-all cursor-pointer group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{lesson.title}</h4>
                          <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">{lesson.subject.name}</p>
                        </div>
                      </div>
                      <Button size="sm" className="bg-[#4F46E5] rounded-lg font-bold">Start</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <div className="space-y-8">
              <Card className="border-none shadow-sm bg-white p-8">
                <h3 className="text-xl font-bold text-slate-900 font-display mb-8">Pending Assignments</h3>
                <div className="space-y-4">
                  {dashboardData?.assignments.map((asn: any) => (
                    <div key={asn.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${asn.submissions.length > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {asn.submissions.length > 0 ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{asn.title}</p>
                          <p className="text-xs text-slate-500 font-bold">Due: {new Date(asn.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="font-bold border-slate-200">
                        {asn.submissions.length > 0 ? 'Review' : 'Submit'}
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-none shadow-sm bg-[#4F46E5] p-8 text-white">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold font-display">Recent Grades</h3>
                  <BarChart3 className="w-6 h-6 opacity-50" />
                </div>
                <div className="space-y-4">
                  {dashboardData?.profile.grades.slice(0, 3).map((grade: any) => (
                    <div key={grade.id} className="flex items-center justify-between p-3 bg-white/10 rounded-xl">
                      <span className="font-bold text-sm">{grade.type}</span>
                      <span className="font-mono font-bold">{grade.score}/{grade.maxScore}</span>
                    </div>
                  ))}
                  {dashboardData?.profile.grades.length === 0 && (
                    <p className="text-indigo-100 text-sm font-medium">No assessments graded yet.</p>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

import { CheckCircle2 } from "lucide-react";

export default StudentDashboard;
