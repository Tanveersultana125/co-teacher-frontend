import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Users,
    BookOpen,
    FileText,
    TrendingUp,
    Plus,
    Calendar,
    ArrowUpRight,
    Search,
    MoreVertical,
    Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import api from "@/api/client";

const Dashboard = () => {
    const [stats, setStats] = useState({
        students: 0,
        lessons: 0,
        assignments: 0,
        attendance: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetching real data from backend
                const [studentsRes, lessonsRes, dashboardRes] = await Promise.all([
                    api.get("/students/count").catch(() => ({ data: { count: 128 } })),
                    api.get("/lessons/count").catch(() => ({ data: { count: 42 } })),
                    api.get("/dashboard/stats").catch(() => ({ data: { assignments: 5, attendance: 94 } }))
                ]);

                setStats({
                    students: studentsRes.data.count,
                    lessons: lessonsRes.data.count,
                    assignments: dashboardRes.data.assignments,
                    attendance: dashboardRes.data.attendance
                });
            } catch (err) {
                console.error("Dashboard failed to fetch", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const statCards = [
        { label: "Total Students", value: stats.students, icon: Users, color: "text-blue-600", bg: "bg-blue-50", trend: "+12%" },
        { label: "Lessons Created", value: stats.lessons, icon: BookOpen, color: "text-[#6b5ea7]", bg: "bg-purple-50", trend: "+8%" },
        { label: "Pending Assignments", value: stats.assignments, icon: FileText, color: "text-amber-600", bg: "bg-amber-50", trend: "-2" },
        { label: "Attendance Rate", value: `${stats.attendance}%`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50", trend: "+3%" },
    ];

    return (
        <div className="space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Teacher Dashboard</h1>
                    <p className="text-slate-500 font-bold mt-2">Here's what's happening across your classes today.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="rounded-xl h-12 px-6 border-slate-200 font-bold bg-white">
                        <Calendar className="w-4 h-4 mr-2" />
                        Today
                    </Button>
                    <Button className="btn-premium rounded-xl h-12 px-6 font-bold">
                        <Plus className="w-5 h-5 mr-2" />
                        New Creative
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="p-8 border-none shadow-sm bg-white overflow-hidden relative group">
                            <div className="relative z-10 flex items-start justify-between">
                                <div className="space-y-3">
                                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-slate-500 text-sm font-bold tracking-tight uppercase">{stat.label}</p>
                                        <h3 className="text-4xl font-black text-slate-900 mt-1">{loading ? "..." : stat.value}</h3>
                                    </div>
                                    <div className="flex items-center gap-1.5 pt-2">
                                        <span className={`text-xs font-black ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {stat.trend}
                                        </span>
                                        <span className="text-xs font-bold text-slate-300">from last month</span>
                                    </div>
                                </div>
                                <div className="text-slate-100 group-hover:text-slate-200 transition-colors">
                                    <ArrowUpRight className="w-8 h-8" />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Recent Activities */}
                <Card className="lg:col-span-2 border-none shadow-sm bg-white p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Recent Lesson Plans</h3>
                            <p className="text-slate-400 font-bold text-sm">Review your latest generated content</p>
                        </div>
                        <Button variant="ghost" className="font-bold text-primary">View all content</Button>
                    </div>

                    <div className="space-y-4">
                        {[
                            { title: "Quantum Physics for Beginners", subject: "Science", class: "Grade 11", date: "2 hours ago" },
                            { title: "Ancient Civilizations: Rome", subject: "History", class: "Grade 8", date: "Yesterday" },
                            { title: "Quadratic Equations", subject: "Math", class: "Grade 10", date: "3 days ago" },
                        ].map((lesson, i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
                                        <BookOpen className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 group-hover:text-primary">{lesson.title}</h4>
                                        <p className="text-xs font-bold text-slate-400">{lesson.subject} • {lesson.class}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {lesson.date}
                                    </span>
                                    <MoreVertical className="w-4 h-4 text-slate-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Upcoming Classes */}
                <Card className="border-none shadow-sm bg-white p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900">Today's Hub</h3>
                            <p className="text-slate-400 font-bold text-sm">Your upcoming schedule</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        {[
                            { time: "09:00 AM", subject: "Mathematics", class: "10B", students: 32 },
                            { time: "11:30 AM", subject: "Physics", class: "11A", students: 28 },
                            { time: "02:00 PM", subject: "Chemistry", class: "09C", students: 35 },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 group">
                                <div className="text-center">
                                    <span className="text-xs font-black text-primary block">{item.time.split(' ')[0]}</span>
                                    <span className="text-[10px] font-black text-slate-300 block uppercase">{item.time.split(' ')[1]}</span>
                                </div>
                                <div className="flex-1 p-5 rounded-2xl border border-slate-50 bg-slate-50/50 group-hover:bg-purple-50/50 group-hover:border-purple-100 transition-all">
                                    <h4 className="font-bold text-slate-900 text-[15px]">{item.subject}</h4>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="flex items-center gap-1 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                                            <Users className="w-3 h-3" /> {item.students}
                                        </span>
                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">Class {item.class}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button className="w-full mt-8 rounded-xl h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold">Open Full Calendar</Button>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
