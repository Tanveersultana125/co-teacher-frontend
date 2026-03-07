import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    GraduationCap,
    Clock,
    FileBox,
    MessageSquare,
    ChevronLeft,
    Search,
    Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { Input } from "@/components/ui/input";

const AppLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const menuItems = [
        { name: "Dashboard", icon: LayoutDashboard, href: "/app/dashboard" },
        { name: "Lesson Plans", icon: BookOpen, href: "/app/lesson-plans" },
        { name: "Assignments", icon: FileBox, href: "/app/assignments" },
        { name: "Assessments", icon: ClipboardList, href: "/app/assessments" },
        { name: "Students", icon: Users, href: "/app/students" },
        { name: "Attendance", icon: Clock, href: "/app/attendance" },
        { name: "Resources", icon: ClipboardList, href: "/app/resources" },
        { name: "Messages", icon: MessageSquare, href: "/app/messages" },
        { name: "Settings", icon: Settings, href: "/app/settings" },
    ];

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-100 transition-all duration-300
                ${collapsed ? "w-20" : "w-72"}
                ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <div className="flex flex-col h-full">
                    {/* Header */}
                    <div className="p-6 flex items-center justify-between">
                        <Link to="/" className="flex items-center gap-2 group overflow-hidden whitespace-nowrap">
                            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                                <img src="/aicoteacher.png" alt="Co-Teacher Logo" className="w-8 h-8 object-contain" />
                            </div>
                            {!collapsed && (
                                <span className="font-display font-bold text-2xl tracking-tighter text-slate-900 animate-fade-in">
                                    Co-Teacher
                                </span>
                            )}
                        </Link>
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            className="hidden lg:flex p-1.5 rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors"
                        >
                            <ChevronLeft className={`w-5 h-5 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
                        </button>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                        {menuItems.map((item) => (
                            <Link
                                key={item.name}
                                to={item.href}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all group relative
                                    ${location.pathname === item.href
                                        ? "bg-primary text-white shadow-lg shadow-primary/20"
                                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}
                                `}
                            >
                                <item.icon className={`w-5 h-5 shrink-0 ${location.pathname === item.href ? "text-white" : "text-slate-400 group-hover:text-slate-900"}`} />
                                {!collapsed && <span className="font-bold text-[15px]">{item.name}</span>}
                                {collapsed && (
                                    <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                        {item.name}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* Profile */}
                    <div className="p-4 border-t border-slate-100">
                        <div className={`p-3 rounded-2xl ${collapsed ? "" : "bg-slate-50"} flex items-center gap-3 mb-2`}>
                            <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black shrink-0">
                                {user?.name?.charAt(0) || "T"}
                            </div>
                            {!collapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-slate-900 text-sm truncate">{user?.name || "Teacher"}</p>
                                    <p className="text-slate-500 text-xs truncate capitalize">{user?.role?.toLowerCase() || "Pro Account"}</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all group"
                        >
                            <LogOut className="w-5 h-5 shrink-0" />
                            {!collapsed && <span className="font-bold text-sm">Sign out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${collapsed ? "lg:ml-20" : "lg:ml-72"}`}>
                {/* Navbar */}
                <header className="h-20 bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            className="lg:hidden p-2 -ml-2 text-slate-500"
                            onClick={() => setMobileOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <div className="max-w-md w-full relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="Search everything..."
                                className="pl-10 h-11 bg-slate-50 border-transparent focus-visible:bg-white transition-all rounded-xl"
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <div className="flex-1 overflow-y-auto p-8 lg:p-12">
                    <Outlet />
                </div>
            </main>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}
        </div>
    );
};

export default AppLayout;
