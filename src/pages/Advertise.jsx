import React from "react";
import { Link } from "react-router-dom";

export default function Advertise() {
    const adminPhone = "254704196402";
    const waUrl = `https://wa.me/${adminPhone}?text=${encodeURIComponent(
        "Hi SokoHub Admin, I would like to advertise my business / boost my product listings on SokoHub Meru."
    )}`;

    return (
        <div className="min-h-screen bg-[#f9fffb] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-12">
                {/* Hero Header */}
                <div className="text-center space-y-4">
                    <div className="inline-flex rounded-full bg-green-100 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-[#00a651]">
                        📢 SokoHub Ad Solutions
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight uppercase italic">
                        Reach Thousands of <span className="text-[#00a651]">Campus Buyers</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-600">
                        Promote your hostels, electronics, fashion, food delivery, or campus services directly to Meru University students and local residents.
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-[32px] bg-white p-6 sm:p-8 border border-gray-100 shadow-soft space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-green-50 text-2xl flex items-center justify-center text-[#00a651]">
                            🎯
                        </div>
                        <h3 className="text-lg font-black text-gray-900">Targeted Audience</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Direct exposure to active students living in Main Gate, Nchiru, Kunene, Kaithe, Kianjai, and campus hostels.
                        </p>
                    </div>

                    <div className="rounded-[32px] bg-white p-6 sm:p-8 border border-gray-100 shadow-soft space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-yellow-50 text-2xl flex items-center justify-center text-[#ffb800]">
                            ⚡
                        </div>
                        <h3 className="text-lg font-black text-gray-900">Instant WhatsApp Leads</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Interested buyers connect with you one-on-one on WhatsApp with a single tap, leading to faster deals and transactions.
                        </p>
                    </div>

                    <div className="rounded-[32px] bg-white p-6 sm:p-8 border border-gray-100 shadow-soft space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-2xl flex items-center justify-center text-emerald-600">
                            ⭐
                        </div>
                        <h3 className="text-lg font-black text-gray-900">Priority Placement</h3>
                        <p className="text-xs text-gray-600 leading-relaxed">
                            Pin your listings to the top of the home page and category feeds with verified trust badges for maximum visibility.
                        </p>
                    </div>
                </div>

                {/* Ad Options Showcase */}
                <div className="rounded-[32px] bg-white p-8 sm:p-10 border border-gray-100 shadow-soft">
                    <h2 className="text-2xl font-black text-gray-900 text-center mb-8">
                        Promotion Packages
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-2xl bg-[#f9fffb] border-2 border-green-200 p-6 space-y-4 flex flex-col justify-between">
                            <div>
                                <span className="bg-[#00a651] text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                                    Popular
                                </span>
                                <h3 className="text-xl font-black text-gray-900 mt-2">
                                    ⭐ Featured Item Booster
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">
                                    Pin your specific product listing to the top of the SokoHub home feed for 7 to 30 days.
                                </p>
                                <ul className="mt-4 space-y-2 text-xs font-semibold text-gray-700">
                                    <li className="flex items-center gap-2">✓ Gold "Featured" badge on listing</li>
                                    <li className="flex items-center gap-2">✓ Priority placement above regular listings</li>
                                    <li className="flex items-center gap-2">✓ Instant WhatsApp buyer notifications</li>
                                </ul>
                            </div>
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full text-center rounded-2xl bg-[#00a651] hover:bg-emerald-600 text-white py-3.5 text-xs font-black uppercase tracking-widest shadow-md transition"
                            >
                                Inquire via WhatsApp
                            </a>
                        </div>

                        <div className="rounded-2xl bg-[#f9fffb] border-2 border-[#ffb800] p-6 space-y-4 flex flex-col justify-between">
                            <div>
                                <span className="bg-[#ffb800] text-black text-[10px] font-black uppercase px-2.5 py-1 rounded-full">
                                    Campus Businesses
                                </span>
                                <h3 className="text-xl font-black text-gray-900 mt-2">
                                    📢 Banner & Business Spotlight
                                </h3>
                                <p className="text-xs text-gray-600 mt-1">
                                    Promote your hostel rentals, food delivery, printing services, salon, or cyber café across all pages.
                                </p>
                                <ul className="mt-4 space-y-2 text-xs font-semibold text-gray-700">
                                    <li className="flex items-center gap-2">✓ Header banner placement</li>
                                    <li className="flex items-center gap-2">✓ Verified Business trust badge</li>
                                    <li className="flex items-center gap-2">✓ Direct social & phone links</li>
                                </ul>
                            </div>
                            <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full text-center rounded-2xl bg-[#ffb800] hover:bg-yellow-400 text-black py-3.5 text-xs font-black uppercase tracking-widest shadow-md transition"
                            >
                                Book Business Promo
                            </a>
                        </div>
                    </div>
                </div>

                {/* Direct Contact Banner */}
                <div className="rounded-[32px] bg-[#00a651] text-white p-8 sm:p-10 text-center space-y-4 border-4 border-[#ffb800] shadow-soft">
                    <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                        Ready to boost your sales today?
                    </h3>
                    <p className="text-xs sm:text-sm text-green-100 max-w-lg mx-auto">
                        Talk with the SokoHub Meru administration team to get custom advertising rates and same-day activation.
                    </p>
                    <div className="pt-2 flex flex-wrap justify-center gap-4">
                        <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-2xl bg-white hover:bg-green-50 text-[#00a651] font-black uppercase tracking-widest px-8 py-4 text-xs shadow-lg transition active:scale-95"
                        >
                            💬 Chat on WhatsApp (+254 704196402)
                        </a>
                        <Link
                            to="/post"
                            className="rounded-2xl bg-[#ffb800] hover:bg-yellow-400 text-black font-black uppercase tracking-widest px-8 py-4 text-xs shadow-lg transition active:scale-95"
                        >
                            Post Free Listing First
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
