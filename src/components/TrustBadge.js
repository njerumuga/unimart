// src/components/TrustBadge.js
import React from "react";

export default function TrustBadge({ type = "verified", text = "" }) {
    const badges = {
        verified: {
            bg: "bg-blue-50 dark:bg-blue-900/30",
            text: "text-[#2563EB] dark:text-blue-400",
            border: "border border-blue-200/60 dark:border-blue-800/60",
            dot: "bg-[#22C55E]",
            label: text || "Verified",
            icon: "✓",
        },
        student: {
            bg: "bg-indigo-50 dark:bg-indigo-900/30",
            text: "text-[#4F46E5] dark:text-indigo-400",
            border: "border border-indigo-200/60 dark:border-indigo-800/60",
            dot: "bg-[#4F46E5]",
            label: text || "Verified Student",
            icon: "🎓",
        },
        trusted: {
            bg: "bg-amber-50 dark:bg-amber-900/30",
            text: "text-amber-700 dark:text-amber-400",
            border: "border border-amber-200/60 dark:border-amber-800/60",
            dot: "bg-amber-500",
            label: text || "Trusted Seller",
            icon: "★",
        },
        mpesa: {
            bg: "bg-emerald-50 dark:bg-emerald-900/30",
            text: "text-emerald-700 dark:text-emerald-400",
            border: "border border-emerald-200/60 dark:border-emerald-800/60",
            dot: "bg-[#22C55E]",
            label: text || "M-Pesa Verified",
            icon: "📱",
        },
    };

    const current = badges[type] || badges.verified;

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${current.bg} ${current.text} ${current.border}`}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${current.dot} inline-block animate-pulse`}></span>
            <span>{current.label}</span>
        </span>
    );
}
