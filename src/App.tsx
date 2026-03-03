import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

import { Suspense, lazy } from "react";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const StudentDashboard = lazy(() => import("./pages/StudentDashboard"));
const ParentDashboard = lazy(() => import("./pages/ParentDashboard"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ForTeachers = lazy(() => import("./pages/ForTeachers"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutes of "freshness"
      gcTime: 1000 * 60 * 60,    // Keep in cache for 1 hour
      refetchOnWindowFocus: false, // Don't refetch when switching tabs
      refetchOnReconnect: false,   // Don't refetch on net reconnect
      retry: 1,                    // Only retry once if failed
    }
  }
});

// PART 2: Block UI until Auth Resolves & PART 3: Routing Logic
const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <Routes>
        {/* Public Routes */}
        <Route path="/test" element={<Dashboard />} />
        <Route path="/" element={<Index />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/for-teachers" element={<ForTeachers />} />

        {/* Auth Routes - Redirect to dashboard if logged in */}
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/dashboard" replace />} />

        {/* Protected Routes - Show Login if null */}
        <Route path="/dashboard" element={user ? <TeacherDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/student" element={user ? <StudentDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/parent" element={user ? <ParentDashboard /> : <Navigate to="/login" replace />} />
        <Route path="/quiz/:id" element={user ? <QuizPage /> : <Navigate to="/login" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
