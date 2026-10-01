import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    deleteDoc,
} from "firebase/firestore";
import { Link } from "react-router-dom";
import TrustBadge from "../components/TrustBadge";

export default function Profile() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [filterTab, setFilterTab] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, "items"), where("userId", "==", user.uid));
        const unsub = onSnapshot(
            q,
            (snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setItems(list);
                setLoading(false);
            },
            (err) => {
                console.error("Error fetching user profile items:", err);
                setLoading(false);
            }
        );
        return () => unsub();
    }, [user]);

    const handleDeleteItem = async (itemId) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this listing?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, "items", itemId));
        } catch (err) {
            console.error("Failed to delete item:", err);
            alert("Could not delete item: " + err.message);
        }
    };

    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
                <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-3xl mb-4">
                    👤
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                    Log in to view your profile
                </h2>
                <p className="text-sm text-gray-500 max-w-sm mb-6">
                    Manage your active campus listings, view approval status, and track your seller profile.
                </p>
                <Link
                    to="/login"
                    className="rounded-2xl bg-[#00a651] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-md hover:bg-emerald-600 transition"
                >
                    Go to Login
                </Link>
            </div>
        );
    }

    const approvedCount = items.filter((i) => i.isApproved === true).length;
    const pendingCount = items.filter((i) => !i.isApproved).length;
    const featuredCount = items.filter((i) => i.isFeatured === true).length;

    const filteredItems = items.filter((it) => {
        if (filterTab === "approved") return it.isApproved === true;
        if (filterTab === "pending") return !it.isApproved;
        if (filterTab === "featured") return it.isFeatured === true;
        return true;
    });

    const displayName = user.displayName || user.email?.split("@")[0] || "Comrade Seller";
    const initial = displayName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-[#f9fffb] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* User Dashboard Header */}
                <div className="rounded-[32px] bg-white p-6 sm:p-8 border border-gray-100 shadow-soft">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 border-4 border-[#00a651] flex items-center justify-center text-2xl sm:text-3xl font-black text-[#00a651] shadow-inner">
                                {initial}
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                                        {displayName}
                                    </h1>
                                    <TrustBadge type="student" text="Campus Seller" />
                                </div>
                                <p className="text-xs sm:text-sm font-medium text-gray-500 mt-0.5">
                                    {user.email}
                                </p>
                                <div className="mt-2 flex items-center gap-3">
                                    <Link
                                        to={`/seller/${user.uid}`}
                                        className="text-xs font-bold text-[#00a651] hover:underline"
                                    >
                                        🔗 View Public Storefront →
                                    </Link>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <Link
                                to="/post"
                                className="w-full md:w-auto text-center rounded-2xl bg-[#00a651] hover:bg-emerald-600 text-white px-6 py-3.5 text-xs font-black uppercase tracking-widest shadow-md transition active:scale-95"
                            >
                                + Post New Item
                            </Link>
                        </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
                        <div className="rounded-2xl bg-[#f9fffb] p-4 border border-green-100/60">
                            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Listings</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{items.length}</p>
                        </div>
                        <div className="rounded-2xl bg-[#f9fffb] p-4 border border-green-100/60">
                            <p className="text-[10px] font-black uppercase tracking-wider text-[#00a651]">Approved & Live</p>
                            <p className="text-2xl font-black text-[#00a651] mt-1">{approvedCount}</p>
                        </div>
                        <div className="rounded-2xl bg-[#f9fffb] p-4 border border-yellow-100/60">
                            <p className="text-[10px] font-black uppercase tracking-wider text-amber-500">Under Review</p>
                            <p className="text-2xl font-black text-amber-500 mt-1">{pendingCount}</p>
                        </div>
                        <div className="rounded-2xl bg-[#f9fffb] p-4 border border-yellow-100/60">
                            <p className="text-[10px] font-black uppercase tracking-wider text-[#ffb800]">Featured</p>
                            <p className="text-2xl font-black text-gray-900 mt-1">{featuredCount}</p>
                        </div>
                    </div>
                </div>

                {/* Listings Section */}
                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
                            {[
                                { key: "all", label: `All (${items.length})` },
                                { key: "approved", label: `Live (${approvedCount})` },
                                { key: "pending", label: `Pending (${pendingCount})` },
                                { key: "featured", label: `Featured (${featuredCount})` },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setFilterTab(tab.key)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                        filterTab === tab.key
                                            ? "bg-[#00a651] text-white shadow-sm"
                                            : "bg-white text-gray-500 hover:text-[#00a651] border border-gray-100"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-16 text-center">
                            <div className="w-10 h-10 border-4 border-[#00a651] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading listings...</p>
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="rounded-[32px] bg-white p-12 text-center border border-gray-100 shadow-soft space-y-4">
                            <div className="w-16 h-16 rounded-full bg-green-50 text-2xl flex items-center justify-center mx-auto">
                                📦
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No Listings in this category</h3>
                            <p className="text-xs text-gray-500 max-w-sm mx-auto">
                                You don't have any items matching this filter right now.
                            </p>
                            <Link
                                to="/post"
                                className="inline-block rounded-2xl bg-[#ffb800] hover:bg-[#00a651] text-black hover:text-white px-6 py-3 text-xs font-black uppercase tracking-widest transition shadow-sm"
                            >
                                Post a Listing Now
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="group flex flex-col bg-white rounded-[32px] overflow-hidden border border-gray-100 hover:border-[#00a651] shadow-soft transition-all duration-300"
                                >
                                    {/* Image and Overlays */}
                                    <div className="relative aspect-square m-2 overflow-hidden rounded-[24px] bg-gray-100">
                                        <img
                                            src={item.imageUrl || "https://via.placeholder.com/400x400?text=No+Image"}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                                            <div className="bg-black/70 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase backdrop-blur-sm">
                                                📍 {item.locationZone || "Campus"}
                                            </div>
                                        </div>

                                        <div className="absolute top-3 right-3">
                                            {item.isApproved ? (
                                                <span className="bg-green-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase shadow-sm">
                                                    ✓ Live
                                                </span>
                                            ) : (
                                                <span className="bg-amber-500 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase shadow-sm">
                                                    ⏳ Pending
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex flex-col flex-1 p-5 pt-1 space-y-3">
                                        <div>
                                            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gray-400 mb-1">
                                                <span>{item.category || "General"}</span>
                                                {item.condition && (
                                                    <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                                                        {item.condition}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-base line-clamp-1">
                                                {item.title}
                                            </h3>
                                            <p className="text-[#00a651] font-black text-lg mt-0.5">
                                                KSh {Number(item.price || 0).toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Actions */}
                                        <div className="grid grid-cols-2 gap-2 mt-auto pt-3 border-t border-gray-100">
                                            <Link
                                                to={`/item/${item.id}`}
                                                className="text-center bg-[#f9fffb] hover:bg-green-50 text-[#00a651] border border-green-200 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition"
                                            >
                                                View
                                            </Link>
                                            <button
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="text-center bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
