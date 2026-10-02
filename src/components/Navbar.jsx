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
      <nav className="sticky top-0 z-40 bg-[#00a651] text-white shadow-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-2.5 transition hover:opacity-95">
            <div className="rounded-lg bg-white p-1 shadow-sm flex items-center justify-center">
              <div className="rounded bg-[#ffb800] px-2 py-0.5 text-[10px] font-black text-black">
                SokoHub
              </div>
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-lg font-black tracking-tight text-white md:text-xl">
                Soko<span className="text-[#ffb800]">Hub</span>
              </span>
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-green-100">
                STUDENT MARKETPLACE
              </span>
            </div>
          </Link>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-3 md:gap-4">
            {/* Advertise Button (Yellow pill with megaphone icon) */}
            <button
              onClick={() => setIsAdModalOpen(true)}
              className="flex items-center gap-1.5 rounded-full bg-[#ffb800] hover:bg-yellow-400 text-black px-3.5 py-1.5 text-[10px] md:text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95"
            >
              <span>📢</span>
              <span>ADVERTISE</span>
            </button>

            {/* Dark Mode Toggle (Moon) */}
            <button
              onClick={toggleDarkMode}
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              className="p-1.5 rounded-full hover:bg-white/10 text-white transition active:scale-90"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            </button>

            {/* Desktop Auth Links */}
            <div className="hidden md:flex items-center gap-4 pl-2 border-l border-white/20">
              <Link
                to="/post"
                className="text-xs font-black uppercase hover:text-[#ffb800] transition"
              >
                + Post Item
              </Link>

              {user ? (
                <div className="flex items-center gap-3">
                  <Link
                    to="/profile"
                    className="text-xs font-black text-[#ffb800] hover:underline"
                  >
                    {user.displayName?.split(" ")[0] || "Profile"}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-[10px] font-bold uppercase text-green-100 hover:text-white"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="text-xs font-black uppercase hover:text-[#ffb800] transition"
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
