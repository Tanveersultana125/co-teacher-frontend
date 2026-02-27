import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { Loader2, Users, BookOpen, Clock, FileCheck, Sparkles, LayoutDashboard } from "lucide-react";
import { DataAnalysisTab } from "./DataAnalysisTab";
import { Button } from "@/components/ui/button";

export function AnalyticsTab() {
    const [mode, setMode] = useState<'overview' | 'ai'>('overview');

    const { data: stats, isLoading } = useQuery({
        queryKey: ['analytics-stats'],
        queryFn: async () => {
            await new Promise(r => setTimeout(r, 1000));
            return {
                performanceTrend: [
                    { name: 'Jan', avg: 65 }, { name: 'Feb', avg: 72 }, { name: 'Mar', avg: 68 },
                    { name: 'Apr', avg: 75 }, { name: 'May', avg: 82 }, { name: 'Jun', avg: 85 }
                ],
                attendanceDist: [
                    { name: 'Present', value: 85, color: '#10B981' },
                    { name: 'Absent', value: 10, color: '#EF4444' },
                    { name: 'Late', value: 5, color: '#F59E0B' }
                ],
                topicMastery: [
                    { subject: 'Math', score: 88 },
                    { subject: 'Physics', score: 76 },
                    { subject: 'Chemistry', score: 82 },
                    { subject: 'Biology', score: 90 },
                    { subject: 'English', score: 95 }
                ],
                studentEngagement: [
                    { day: 'Mon', active: 45 }, { day: 'Tue', active: 52 }, { day: 'Wed', active: 48 },
                    { day: 'Thu', active: 60 }, { day: 'Fri', active: 55 }
                ],
                overview: {
                    totalStudents: 120,
                    completedLessons: 45,
                    totalHours: 128,
                    assignmentsGraded: 350
                }
            };
        }
    });

    if (isLoading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-display">Analytics & Insights</h2>
                    <p className="text-slate-500 font-medium">Monitor performance and generate AI insights</p>
                </div>

                <div className="flex p-1 bg-slate-100 rounded-xl">
                    <button
                        onClick={() => setMode('overview')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'overview' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <LayoutDashboard className="w-4 h-4" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setMode('ai')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${mode === 'ai' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <Sparkles className="w-4 h-4" />
                        AI Analysis
                    </button>
                </div>
            </div>

            {mode === 'ai' ? (
                <DataAnalysisTab />
            ) : (
                <>
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <Card className="border-none shadow-sm shadow-indigo-100">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                    <Users className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-400">Total Students</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{stats?.overview.totalStudents}</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm shadow-teal-100">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center text-[#0D5355]">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-400">Lessons Done</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{stats?.overview.completedLessons}</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm shadow-amber-100">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-400">Teaching Hours</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{stats?.overview.totalHours}h</h3>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-none shadow-sm shadow-blue-100">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                    <FileCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-400">Graded Assig.</p>
                                    <h3 className="text-2xl font-bold text-slate-900">{stats?.overview.assignmentsGraded}</h3>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Performance Trend */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-slate-800">Performance Trend</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={stats?.performanceTrend}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} dy={10} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            />
                                            <Line type="monotone" dataKey="avg" stroke="#4F46E5" strokeWidth={3} dot={{ fill: '#4F46E5', strokeWidth: 2, r: 4, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Topic Mastery */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-slate-800">Subject Mastery Avg.</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats?.topicMastery} layout="vertical" margin={{ left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontWeight: 600 }} width={80} />
                                            <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                            <Bar dataKey="score" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Attendance Distribution */}
                        <Card className="border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-slate-800">Attendance Overview</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px] w-full flex items-center justify-center">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={stats?.attendanceDist}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                            >
                                                {stats?.attendanceDist.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="flex justify-center gap-4 mt-2">
                                    {stats?.attendanceDist.map((item: any, i: number) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs font-bold text-slate-600">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Engagement */}
                        <Card className="border-none shadow-sm lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold text-slate-800">Weekly Engagement Activity</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px] w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats?.studentEngagement}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B' }} />
                                            <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                            <Bar dataKey="active" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
}
