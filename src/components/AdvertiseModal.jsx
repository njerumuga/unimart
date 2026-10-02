import React from "react";

export default function AdvertiseModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const adminPhone = "254704196402";
  const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
    "Hi SokoHub Admin, I would like to advertise/boost my business on SokoHub Meru."
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <span>🚀</span> Boost Your Campus Sales
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Cards */}
        <div className="space-y-3.5 my-5">
          {/* Featured Item Booster Card */}
          <div className="rounded-xl bg-orange-50/70 dark:bg-orange-950/20 p-4 border border-orange-200/80 dark:border-orange-800/60 shadow-sm text-left">
            <h4 className="text-xs font-bold text-orange-950 dark:text-orange-300 flex items-center gap-1.5 uppercase tracking-wider">
              <span>⭐</span> Featured Item Booster
            </h4>
            <p className="text-xs font-medium text-orange-900/80 dark:text-orange-200/80 mt-1 leading-relaxed">
              Pin your product listing to the top of SokoHub feed for 7 days to get 5x more buyers.
            </p>
          </div>

          {/* Banner & Business Spotlight Card */}
          <div className="rounded-xl bg-blue-50/70 dark:bg-blue-950/20 p-4 border border-blue-200/80 dark:border-blue-800/60 shadow-sm text-left">
            <h4 className="text-xs font-bold text-blue-950 dark:text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
              <span>📢</span> Banner & Business Spotlight
            </h4>
            <p className="text-xs font-medium text-blue-900/80 dark:text-blue-200/80 mt-1 leading-relaxed">
              Promote hostel rentals, food delivery, printing services, or salon across all pages.
            </p>
          </div>
        </div>

        {/* Chat with Admin Button */}
        <div className="pt-2 space-y-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full block text-center rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white py-3.5 text-xs font-bold uppercase tracking-wider shadow-md transition-all active:scale-95"
          >
            Chat with Admin (+254704196402)
          </a>

          <div className="text-center">
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white uppercase tracking-wider py-1"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
