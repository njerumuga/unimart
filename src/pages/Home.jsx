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
        <div className="min-h-screen bg-[#f9fffb] dark:bg-[#111827] pb-24">
            {/* Top Green Hero Banner */}
            <header className="bg-[#00a651] pt-6 pb-12 px-4 sm:px-6 md:px-12 text-center text-white space-y-4">
                <div className="max-w-3xl mx-auto space-y-3">
                    <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight uppercase">
                        THE MERU MARKETPLACE.
                    </h1>
                    <p className="max-w-xl mx-auto text-xs sm:text-sm text-green-50 font-medium">
                        Buy, sell, and trade electronics, hostel goods, books, and services across Meru campus. Safe. Local. Verified.
                    </p>

                    {/* Search Bar */}
                    <div className="max-w-xl mx-auto pt-2">
                        <div className="relative flex items-center bg-white rounded-full shadow-lg overflow-hidden p-1.5">
                            <span className="pl-3.5 pr-2 text-gray-400 text-base">🔍</span>
                            <input
                                type="text"
                                placeholder="Search phones, laptops, hostels, notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-2 px-1 text-xs sm:text-sm font-semibold text-gray-800 outline-none placeholder-gray-400"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="px-3 text-xs font-bold text-gray-400 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Category Chips in Hero */}
                    <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar pt-2">
                        {quickChips.map((chip) => (
                            <button
                                key={chip.category}
                                onClick={() => setSelectedCategory(chip.category)}
                                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-black transition-all ${
                                    selectedCategory === chip.category
                                        ? "bg-white text-[#00a651] shadow-md scale-105"
                                        : "bg-white/20 hover:bg-white/30 text-white"
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
                {/* Horizontal Category Selector */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar bg-white dark:bg-[#1f2937] p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    {["All", ...categories].map((c) => (
                        <button
                            key={c}
                            onClick={() => setSelectedCategory(c)}
                            className={`whitespace-nowrap rounded-xl px-4 py-2 text-xs font-black transition-all ${
                                selectedCategory === c
                                    ? "bg-[#00a651] text-white shadow-sm"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                {/* View Mode & Area Controls Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                    <p className="text-xs font-bold text-gray-600 dark:text-gray-400">
                        {viewMode === "bundled"
                            ? `${sellerBundles.length} Seller Stores (${filteredItems.length} items)`
                            : `${filteredItems.length} Listings found`}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap">
                        {/* View Toggle */}
                        <div className="flex items-center bg-gray-200 dark:bg-gray-800 p-1 rounded-xl">
                            <button
                                onClick={() => setViewMode("bundled")}
                                className={`px-3 py-1.5 text-[11px] font-black uppercase rounded-lg transition ${
                                    viewMode === "bundled"
                                        ? "bg-[#00a651] text-white shadow-sm"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
                                }`}
                            >
                                👥 BY SELLER
                            </button>
                            <button
                                onClick={() => setViewMode("single")}
                                className={`px-3 py-1.5 text-[11px] font-black uppercase rounded-lg transition ${
                                    viewMode === "single"
                                        ? "bg-[#00a651] text-white shadow-sm"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900"
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
                                className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#1f2937] px-3 py-1.5 text-xs font-black text-gray-700 dark:text-gray-300 outline-none shadow-sm"
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
                        <div className="w-10 h-10 border-4 border-[#00a651] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading campus listings...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="rounded-[32px] bg-white dark:bg-[#1f2937] p-12 text-center border border-gray-100 dark:border-gray-800 shadow-sm space-y-4 max-w-md mx-auto">
                        <div className="w-14 h-14 rounded-full bg-green-50 text-2xl flex items-center justify-center mx-auto">
                            🔍
                        </div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">No Listings Found</h3>
                        <p className="text-xs text-gray-500">
                            Try selecting another category or area zone.
                        </p>
                        <div className="pt-2 flex justify-center gap-3">
                            <button
                                onClick={() => {
                                    setSelectedCategory("All");
                                    setSelectedLocation("All");
                                    setSearchQuery("");
                                }}
                                className="rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2 text-xs font-black uppercase"
                            >
                                Reset
                            </button>
                            <Link
                                to="/post"
                                className="rounded-2xl bg-[#00a651] hover:bg-emerald-600 text-white px-5 py-2 text-xs font-black uppercase shadow-sm"
                            >
                                Post Item
                            </Link>
                        </div>
                    </div>
                ) : viewMode === "bundled" ? (
                    /* Bundled by Seller Grid (Image 5) */
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
