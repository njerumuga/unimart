// src/components/TrustBadge.js
import React from "react";

export default function TrustBadge({ type = "verified", text = "" }) {
    const badges = {
        verified: {
            bg: "bg-green-100",
            text: "text-green-800",
            label: text || "Verified",
            icon: "✓",
        },
        student: {
            bg: "bg-blue-100",
            text: "text-blue-800",
            label: text || "Verified Student",
            icon: "🎓",
        },
        trusted: {
            bg: "bg-amber-100",
            text: "text-amber-800",
            label: text || "Trusted Seller",
            icon: "★",
        },
    };

    const current = badges[type] || badges.verified;

    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${current.bg} ${current.text}`}
        >
            <span>{current.icon}</span>
            <span>{current.label}</span>
        </span>
    );
}
