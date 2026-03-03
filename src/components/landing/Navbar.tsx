import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
// import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/common/Logo";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const isAuthenticated = !!user;

  const navLinks = [
    { name: "Teachers", href: "/for-teachers" },
    { name: "Pricing", href: "/pricing" },
    { name: "Contact us", href: "/contact" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#245D67] shadow-sm">
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo className="w-10 h-10 bg-[#347681] rounded-xl shadow-md p-1" />
            <span className="font-display font-bold text-xl md:text-2xl text-white">
              AI Co-teacher
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="text-sm font-semibold text-white/90 hover:text-white transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard" className="bg-white hover:bg-white/90 text-[#245D67] rounded-xl px-6 py-2.5 font-bold shadow-lg text-sm transition-all hover:scale-105">Go to Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="text-white hover:text-white/80 px-4 py-2 font-semibold text-sm">Log In</Link>
                <Link to="/signup" className="bg-white hover:bg-white/90 text-[#245D67] rounded-xl px-6 py-2.5 font-bold shadow-lg text-sm transition-all hover:scale-105">Sign up free</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-slate-100 shadow-2xl overflow-hidden glass"
          >
            <div className="px-6 py-8 space-y-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className="block text-lg font-bold text-slate-800 hover:text-[#1A3263]"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-6 space-y-4 border-t border-slate-100">
                {isAuthenticated ? (
                  <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block w-full text-center bg-[#1A3263] text-white rounded-xl py-4 font-bold shadow-xl shadow-[#1A3263]/20">Go to Dashboard</Link>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsOpen(false)} className="block w-full text-center text-slate-800 py-2 font-bold text-lg">Log In</Link>
                    <Link to="/signup" onClick={() => setIsOpen(false)} className="block w-full text-center bg-[#1A3263] text-white rounded-xl py-4 font-bold shadow-xl shadow-[#1A3263]/20">Sign up free</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav >
  );
};

export default Navbar;
