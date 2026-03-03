import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    GraduationCap,
    LayoutDashboard,
    Users,
    MessageSquare,
    BarChart3,
    LogOut,
    Calendar,
    Award,
    Bell,
    ChevronRight,
    TrendingUp,
    Clock,
    CheckCircle2,
    Loader2,
    Menu,
    X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/client";

const ParentDashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const { data: parentData, isLoading } = useQuery({
        queryKey: ['parent-dashboard'],
        queryFn: async () => {
            const res = await api.get('/parent-dashboard/data');
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

    const child = parentData?.children?.[0];

    const stats = [
        { label: "Attendance Rate", value: (parentData?.stats.attendanceRate || "0") + "%", sub: "98% required", icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50" },
        { label: "Overall Grade", value: (parentData?.stats.avgGrade || "0") + "%", sub: "Class avg: 72%", icon: Award, color: "text-indigo-600", bg: "bg-indigo-50" },
        { label: "Pending Tasks", value: parentData?.stats.pendingAssignments || "0", sub: "Next due: Friday", icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
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
                    {[
                        { id: "overview", icon: LayoutDashboard, label: "Overview" },
                        { id: "academic", icon: BarChart3, label: "Academic Record" },
                        { id: "attendance", icon: CheckCircle2, label: "Attendance" },
                        { id: "messages", icon: MessageSquare, label: "Messages" },
                    ].map((item) => (
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

                <div className="p-4 border-t border-slate-100 pb-8">
                    <div className="p-4 bg-slate-50 rounded-2xl mb-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Logged in as Parent</p>
                        <p className="font-bold text-slate-800 text-sm">{child?.user.name}'s Parent</p>
                    </div>
                    <button
                        onClick={() => { localStorage.clear(); navigate("/login"); }}
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
                                <h1 className="text-lg sm:text-2xl font-bold text-slate-900 font-display truncate max-w-[150px] sm:max-none">Parent Portal</h1>
                                <p className="text-slate-500 text-[10px] sm:text-sm mt-0.5 font-medium truncate max-w-[150px] sm:max-none">Tracking {child?.user.name}'s progress</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                            </button>
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm hover:scale-105 transition-transform cursor-pointer">
                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${child?.user.name}`} />
                            </Avatar>
                        </div>
                    </div>
                </header>

                <div className="p-4 sm:p-8 space-y-6 sm:space-y-8">
                    {/* Child Focus Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                                <p className="text-xs text-slate-400 font-medium">{stat.sub}</p>
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

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                        {/* Academic Growth */}
                        <Card className="border-none shadow-sm bg-white p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-slate-900 font-display">Academic Performance</h3>
                                <TrendingUp className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="space-y-6">
                                {child?.grades.map((grade: any) => (
                                    <div key={grade.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-indigo-50/30 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-indigo-600 shadow-sm">
                                                <BarChart3 className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{grade.type}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(grade.gradedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-bold text-indigo-600">{grade.score}/{grade.maxScore}</p>
                                            <p className="text-[10px] font-bold text-slate-400">Excellent Work</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        {/* Attendance & Communication */}
                        <div className="space-y-8">
                            <Card className="border-none shadow-sm bg-white p-8">
                                <h3 className="text-xl font-bold text-slate-900 font-display mb-6">Attendance Log</h3>
                                <div className="flex gap-2 mb-6">
                                    {child?.attendance.slice(0, 7).map((log: any) => (
                                        <div
                                            key={log.id}
                                            className={`flex-1 h-12 rounded-lg flex items-center justify-center font-bold text-xs ${log.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}
                                        >
                                            {new Date(log.date).getDate()}
                                        </div>
                                    ))}
                                </div>
                                <Button variant="outline" className="w-full border-slate-100 text-slate-500 font-bold py-6 rounded-xl">
                                    View Full Attendance History
                                </Button>
                            </Card>

                            <Card className="border-none shadow-sm bg-[#4F46E5] p-8 text-white">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xl font-bold font-display">Teacher Communication</h3>
                                    <MessageSquare className="w-6 h-6 opacity-50" />
                                </div>
                                <div className="space-y-4">
                                    {parentData?.recentMessages.map((msg: any) => (
                                        <div key={msg.id} className="p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Avatar className="w-6 h-6">
                                                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender.name}`} />
                                                </Avatar>
                                                <span className="text-xs font-bold">{msg.sender.name}</span>
                                                <span className="text-[10px] opacity-60 ml-auto">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="text-sm font-medium leading-relaxed line-clamp-2">{msg.content}</p>
                                        </div>
                                    ))}
                                    {parentData?.recentMessages.length === 0 && (
                                        <p className="text-indigo-100 text-sm font-medium opacity-70">No recent messages from teachers.</p>
                                    )}
                                </div>
                                <Button className="w-full mt-6 bg-white text-[#4F46E5] hover:bg-indigo-50 font-bold py-6 rounded-xl">
                                    Open Message Center
                                </Button>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ParentDashboard;
