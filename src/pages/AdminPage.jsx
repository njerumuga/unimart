import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";

export default function AdminPage() {
    const { user, isAdmin } = useAuth();
    const [pendingItems, setPendingItems] = useState([]);
    const [approvedItems, setApprovedItems] = useState([]);
    const [activeTab, setActiveTab] = useState("pending");
    const [searchQuery, setSearchQuery] = useState("");

    // 🕓 Fetch pending (unapproved) items
    useEffect(() => {
        if (!isAdmin) return;

        const q = query(collection(db, "items"), where("isApproved", "==", false));
        const unsub = onSnapshot(q, (snap) => {
            const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setPendingItems(arr);
        });

        return () => unsub();
    }, [isAdmin]);

    // ✅ Fetch approved items
    useEffect(() => {
        if (!isAdmin) return;

        const q = query(collection(db, "items"), where("isApproved", "==", true));
        const unsub = onSnapshot(q, (snap) => {
            const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setApprovedItems(arr);
        });

        return () => unsub();
    }, [isAdmin]);

    // 🔹 Approve or reject item
    const handleDecision = async (id, approved) => {
        const ref = doc(db, "items", id);
        await updateDoc(ref, { isApproved: approved });
        alert(approved ? "✅ Approved and published to SokoHub!" : "❌ Rejected");
    };

    // 🔹 Toggle Featured
    const handleToggleFeatured = async (id, currentFeatured) => {
        const ref = doc(db, "items", id);
        await updateDoc(ref, { isFeatured: !currentFeatured });
        alert(!currentFeatured ? "⭐ Item marked as Featured!" : "Unmarked featured.");
    };

    // 🔹 Delete item permanently
    const handleDelete = async (id) => {
        const confirm = window.confirm("🗑️ Are you sure you want to permanently delete this post?");
        if (!confirm) return;

        try {
            await deleteDoc(doc(db, "items", id));
            alert("✅ Post deleted successfully!");
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("❌ Failed to delete post: " + error.message);
        }
    };

    // 🔁 Revoke approval
    const handleRevoke = async (id) => {
        const ref = doc(db, "items", id);
        await updateDoc(ref, { isApproved: false });
        alert("🔁 Approval revoked — moved back to pending list.");
    };

    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mb-4">
                    🔒
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Admin Login Required</h2>
                <p className="text-xs text-gray-500 max-w-sm mb-6">
                    Please log in with an administrator account to access the moderation console.
                </p>
                <Link
                    to="/login"
                    className="rounded-2xl bg-[#00a651] px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-md hover:bg-emerald-600 transition"
                >
                    Go to Login
                </Link>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mb-4">
                    ⛔
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Access Denied</h2>
                <p className="text-xs text-gray-500 max-w-sm mb-6">
                    You do not have administrative privileges to view this page.
                </p>
                <Link
                    to="/"
                    className="rounded-2xl bg-[#00a651] px-6 py-3 text-xs font-black uppercase tracking-widest text-white shadow-md hover:bg-emerald-600 transition"
                >
                    Back to Marketplace
                </Link>
            </div>
        );
    }

    const itemsRaw = activeTab === "pending" ? pendingItems : approvedItems;
    const itemsToShow = itemsRaw.filter((it) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            (it.title || "").toLowerCase().includes(q) ||
            (it.sellerName || "").toLowerCase().includes(q) ||
            (it.category || "").toLowerCase().includes(q) ||
            (it.locationZone || "").toLowerCase().includes(q)
        );
    });

    return (
        <div className="min-h-screen bg-[#f9fffb] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header Banner */}
                <div className="rounded-[32px] bg-white p-6 sm:p-8 border border-gray-100 shadow-soft">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center text-2xl font-black">
                                🛡️
                            </div>
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-red-600">
                                    Administrative Portal
                                </span>
                                <h1 className="text-2xl font-black text-gray-900">
                                    SokoHub Moderation Console
                                </h1>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs font-bold text-gray-500">
                                Total Live: <strong className="text-[#00a651]">{approvedItems.length}</strong>
                            </span>
                            <span className="text-gray-300">|</span>
                            <span className="text-xs font-bold text-gray-500">
                                Awaiting Review: <strong className="text-amber-500">{pendingItems.length}</strong>
                            </span>
                        </div>
                    </div>

                    {/* Navigation Tabs and Search */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveTab("pending")}
                                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                                    activeTab === "pending"
                                        ? "bg-amber-500 text-white shadow-md scale-105"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                🕓 Pending ({pendingItems.length})
                            </button>
                            <button
                                onClick={() => setActiveTab("approved")}
                                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
                                    activeTab === "approved"
                                        ? "bg-[#00a651] text-white shadow-md scale-105"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                }`}
                            >
                                ✅ Approved ({approvedItems.length})
                            </button>
                        </div>

                        <div className="w-full sm:w-64">
                            <input
                                type="text"
                                placeholder="Search by title, seller, category..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-2xl border border-gray-200 px-4 py-2.5 text-xs outline-none transition focus:border-[#00a651]"
                            />
                        </div>
                    </div>
                </div>

                {/* Items Grid */}
                {itemsToShow.length === 0 ? (
                    <div className="rounded-[32px] bg-white p-12 text-center border border-gray-100 shadow-soft">
                        <div className="w-16 h-16 rounded-full bg-green-50 text-2xl flex items-center justify-center mx-auto mb-3">
                            🎉
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">
                            {activeTab === "pending" ? "No pending items to review!" : "No approved items match search."}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            {activeTab === "pending" ? "All campus listings are currently reviewed and processed." : ""}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {itemsToShow.map((item) => (
                            <div
                                key={item.id}
                                className="flex flex-col bg-white rounded-[32px] overflow-hidden border border-gray-100 shadow-soft"
                            >
                                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                    <img
                                        src={item.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 left-3 bg-black/75 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase backdrop-blur-sm">
                                        📍 {item.locationZone || "Campus"}
                                    </div>
                                    <div className="absolute top-3 right-3 bg-[#00a651] text-[#ffb800] px-3 py-1 rounded-xl text-xs font-black shadow-md">
                                        KSh {Number(item.price || 0).toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex flex-col flex-1 p-5 space-y-3">
                                    <div>
                                        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gray-400 mb-1">
                                            <span>{item.category || "General"}</span>
                                            {item.condition && <span>{item.condition}</span>}
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-base line-clamp-1">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                                            {item.description || "No description."}
                                        </p>
                                    </div>

                                    <div className="bg-[#f9fffb] rounded-2xl p-3 border border-green-100/60 text-xs space-y-1">
                                        <p className="text-gray-700">
                                            <strong>Seller:</strong> {item.sellerName || item.userName || "Unknown"}
                                        </p>
                                        <p className="text-gray-700">
                                            <strong>Phone:</strong> {item.sellerPhone || item.whatsapp || "None"}
                                        </p>
                                        {item.requestFeatured && (
                                            <p className="text-amber-600 font-bold">
                                                ⭐ User requested Featured placement!
                                            </p>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="space-y-2 mt-auto pt-2">
                                        {activeTab === "pending" ? (
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => handleDecision(item.id, true)}
                                                    className="w-full rounded-xl bg-[#00a651] hover:bg-emerald-600 text-white py-2.5 text-xs font-black uppercase tracking-wider shadow-sm transition"
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 text-xs font-black uppercase tracking-wider shadow-sm transition"
                                                >
                                                    ✕ Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-2">
                                                <button
                                                    onClick={() => handleRevoke(item.id)}
                                                    className="w-full rounded-xl bg-amber-500 hover:bg-amber-600 text-white py-2.5 text-xs font-black uppercase tracking-wider shadow-sm transition"
                                                >
                                                    🔁 Revoke
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white py-2.5 text-xs font-black uppercase tracking-wider shadow-sm transition"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                                            className={`w-full rounded-xl py-2 text-xs font-black uppercase tracking-wider transition ${
                                                item.isFeatured
                                                    ? "bg-[#ffb800] text-black"
                                                    : "bg-gray-100 text-gray-700 hover:bg-yellow-100"
                                            }`}
                                        >
                                            {item.isFeatured ? "⭐ Featured (Click to Unpin)" : "☆ Mark as Featured"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
