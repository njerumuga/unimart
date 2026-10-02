import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import AdvertiseModal from "./AdvertiseModal";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("soko_theme") === "dark";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("soko_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("soko_theme", "light");
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* Sticky Dark Top-Bar (Deep Midnight Blue #0F172A) */}
      <nav className="sticky top-0 z-40 bg-[#0F172A] text-white shadow-md border-b border-slate-800">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-95">
            <div className="rounded-xl bg-[#2563EB] p-1.5 shadow-sm flex items-center justify-center">
              <div className="rounded-lg bg-white px-2 py-0.5 text-[10px] font-black text-[#0F172A]">
                SH
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tight text-white md:text-xl">
                Soko<span className="text-[#2563EB]">Hub</span>
              </span>
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400">
                CAMPUS MARKETPLACE
              </span>
            </div>
          </Link>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Advertise Button (Energetic Orange High-Action CTA) */}
            <button
              onClick={() => setIsAdModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-[#F97316] hover:bg-[#EA580C] text-white px-3.5 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
            >
              <span>📢</span>
              <span>ADVERTISE</span>
            </button>

            {/* Dark Mode Toggle (Moon) */}
            <button
              onClick={toggleDarkMode}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition active:scale-90"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </button>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-4 pl-2 border-l border-slate-700">
              <Link
                to="/post"
                className="text-xs font-black uppercase text-slate-200 hover:text-[#2563EB] transition flex items-center gap-1"
              >
                <span>+</span> Post Item
              </Link>

              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="text-xs font-black text-[#2563EB] hover:text-blue-400 transition"
                  >
                    {user.displayName?.split(" ")[0] || "Profile"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-[10px] font-bold uppercase text-slate-400 hover:text-white transition"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Advertise Modal */}
      <AdvertiseModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
      />
    </>
  );
}
