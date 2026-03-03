import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2, AlertCircle, School } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/store/authStore";
import api from "@/api/client";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await api.post("/auth/register", { name, email, password, role: "TEACHER" });
      setAuth(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed. Try a different email.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex overflow-hidden">
      {/* Left Side - Visual */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative p-12 flex-col justify-between overflow-hidden">
        <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-primary rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 blur-[100px]" />

        <Link to="/" className="relative z-10 flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <GraduationCap className="w-6 h-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white tracking-tighter">Co-Teacher</span>
        </Link>

        <div className="relative z-10 space-y-12">
          <div className="space-y-4">
            <h2 className="text-5xl font-extrabold text-white leading-tight font-display tracking-tight">
              Start your journey <br /> to <span className="text-primary italic">effortless</span> teaching.
            </h2>
            <p className="text-slate-400 text-xl font-medium max-w-md">Join 5,000+ teachers transforming the classroom experience with AI.</p>
          </div>

          <div className="space-y-6">
            {[
              { title: "Personalized Support", desc: "AI tailored to your curriculum style." },
              { title: "Ethical AI", desc: "Built with student data privacy at the core." },
              { title: "Collaborative Tools", desc: "Share resources with your entire school." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 mt-1">
                  <ArrowRight className="w-3 h-3 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{item.title}</h4>
                  <p className="text-slate-500 text-xs font-bold leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-4 py-8 px-6 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 max-w-sm">
          <div className="flex -space-x-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">User</div>
            ))}
          </div>
          <p className="text-white font-bold text-xs uppercase tracking-widest opacity-60">+20 Teachers joined today</p>
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
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tighter">Create your teacher account</h1>
            <p className="text-slate-500 font-bold mt-3">Free for individuals, forever. No credit card required.</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
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
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                <Input
                  id="name"
                  placeholder="Prof. Jane Doe"
                  className="h-14 pl-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-primary font-bold transition-all shadow-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="email">Work Email</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="jane@school.edu"
                  className="h-14 pl-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-primary font-bold transition-all shadow-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-black text-slate-400 uppercase tracking-widest" htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  className="h-14 pl-12 pr-12 rounded-2xl bg-white border-slate-200 focus-visible:ring-primary font-bold transition-all shadow-sm"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
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
                <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Creating Account...</>
              ) : (
                <><ArrowRight className="w-5 h-5 mr-2" /> Start Teaching for Free</>
              )}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-slate-500 font-bold">
              Already using Co-Teacher?{" "}
              <Link to="/login" className="text-primary hover:underline font-black italic">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
