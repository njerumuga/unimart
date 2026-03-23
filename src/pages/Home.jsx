import React, { useEffect, useMemo, useState } from "react";
import ItemCard from "../components/ItemCard";
import { db } from "../firebase";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { categories } from "../data/categories";

export default function Home() {
    const [items, setItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const { isAdmin } = useAuth();

    useEffect(() => {
        const q = query(
            collection(db, "items"),
            orderBy("isFeatured", "desc"),
            orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const arr = snap.docs.map((d) => ({
                id: d.id,
                isFeatured: d.data().isFeatured ?? false,
                isApproved: d.data().isApproved ?? true,
                ...d.data(),
            }));

            const visibleItems = isAdmin ? arr : arr.filter((item) => item.isApproved);
            setItems(visibleItems);
        });

        return () => unsub();
    }, [isAdmin]);

    const handleApproval = async (id, approved) => {
        try {
            const ref = doc(db, "items", id);
            await updateDoc(ref, { isApproved: approved });
            alert(approved ? "✅ Item approved" : "❌ Item rejected");
        } catch (err) {
            console.error("⚠️ Error updating item:", err);
            alert("Error: " + err.message);
        }
    };

    const filteredItems = useMemo(() => {
        if (selectedCategory === "All") return items;
        return items.filter((item) => item.category === selectedCategory);
    }, [items, selectedCategory]);

    const featuredItems = filteredItems.filter((item) => item.isFeatured);
    const latestItems = filteredItems;

    return (
        <div className="bg-soko-cream">
            <section className="bg-gradient-to-r from-soko-dark via-green-900 to-soko-dark text-white">
                <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-12">
                    <div className="mb-5 flex items-center justify-between">
                        <h2 className="text-2xl font-extrabold text-soko-yellow md:text-3xl">
                            Categories
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-7">
                        {["All", ...categories].map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`rounded-xl border px-4 py-4 text-center text-sm font-semibold transition ${
                                    selectedCategory === category
                                        ? "border-soko-yellow bg-soko-yellow text-soko-dark"
                                        : "border-white/10 bg-white/10 text-white hover:-translate-y-1 hover:bg-white/20"
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {featuredItems.length > 0 && (
                <section className="mx-auto max-w-7xl px-4 pb-4 pt-10 md:px-6">
                    <div className="mb-6">
                        <h2 className="text-2xl font-extrabold text-soko-dark md:text-3xl">
                            Featured Listings
                        </h2>
                        <p className="mt-2 text-soko-muted">
                            Highlighted picks from the marketplace.
                        </p>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {featuredItems.map((item) => (
                            <div key={item.id}>
                                <ItemCard item={item} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
                <div className="mb-6">
                    <h2 className="text-2xl font-extrabold text-soko-dark md:text-3xl">
                        {selectedCategory === "All"
                            ? "Latest Listings"
                            : `${selectedCategory} Listings`}
                    </h2>
                    <p className="mt-2 text-soko-muted">
                        Fresh posts from the SokoHub community.
                    </p>
                </div>

                {latestItems.length === 0 ? (
                    <div className="rounded-2xl border border-yellow-100 bg-white p-10 text-center shadow-soft">
                        <p className="text-base text-soko-muted">
                            {isAdmin
                                ? "No items yet — waiting for users to post."
                                : "No approved items yet — check back soon."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {latestItems.map((item) => (
                            <div key={item.id} className="space-y-3">
                                <ItemCard item={item} />

                                {isAdmin && (
                                    <div className="rounded-2xl border border-yellow-100 bg-white p-4 shadow-soft">
                                        {!item.isApproved ? (
                                            <div className="flex gap-3">
                                                <button
                                                    className="flex-1 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white hover:bg-green-700"
                                                    onClick={() => handleApproval(item.id, true)}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="flex-1 rounded-xl bg-red-600 px-4 py-3 font-semibold text-white hover:bg-red-700"
                                                    onClick={() => handleApproval(item.id, false)}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="inline-block rounded-full bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
                        Approved ✅
                      </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}