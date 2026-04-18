import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom"; 
import ItemCard from "../components/ItemCard";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { categories } from "../data/categories";

export default function Home() {
    const [items, setItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [showSecretBtn, setShowSecretBtn] = useState(false); 
    const { isAdmin } = useAuth();

    // ✅ FIXED: Hidden Admin Shortcut Logic
    useEffect(() => {
        const handleKeyDown = (e) => {
            // This console.log helps you verify the keys are being pressed
            // console.log("Key:", e.key, "Shift:", e.shiftKey);

            if (e.shiftKey && (e.key === "A" || e.key === "a")) {
                // Only toggle if the user is actually an admin in the system
                if (isAdmin) {
                    setShowSecretBtn((prev) => !prev);
                } else {
                    console.warn("Shortcut pressed, but user is not an Admin.");
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isAdmin]); // ✅ Crucial: dependency ensures it knows your admin status

    useEffect(() => {
        const q = query(
            collection(db, "items"),
            orderBy("isFeatured", "desc"),
            orderBy("createdAt", "desc")
        );
        const unsub = onSnapshot(q, (snap) => {
            const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            const visibleItems = isAdmin ? arr : arr.filter((i) => i.isApproved);
            setItems(visibleItems);
        });
        return () => unsub();
    }, [isAdmin]);

    const filteredItems = useMemo(() => {
        if (selectedCategory === "All") return items;
        return items.filter((item) => item.category === selectedCategory);
    }, [items, selectedCategory]);

    return (
        <div className="min-h-screen pb-24 relative">
            
            {/* ✅ SECRET ADMIN BUTTON */}
            {showSecretBtn && isAdmin && (
                <Link 
                    to="/admin" 
                    className="fixed bottom-10 right-10 z-[100] animate-bounce rounded-full bg-red-600 px-8 py-5 font-black uppercase tracking-widest text-white shadow-[0_20px_50px_rgba(220,38,38,0.5)] hover:bg-black transition-all"
                >
                    ⚠️ ADMIN DASHBOARD
                </Link>
            )}

            {/* HERO - MUST THEME */}
            <header className="relative bg-[#00a651] pt-24 pb-32 px-4 border-b-[12px] border-[#ffb800]">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                <div className="relative max-w-5xl mx-auto text-center">
                    <h1 className="text-5xl md:text-8xl font-black text-white tracking-tighter mb-6 uppercase italic leading-none">
                        The Comrade <span className="text-[#ffb800]">Market.</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-green-50 font-medium">
                        Buy, sell, and trade second-hand items within your campus community. 
                        Safe. Local. Transparent.
                    </p>
                </div>
            </header>

            {/* CATEGORY BAR */}
            <div className="sticky top-[72px] z-40 -mt-10 mb-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="bg-white border-2 border-[#00a651] rounded-[32px] p-2 shadow-2xl flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth">
                        {["All", ...categories].map((c) => (
                            <button
                                key={c}
                                onClick={() => setSelectedCategory(c)}
                                className={`whitespace-nowrap rounded-[24px] px-8 py-4 text-[11px] font-black uppercase tracking-widest transition-all ${
                                    selectedCategory === c
                                        ? "bg-[#00a651] text-white shadow-lg scale-105"
                                        : "text-gray-400 hover:text-[#00a651] hover:bg-green-50"
                                }`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN GRID */}
            <main className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="flex items-center gap-4 mb-16 px-2">
                    <h2 className="text-3xl font-black text-[#00a651] uppercase italic tracking-tighter">
                       {selectedCategory === "All" ? "Fresh Drops" : selectedCategory}
                    </h2>
                    <div className="h-1 flex-1 bg-[#ffb800] rounded-full opacity-30"></div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">{filteredItems.length} items</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12">
                    {filteredItems.map((item) => (
                        <ItemCard key={item.id} item={item} />
                    ))}
                </div>
            </main>
        </div>
    );
}