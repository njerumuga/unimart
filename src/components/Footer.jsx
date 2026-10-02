import React from "react";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="mt-20 border-t-2 border-[#2563EB] bg-[#0F172A] text-white">
            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div className="space-y-3 md:col-span-2">
                        <Link to="/" className="flex items-center gap-2">
                            <div className="rounded-xl bg-[#2563EB] p-1.5 shadow-sm">
                                <div className="rounded-lg bg-white px-2 py-0.5 text-xs font-black text-[#0F172A]">
                                    SH
                                </div>
                            </div>
                            <span className="text-2xl font-black text-white tracking-tight">
                                Soko<span className="text-[#2563EB]">Hub</span>
                            </span>
                        </Link>
                        <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                            The premier verified campus marketplace for Meru University students and surrounding hostels. Buy, sell, trade, and discover local student deals safely.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Marketplace
                        </h4>
                        <ul className="space-y-1.5 text-xs text-slate-400 font-medium">
                            <li>
                                <Link to="/" className="hover:text-[#2563EB] transition">Browse Listings</Link>
                            </li>
                            <li>
                                <Link to="/post" className="hover:text-[#2563EB] transition">Sell an Item</Link>
                            </li>
                            <li>
                                <Link to="/advertise" className="hover:text-[#2563EB] transition">Advertise with Us</Link>
                            </li>
                            <li>
                                <Link to="/profile" className="hover:text-[#2563EB] transition">My Seller Account</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Campus Areas & Support */}
                    <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                            Campus Zones
                        </h4>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            Main Gate • Nchiru • Kunene • Kaithe • Kianjai • Campus Hostels
                        </p>
                        <div className="pt-2">
                            <a
                                href="https://wa.me/254704196402"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#F97316] hover:underline"
                            >
                                💬 WhatsApp Support (+254 704196402)
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
                    <p>© {new Date().getFullYear()} SokoHub Meru • All rights reserved.</p>
                    <p className="font-medium text-slate-500">
                        Built for Meru University Comrades
                    </p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;