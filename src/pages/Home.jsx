import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom"; 
import ItemCard from "../components/ItemCard";
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
    const [showSecretBtn, setShowSecretBtn] = useState(false); 
    const [loading, setLoading] = useState(true);
    const { isAdmin } = useAuth();

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.shiftKey && (e.key === "A" || e.key === "a")) {
                if (isAdmin) {
                    setShowSecretBtn((prev) => !prev);
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isAdmin]);

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
                // Strictly enforce approval check for non-admin users
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

    return (
        <div className="min-h-screen bg-[#f9fffb] pb-24 relative">
            {showSecretBtn && isAdmin && (
                <Link 
                    to="/admin" 
                    className="fixed bottom-10 right-10 z-[100] animate-bounce rounded-full bg-red-600 px-8 py-5 font-black uppercase tracking-widest text-white shadow-[0_20px_50px_rgba(220,38,38,0.5)] hover:bg-black transition-all"
                >
                    ⚠️ ADMIN DASHBOARD
                </Link>
            )}

            {/* HERO */}
            <header className="relative bg-[#00a651] pt-10 pb-20 px-4 border-b-[6px] border-[#ffb800] overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="relative max-w-5xl mx-auto text-center space-y-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-md px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white border border-white/30">
                        <span>🎓 Meru University Marketplace</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter uppercase italic leading-none">
                        The Meru <span className="text-[#ffb800]">Marketplace.</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-xs sm:text-sm text-green-50 font-medium">
                        Buy, sell, and trade electronics, household goods, books, and services across Meru campus. Safe. Local. Verified.
                    </p>

                    {/* Search Bar in Hero */}
                    <div className="max-w-xl mx-auto pt-2">
                        <div className="relative flex items-center bg-white rounded-2xl shadow-xl overflow-hidden p-1.5 border-2 border-transparent focus-within:border-[#ffb800]">
                            <span className="pl-3 pr-2 text-gray-400 text-lg">🔍</span>
                            <input
                                type="text"
                                placeholder="Search phones, laptops, hostels, notes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full py-2 px-2 text-xs sm:text-sm font-bold text-gray-800 outline-none placeholder-gray-400"
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
                </div>
            </header>

            {/* FILTERS SECTION */}
            <div className="sticky top-[68px] z-40 -mt-6 mb-10 max-w-6xl mx-auto px-4 space-y-3">
                {/* Category Bar */}
                <div className="bg-white border-2 border-[#00a651] rounded-[24px] p-2 shadow-lg flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
                    {["All", ...categories].map((c) => (
                        <button
                            key={c}
                            onClick={() => setSelectedCategory(c)}
                            className={`whitespace-nowrap rounded-[18px] px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
                                selectedCategory === c
                                    ? "bg-[#00a651] text-white shadow-md scale-105"
                                    : "text-gray-400 hover:text-[#00a651] hover:bg-green-50"
                            }`}
                        >
                            {c}
                        </button>
                    ))}
                </div>

                {/* Location Filter Dropdown Bar */}
                <div className="flex items-center justify-between px-2">
                    <p className="text-xs font-bold text-gray-500">
                        {filteredItems.length} {filteredItems.length === 1 ? "Listing" : "Listings"} found
                    </p>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Area:</span>
                        <select
                            value={selectedLocation}
                            onChange={(e) => setSelectedLocation(e.target.value)}
                            className="rounded-xl border border-gray-200 bg-white px-4 py-1.5 text-xs font-bold text-gray-700 outline-none focus:border-[#00a651] shadow-sm"
                        >
                            <option value="All">All Locations</option>
                            {locations.map((loc) => (
                                <option key={loc} value={loc}>
                                    📍 {loc}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
                <div className="flex items-center gap-4 mb-8 px-2">
                    <h2 className="text-2xl font-black text-[#00a651] uppercase italic tracking-tighter">
                       {selectedCategory === "All" ? "Featured Listings" : selectedCategory}
                    </h2>
                    <div className="h-1 flex-1 bg-[#ffb800] rounded-full opacity-30"></div>
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <div className="w-12 h-12 border-4 border-[#00a651] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading campus listings...</p>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="rounded-[32px] bg-white p-12 text-center border border-gray-100 shadow-soft space-y-4 max-w-lg mx-auto">
                        <div className="w-16 h-16 rounded-full bg-green-50 text-2xl flex items-center justify-center mx-auto">
                            🔍
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No Listings Found</h3>
                        <p className="text-xs text-gray-500">
                            Try adjusting your search query, selecting another category, or choosing "All Locations".
                        </p>
                        <div className="pt-2 flex justify-center gap-3">
                            <button
                                onClick={() => {
                                    setSelectedCategory("All");
                                    setSelectedLocation("All");
                                    setSearchQuery("");
                                }}
                                className="rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 text-xs font-black uppercase tracking-wider"
                            >
                                Reset Filters
                            </button>
                            <Link
                                to="/post"
                                className="rounded-2xl bg-[#00a651] hover:bg-emerald-600 text-white px-5 py-2.5 text-xs font-black uppercase tracking-wider shadow-sm"
                            >
                                Post Item
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {filteredItems.map((item) => (
                            <ItemCard key={item.id} item={item} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
