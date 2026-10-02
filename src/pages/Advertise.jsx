import React from "react";
import { Link } from "react-router-dom";

export default function Advertise() {
    const adminPhone = "254704196402";
    const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
        "Hi SokoHub Admin, I would like to advertise my business / boost my product listings on SokoHub Meru."
    )}`;

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Hero Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex rounded-full bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-300 border border-blue-200/60 dark:border-blue-800">
                        📢 SokoHub Ad Solutions
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-[#0F172A] dark:text-white tracking-tight uppercase">
                        Reach Thousands of <span className="text-[#2563EB]">Campus Buyers</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-300">
                        Promote your hostels, electronics, fashion, food delivery, or campus services directly to Meru University students and local residents.
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-2xl flex items-center justify-center text-[#2563EB]">
                            🎯
                        </div>
                        <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">Targeted Audience</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Direct exposure to active students living in Main Gate, Nchiru, Kunene, Kaithe, Kianjai, and campus hostels.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-2xl flex items-center justify-center text-[#F97316]">
                            ⚡
                        </div>
                        <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">Instant WhatsApp Leads</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Interested buyers connect with you one-on-one on WhatsApp with a single tap, leading to faster deals and transactions.
                        </p>
                    </div>

                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-3">
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-2xl flex items-center justify-center text-[#22C55E]">
                            ⭐
                        </div>
                        <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">Priority Placement</h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            Pin your listings to the top of the home page and category feeds with verified trust badges for maximum visibility.
                        </p>
                    </div>
                </div>

                {/* Ad Options Showcase */}
                <div className="rounded-2xl bg-white dark:bg-slate-800 p-8 sm:p-10 border border-slate-200/80 dark:border-slate-700 shadow-sm">
                    <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white text-center mb-8">
                        Promotion Packages
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-orange-200 dark:border-orange-800/60 p-6 space-y-4 flex flex-col justify-between">
                            <div>
                                <span className="bg-[#F97316] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                                    Popular
                                </span>
                                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mt-2">
                                    ⭐ Featured Item Booster
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                    Pin your specific product listing to the top of the SokoHub home feed for 7 to 30 days.
                                </p>
                                <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    <li className="flex items-center gap-2">✓ Featured badge on listing</li>
                                    <li className="flex items-center gap-2">✓ Priority placement above regular listings</li>
                                    <li className="flex items-center gap-2">✓ Instant WhatsApp buyer notifications</li>
                                </ul>
                            </div>
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full text-center rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white py-3.5 text-xs font-black uppercase tracking-wider shadow-md transition"
                            >
                                Inquire via WhatsApp
                            </a>
                        </div>

                        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-blue-200 dark:border-blue-800/60 p-6 space-y-4 flex flex-col justify-between">
                            <div>
                                <span className="bg-[#2563EB] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                                    Campus Businesses
                                </span>
                                <h3 className="text-xl font-bold text-[#0F172A] dark:text-white mt-2">
                                    📢 Banner & Business Spotlight
                                </h3>
                                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                                    Promote your hostel rentals, food delivery, printing services, salon, or cyber café across all pages.
                                </p>
                                <ul className="mt-4 space-y-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    <li className="flex items-center gap-2">✓ Header banner placement</li>
                                    <li className="flex items-center gap-2">✓ Verified Business trust badge</li>
                                    <li className="flex items-center gap-2">✓ Direct social & phone links</li>
                                </ul>
                            </div>
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full text-center rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white py-3.5 text-xs font-black uppercase tracking-wider shadow-md transition"
                            >
                                Book Business Promo
                            </a>
                        </div>
                    </div>
                </div>

                {/* Direct Contact Banner */}
                <div className="rounded-2xl bg-[#0F172A] text-white p-8 sm:p-10 text-center space-y-4 border border-slate-700 shadow-md">
                    <h3 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight">
                        Ready to boost your campus sales?
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto">
                        Talk with the SokoHub Meru administration team to get custom advertising rates and same-day activation.
                    </p>
                    <div className="pt-2 flex flex-wrap justify-center gap-4">
                        <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white font-bold uppercase tracking-wider px-8 py-3.5 text-xs shadow-md transition active:scale-95"
                        >
                            💬 Chat on WhatsApp (+254 704196402)
                        </a>
                        <Link
                            to="/post"
                            className="rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold uppercase tracking-wider px-8 py-3.5 text-xs transition active:scale-95"
                        >
                            Post Free Listing First
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
