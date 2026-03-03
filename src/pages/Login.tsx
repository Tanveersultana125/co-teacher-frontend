import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext"; // Updated import
import api from "@/api/client";
import { signInWithGoogle } from "@/lib/firebase";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { manualLogin } = useAuth(); // Use context
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });
      // PART 4: AuthProvider will update state. For manual login, we inform the provider.
      manualLogin(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed. Please check your credentials.");
      setIsLoading(false);
    }
    // finally block for validation? We want to keep loading true if it succeeds so UI doesn't flicker before redirect? 
    // But manualLogin is synchronous in our simple implementation, so App.tsx re-renders immediately.
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsLoading(true);
    try {
      // PART 4: Login page must ONLY trigger signInWithPopup
      await signInWithGoogle();
      // DO NOTHING. AuthProvider listener handles the state update.
    } catch (err: any) {
      console.error(err);
      console.error(err);
      const errorCode = err.code || err.message;
      setError(`Google Sign-In failed: ${errorCode}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative p-12 flex-col justify-between overflow-hidden">
        <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-indigo-500 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-[150%] h-[150%] bg-white rounded-full translate-y-1/2 -translate-x-1/2 opacity-10 blur-[120px]" />

        <Link to="/" className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-primary" />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tighter">Co-Teacher</span>
        </Link>

        <div className="relative z-10 space-y-8">
          <blockquote className="text-4xl font-extrabold text-white leading-tight font-display tracking-tight">
            "This tool didn't just save me time, it gave me my passion for teaching back."
          </blockquote>
          <div>
            <p className="text-white font-black text-xl">Dr. Sarah Thompson</p>
            <p className="text-white/60 font-bold uppercase tracking-widest text-xs">Innovation in Education Lead</p>
          </div>
        </div>

        <div className="relative z-10 flex gap-4 opacity-40 grayscale pointer-events-none">
          <div className="text-3xl font-black text-white">CBSE</div>
          <div className="text-3xl font-black text-white">ICSE</div>
          <div className="text-3xl font-black text-white">SSC</div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-24 relative overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Sign in</h1>
            <p className="text-slate-500 font-bold mt-3">Welcome back to your workstation.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-rose-50 border border-rose-100 p-4 rounded-xl flex items-center gap-3 text-rose-600 font-bold text-sm"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="email">Email address</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@school.edu"
                  className="h-14 pl-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-primary font-bold transition-all shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="password">Password</Label>
                <a href="#" className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Forgot?</a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-14 pl-12 pr-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-primary font-bold transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl btn-premium text-lg font-bold shadow-2xl" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Signing in...</>
              ) : (
                <><ArrowRight className="w-5 h-5 mr-2" /> Continue</>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#F8FAFC] px-2 text-slate-400 font-black tracking-widest">Or continue with</span>
            </div>
          </div>

          <Button
            onClick={handleGoogleLogin}
            variant="outline"
            className="w-full h-14 rounded-2xl border-slate-200 font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google Workstation
          </Button>

          <div className="text-center">
            <p className="text-slate-500 font-bold">
              New educator?{" "}
              <Link to="/signup" className="text-primary hover:underline font-black italic">Create an account</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
