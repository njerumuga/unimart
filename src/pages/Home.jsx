import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom"; 
import ItemCard from "../components/ItemCard";
import SellerBundleCard from "../components/SellerBundleCard";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { categories } from "../data/categories";
import { locations } from "../data/locations";
import AdDetailsModal from "../components/AdDetailsModal";
import AdvertiseModal from "../components/AdvertiseModal";

export default function Home() {
    const [items, setItems] = useState([]);
    const [bannersFromBannersCollection, setBannersFromBannersCollection] = useState([]);
    const [bannersFromItemsCollection, setBannersFromItemsCollection] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedLocation, setSelectedLocation] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState("bundled"); // "bundled" (By Seller) or "single" (All Items)
    const [loading, setLoading] = useState(true);
    const [selectedBanner, setSelectedBanner] = useState(null);
    const [isAdvertiseModalOpen, setIsAdvertiseModalOpen] = useState(false);
    const { isAdmin } = useAuth();

    const quickChips = [
        { label: "🔥 Laptops", category: "Laptops" },
        { label: "📱 Phones", category: "Phones" },
        { label: "👕 Clothes", category: "Clothes" },
        { label: "🏠 Hostels", category: "Hostels" },
        { label: "📚 Notes", category: "Notes" },
    ];

    // Listen to items (and extract banners stored in items collection so all users see them)
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

                // 1. Extract active banner items for everyone (guests, regular users, and admins)
                const bannerDocs = arr.filter(
                    (i) => (i.isBanner === true || i.category === "AdBanner" || i.isFeaturedBanner === true) &&
                           i.active !== false
                );
                setBannersFromItemsCollection(bannerDocs);

                // 2. Extract regular product listings
                const productDocs = arr.filter(
                    (i) => !i.isBanner && i.category !== "AdBanner" && !i.isFeaturedBanner
                );
                const visibleItems = isAdmin 
                    ? productDocs 
                    : productDocs.filter((i) => i.isApproved === true);

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

    // Listen to active banners collection
    useEffect(() => {
        let unsubBanners = () => {};
        try {
            const q = query(collection(db, "banners"));
            unsubBanners = onSnapshot(
                q,
                (snap) => {
                    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                    setBannersFromBannersCollection(list);
                },
                (err) => {
                    console.warn("Banners collection query note:", err);
                }
            );
        } catch (err) {
            console.warn("Banner init note:", err);
        }
        return () => unsubBanners();
    }, []);

    // Combine all active banners from both collections and localStorage
    const activeTopBanner = useMemo(() => {
        const combined = [...bannersFromBannersCollection, ...bannersFromItemsCollection];
        const unique = [];
        const seen = new Set();
        for (const b of combined) {
            const key = b.id || b.title;
            if (!seen.has(key)) {
                seen.add(key);
                unique.push(b);
            }
        }
        if (unique.length > 0) return unique[0];

        try {
            const cached = JSON.parse(localStorage.getItem("sokohub_active_banners") || "[]");
            if (cached.length > 0) return cached[0];
        } catch (e) {}

        return null;
    }, [bannersFromBannersCollection, bannersFromItemsCollection]);

    // Filter out items that are marked as banners so they don't pollute product grid
    const nonBannerItems = useMemo(() => {
        return items.filter((i) => !i.isBanner && i.category !== "AdBanner");
    }, [items]);

    const filteredItems = useMemo(() => {
        let filtered = nonBannerItems;
        
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
    }, [nonBannerItems, selectedCategory, selectedLocation, searchQuery]);

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

    const handleBannerClick = () => {
        if (activeTopBanner) {
            setSelectedBanner(activeTopBanner);
        } else {
            setIsAdvertiseModalOpen(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fffb] dark:bg-[#111827] pb-24">
            {/* Top Green Hero Banner */}
            <header className="bg-[#00a651] pt-6 pb-10 px-4 sm:px-6 md:px-12 text-center text-white space-y-4">
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

                    {/* Quick Category Chips */}
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                        {quickChips.map((chip) => (
                            <button
                                key={chip.category}
                                onClick={() => setSelectedCategory(chip.category)}
                                className="rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white transition active:scale-95 border border-white/20"
                            >
                                {chip.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Top Navigation & Filters */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-4 space-y-4">
                {/* 📢 TOP CAMPUS AD / BUSINESS SPOTLIGHT PLACEHOLDER (CLICKABLE) */}
                <div 
                    onClick={handleBannerClick}
                    className="cursor-pointer group relative rounded-[28px] bg-gradient-to-r from-amber-500 via-[#00a651] to-emerald-700 p-0.5 shadow-lg hover:shadow-xl transition-all duration-300 transform active:scale-[0.99]"
                >
                    <div className="rounded-[26px] bg-white dark:bg-gray-800 p-3.5 sm:p-4.5 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
                            {activeTopBanner?.imageUrl ? (
                                <img
                                    src={activeTopBanner.imageUrl}
                                    alt={activeTopBanner.title}
                                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover bg-gray-100 flex-shrink-0 border border-amber-300 shadow-sm"
                                />
                            ) : (
                                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-[#00a651] flex items-center justify-center text-2xl text-white shadow-sm flex-shrink-0 animate-pulse">
                                    📢
                                </div>
                            )}

                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="rounded-full bg-[#ffb800] text-black px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                                        CAMPUS SPOTLIGHT
                                    </span>
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hidden sm:inline">
                                        ⚡ Featured Ad
                                    </span>
                                </div>
                                <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white truncate group-hover:text-[#00a651] transition">
                                    {activeTopBanner?.title || "Boost Your Business or Hostel Here!"}
                                </h3>
                                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                                    {activeTopBanner?.details || activeTopBanner?.description || "Reach 10,000+ campus students daily. Tap to view details or place your ad."}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <span className="inline-flex items-center gap-1.5 rounded-2xl bg-[#00a651] group-hover:bg-emerald-600 text-white px-4 py-2 text-xs font-black uppercase tracking-wider shadow-sm transition">
                                <span>👉</span>
                                <span>{activeTopBanner ? "View Offer" : "Advertise Now"}</span>
                            </span>
                        </div>
                    </div>
                </div>

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
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                }`}
                            >
                                👥 BY SELLER
                            </button>
                            <button
                                onClick={() => setViewMode("single")}
                                className={`px-3 py-1.5 text-[11px] font-black uppercase rounded-lg transition ${
                                    viewMode === "single"
                                        ? "bg-[#00a651] text-white shadow-sm"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
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

            {/* Clickable Ad Details Modal */}
            <AdDetailsModal
                isOpen={Boolean(selectedBanner)}
                onClose={() => setSelectedBanner(null)}
                banner={selectedBanner}
            />

            {/* Advertise Modal */}
            <AdvertiseModal
                isOpen={isAdvertiseModalOpen}
                onClose={() => setIsAdvertiseModalOpen(false)}
            />
        </div>
    );
}
