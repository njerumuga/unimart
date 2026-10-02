import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom"; 
import ItemCard from "../components/ItemCard";
import SellerBundleCard from "../components/SellerBundleCard";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { categories } from "../data/categories";
import { locations } from "../data/locations";

export default function Home() {
    const [items, setItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedLocation, setSelectedLocation] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("bundled"); // "bundled" (By Seller) or "single" (All Items)
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();

    const quickChips = [
        { label: "🔥 Laptops", category: "Laptops" },
        { label: "📱 Phones", category: "Phones" },
        { label: "👕 Clothes", category: "Clothes" },
        { label: "🏠 Hostels", category: "Hostels" },
        { label: "📚 Notes", category: "Notes" },
    ];

    useEffect(() => {
        const q = query(
            collection(db, "items"),
            orderBy("isFeatured", "desc"),
            orderBy("createdAt", "desc")
        );
        const unsub = onSnapshot(
            q,
            (snap) => {
                const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                const visibleItems = isAdmin 
                    ? arr 
                    : arr.filter((i) => i.isApproved === true);
                setItems(visibleItems);
                setLoading(false);
            },
            (err) => {
                console.error("Firestore error:", err);
                setLoading(false);
            }
        );
        return () => unsub();
    }, [isAdmin]);

    const filteredItems = useMemo(() => {
        let filtered = items;
        
        if (selectedCategory !== "All") {
            filtered = filtered.filter((item) => item.category === selectedCategory);
        }

        if (selectedLocation !== "All") {
            filtered = filtered.filter((item) => item.locationZone === selectedLocation);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter((item) => 
                (item.title || "").toLowerCase().includes(q) ||
                (item.description || "").toLowerCase().includes(q) ||
                (item.sellerName || "").toLowerCase().includes(q) ||
                (item.category || "").toLowerCase().includes(q) ||
                (item.locationZone || "").toLowerCase().includes(q)
            );
        }

        return filtered;
    }, [items, selectedCategory, selectedLocation, searchQuery]);

    // Group items by Seller into Bundles
    const sellerBundles = useMemo(() => {
        const map = new Map();
        filteredItems.forEach((item) => {
            const sId = item.sellerId || item.userId || item.sellerName || "unknown";
            if (!map.has(sId)) {
                map.set(sId, {
                    sellerId: item.sellerId || item.userId || sId,
                    sellerName: item.sellerName || item.userName || "Campus Comrade",
                    sellerPhone: item.sellerPhone || item.whatsapp || item.phone || "",
                    locationZone: item.locationZone || "Main Gate",
                    items: [],
                });
            }
            map.get(sId).items.push(item);
        });
        return Array.from(map.values());
    }, [filteredItems]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] pb-24">
            {/* Top Hero Banner (Deep Midnight Blue #0F172A) */}
            <header className="bg-[#0F172A] pt-6 pb-12 px-4 sm:px-6 md:px-12 text-center text-white space-y-4 border-b border-slate-800">
                <div className="max-w-3xl mx-auto space-y-3">
                    <div className="inline-flex items-center gap-2 rounded-full bg-blue-950/80 border border-blue-800/60 px-3.5 py-1 text-xs font-bold text-blue-300 mb-1">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse"></span>
                        <span>Meru Campus Student Marketplace</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase">
                        BUY & SELL <span className="text-[#2563EB]">ACROSS CAMPUS.</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-xs sm:text-sm text-slate-300 font-medium">
                        Electronics, hostel goods, fashion, books, and services directly from verified student vendors. Safe. Fast. Local.
                    </p>

                    {/* Mobile-First Sticky / Modern Search Bar */}
                    <div className="max-w-xl mx-auto pt-2">
                        <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-full shadow-md border border-slate-200/80 dark:border-slate-700 overflow-hidden p-1.5 transition-all focus-within:ring-2 focus-within:ring-[#2563EB]">
                            <span className="pl-3.5 pr-2 text-slate-400 text-base">🔍</span>
                            <input
                                type="text"
                                placeholder="Search phones, laptops, hostels, notes, shoes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-2 px-1 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white bg-transparent outline-none placeholder-slate-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="px-2 text-xs font-bold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                >
                                    ✕
                                </button>
                            )}
                            <button
                                onClick={() => {}}
                                className="rounded-full bg-[#2563EB] hover:bg-blue-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition shadow-sm"
                            >
                                Search
                            </button>
                        </div>
                    </div>

                    {/* Quick Category Chips in Hero */}
                    <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar pt-2">
                        {quickChips.map((chip) => (
                            <button
                                key={chip.category}
                                onClick={() => setSelectedCategory(chip.category)}
                                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                                    selectedCategory === chip.category
                                        ? "bg-[#2563EB] text-white shadow-md scale-105"
                                        : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/60"
                                }`}
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Category Selectors & Controls */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-5 space-y-4">
                {/* Scrollable Horizontal Category Navigation Pills */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-700">
                    {["All", ...categories].map((c) => (
                        <button
                            key={c}
                            onClick={() => setSelectedCategory(c)}
                            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                                selectedCategory === c
                                    ? "bg-[#2563EB] text-white shadow-sm font-black"
                                    : "bg-[#F1F5F9] dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 font-semibold"
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                {/* View Mode & Area Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                        {viewMode === "bundled"
                            ? `${sellerBundles.length} Vendor Stores (${filteredItems.length} items)`
                            : `${filteredItems.length} Listings found`}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* View Toggle */}
                        <div className="flex items-center bg-slate-200 dark:bg-slate-800 p-1 rounded-xl border border-slate-300/60 dark:border-slate-700">
                            <button
                                onClick={() => setViewMode("bundled")}
                                className={`px-3 py-1.5 text-[11px] font-black uppercase rounded-lg transition ${
                                    viewMode === "bundled"
                                        ? "bg-[#2563EB] text-white shadow-sm"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                }`}
                            >
                                👥 BY SELLER
                            </button>
                            <button
                                onClick={() => setViewMode("single")}
                                className={`px-3 py-1.5 text-[11px] font-black uppercase rounded-lg transition ${
                                    viewMode === "single"
                                        ? "bg-[#2563EB] text-white shadow-sm"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                }`}
                            >
                                📦 ALL ITEMS
                            </button>
                        </div>

                        {/* Location Select */}
                        <div className="relative">
                            <select
                                value={selectedLocation}
                                onChange={(e) => setSelectedLocation(e.target.value)}
                                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 outline-none shadow-sm cursor-pointer"
                            >
                                <option value="All">AREA: ALL</option>
                                {locations.map((loc) => (
                                    <option key={loc} value={loc}>
                                        📍 {loc}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading campus listings...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="rounded-2xl bg-white dark:bg-slate-800 p-12 text-center border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4 max-w-md mx-auto">
                        <div className="w-14 h-14 rounded-full bg-blue-50 dark:bg-blue-900/30 text-2xl flex items-center justify-center mx-auto text-[#2563EB]">
                            🔍
                        </div>
                        <h3 className="text-base font-bold text-[#0F172A] dark:text-white">No Listings Found</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Try selecting another category or area zone.
                        </p>
                        <div className="pt-2 flex justify-center gap-3">
                            <button
                                onClick={() => {
                                    setSelectedCategory("All");
                                    setSelectedLocation("All");
                                    setSearchQuery("");
                                }}
                                className="rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 px-5 py-2 text-xs font-bold uppercase transition"
                            >
                                Reset
                            </button>
                            <Link
                                to="/post"
                                className="rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white px-5 py-2 text-xs font-black uppercase shadow-sm transition"
                            >
                                Post Item
                            </Link>
                        </div>
                    </div>
                ) : viewMode === "bundled" ? (
                    /* Bundled by Seller Grid */
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sellerBundles.map((bundle) => (
                            <SellerBundleCard key={bundle.sellerId} bundle={bundle} />
                        ))}
                    </div>
                ) : (
                    /* Flat Item Grid */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredItems.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
