import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 py-2 px-6 shadow-lg sm:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Home */}
        <Link
          to="/"
          className={`flex flex-col items-center gap-1 transition ${
            currentPath === "/"
              ? "text-[#2563EB] font-black"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 font-bold"
          }`}
        >
          <div
            className={`p-1.5 rounded-full ${
              currentPath === "/" ? "bg-blue-50 dark:bg-blue-900/30 text-[#2563EB]" : ""
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <span className="text-[10px] tracking-tight">Home</span>
        </Link>

        {/* Sell (+ in energetic orange badge) */}
        <Link
          to="/post"
          className="flex flex-col items-center gap-1 group"
        >
          <div className="bg-[#F97316] hover:bg-[#EA580C] text-white w-12 h-8 rounded-full flex items-center justify-center transition shadow-md -mt-1 active:scale-95">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">Sell</span>
        </Link>

        {/* Profile */}
        <Link
          to="/profile"
          className={`flex flex-col items-center gap-1 transition ${
            currentPath.startsWith("/profile") || currentPath.startsWith("/admin")
              ? "text-[#2563EB] font-black"
              : "text-slate-500 hover:text-slate-900 dark:text-slate-400 font-bold"
          }`}
        >
          <div
            className={`p-1.5 rounded-full ${
              currentPath.startsWith("/profile") || currentPath.startsWith("/admin")
                ? "bg-blue-50 dark:bg-blue-900/30 text-[#2563EB]"
                : ""
            }`}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <span className="text-[10px] tracking-tight">Profile</span>
        </Link>
      </div>
    </div>
  );
}
