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
        className="relative w-full max-w-md rounded-[32px] bg-[#f2eef6] dark:bg-[#1f2937] p-6 sm:p-8 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4">
          <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            <span>🚀</span> Boost Your Campus Sales
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content Cards */}
        <div className="space-y-4 my-4">
          {/* Featured Item Booster Card */}
          <div className="rounded-[24px] bg-[#fef1e3] p-5 border border-amber-200/70 shadow-sm text-left">
            <h4 className="text-sm font-black text-amber-900 flex items-center gap-1.5">
              <span>⭐</span> Featured Item Booster
            </h4>
            <p className="text-xs font-semibold text-amber-800/90 mt-1 leading-relaxed">
              Pin your product listing to top of SokoHub feed for 7 days to get 5x more buyers.
            </p>
          </div>

          {/* Banner & Business Spotlight Card */}
          <div className="rounded-[24px] bg-[#dcf4ef] p-5 border border-emerald-200/70 shadow-sm text-left">
            <h4 className="text-sm font-black text-emerald-950 flex items-center gap-1.5">
              <span>📢</span> Banner & Business Spotlight
            </h4>
            <p className="text-xs font-semibold text-emerald-800/90 mt-1 leading-relaxed">
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
            className="w-full block text-center rounded-[24px] bg-[#00a651] hover:bg-emerald-600 text-white py-4 text-xs font-black uppercase tracking-wider shadow-lg transition-all active:scale-95"
          >
            Chat with Admin (+254704196402)
          </a>

          <div className="text-center">
            <button
              onClick={onClose}
              className="text-xs font-black text-[#00a651] hover:underline uppercase tracking-wider py-1"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
