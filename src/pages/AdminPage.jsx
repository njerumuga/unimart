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
import EditItemModal from "../components/EditItemModal";

export default function AdminPage() {
    const { user, isAdmin } = useAuth();
    const [pendingItems, setPendingItems] = useState([]);
    const [approvedItems, setApprovedItems] = useState([]);
    const [activeTab, setActiveTab] = useState("pending");
    const [searchQuery, setSearchQuery] = useState("");
    const [editingItem, setEditingItem] = useState(null);

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
        try {
            const ref = doc(db, "items", id);
            await updateDoc(ref, { isApproved: approved });
            alert(approved ? "✅ Approved and published to SokoHub!" : "❌ Rejected");
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    // 🔹 Revoke approval
    const handleRevoke = async (id) => {
        try {
            const ref = doc(db, "items", id);
            await updateDoc(ref, { isApproved: false });
            alert("⚠️ Approval revoked. Item moved to Pending.");
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    // 🔹 Toggle Featured
    const handleToggleFeatured = async (id, currentFeatured) => {
        try {
            const ref = doc(db, "items", id);
            await updateDoc(ref, { isFeatured: !currentFeatured });
            alert(!currentFeatured ? "⭐ Item marked as Featured!" : "Unmarked featured.");
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    // 🔹 Delete item permanently
    const handleDelete = async (id) => {
        const confirm = window.confirm("🗑️ Are you sure you want to permanently delete this listing?");
        if (!confirm) return;

        try {
            await deleteDoc(doc(db, "items", id));
            alert("✅ Listing deleted successfully!");
        } catch (error) {
            console.error("Error deleting item:", error);
            alert("❌ Failed to delete listing: " + error.message);
        }
    };

    if (!user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mb-4">
                    🔒
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">Admin Login Required</h2>
                <p className="text-xs text-gray-500 mb-6 max-w-sm">
                    You must be logged into an authorized admin account to access the SokoHub moderation console.
                </p>
                <Link
                    to="/login"
                    className="rounded-2xl bg-[#00a651] px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-emerald-600 transition"
                >
                    Log In
                </Link>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mb-4">
                    ⛔
                </div>
                <h2 className="text-xl font-black text-gray-900 mb-2">Access Denied</h2>
                <p className="text-xs text-gray-500 mb-6 max-w-sm">
                    Your account ({user.email}) does not have administrative privileges.
                </p>
                <Link
                    to="/"
                    className="rounded-2xl bg-[#00a651] px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-emerald-600 transition"
                >
                    Back to Marketplace
                </Link>
            </div>
        );
    }

    const currentList = activeTab === "pending" ? pendingItems : approvedItems;

    const filteredItems = currentList.filter((item) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            (item.title || "").toLowerCase().includes(q) ||
            (item.sellerName || "").toLowerCase().includes(q) ||
            (item.category || "").toLowerCase().includes(q) ||
            (item.locationZone || "").toLowerCase().includes(q)
        );
    });

    return (
        <div className="min-h-screen bg-[#f9fffb] dark:bg-[#111827] pb-24">
            {/* Top Admin Header */}
            <div className="bg-[#00a651] text-white px-4 py-8 sm:px-6 md:px-12 shadow-sm">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-lg bg-[#ffb800] text-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                                Moderator Console
                            </span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
                            SokoHub Admin Panel
                        </h1>
                        <p className="text-xs text-green-100 mt-1">
                            Logged in as: <span className="font-bold underline">{user.email}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/profile"
                            className="rounded-2xl bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 text-xs font-black uppercase tracking-wider transition backdrop-blur-sm"
                        >
                            My Profile
                        </Link>
                        <Link
                            to="/"
                            className="rounded-2xl bg-[#ffb800] hover:bg-amber-400 text-black px-4 py-2.5 text-xs font-black uppercase tracking-wider transition shadow-sm"
                        >
                            View Live Site
                        </Link>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 -mt-4 space-y-6">
                {/* Search & Navigation Bar */}
                <div className="rounded-[28px] bg-white dark:bg-gray-800 p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Tabs */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            onClick={() => setActiveTab("pending")}
                            className={`flex-1 sm:flex-initial rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-wider transition ${
                                activeTab === "pending"
                                    ? "bg-[#00a651] text-white shadow-sm"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                            }`}
                        >
                            ⏳ Pending ({pendingItems.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("approved")}
                            className={`flex-1 sm:flex-initial rounded-2xl px-5 py-2.5 text-xs font-black uppercase tracking-wider transition ${
                                activeTab === "approved"
                                    ? "bg-[#00a651] text-white shadow-sm"
                                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                            }`}
                        >
                            ✓ Approved ({approvedItems.length})
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className="w-full sm:w-72">
                        <input
                            type="text"
                            placeholder="Filter by title, seller, location..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-4 py-2 text-xs font-medium outline-none focus:border-[#00a651]"
                        />
                    </div>
                </div>

                {/* Listing Grid */}
                {filteredItems.length === 0 ? (
                    <div className="rounded-[32px] bg-white dark:bg-gray-800 p-12 text-center border border-gray-100 dark:border-gray-700 shadow-sm space-y-3">
                        <span className="text-4xl">🎉</span>
                        <h3 className="text-base font-bold text-gray-900 dark:text-white">
                            No listings in this queue
                        </h3>
                        <p className="text-xs text-gray-500">
                            {activeTab === "pending"
                                ? "There are no pending listings waiting for review."
                                : "No approved listings matching your search filter."}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className="rounded-[28px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col"
                            >
                                {/* Item Media & Badges */}
                                <div className="relative aspect-video bg-gray-100 overflow-hidden">
                                    <img
                                        src={item.imageUrl || "https://via.placeholder.com/400x300"}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                                        <span className="rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-black text-gray-800 shadow-sm">
                                            📍 {item.locationZone || "Main Gate"}
                                        </span>
                                        <span className="rounded-full bg-black/70 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold text-white">
                                            {item.category}
                                        </span>
                                    </div>
                                    <span className="absolute bottom-3 right-3 rounded-xl bg-[#00a651] px-3 py-1 text-xs font-black text-[#ffb800] shadow-md">
                                        KSh {Number(item.price || 0).toLocaleString()}
                                    </span>
                                </div>

                                {/* Item Info */}
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div>
                                        <h3 className="text-base font-black text-gray-900 dark:text-white truncate">
                                            {item.title}
                                        </h3>
                                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mt-1">
                                            {item.description || "No description provided."}
                                        </p>
                                    </div>

                                    <div className="bg-[#f9fffb] dark:bg-gray-900/40 rounded-2xl p-3 border border-green-100/60 dark:border-green-900/30 text-xs space-y-1">
                                        <p className="text-gray-700 dark:text-gray-300">
                                            <strong>Seller:</strong> {item.sellerName || item.userName || "Unknown"}
                                        </p>
                                        <p className="text-gray-700 dark:text-gray-300">
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
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => handleDecision(item.id, true)}
                                                    className="rounded-xl bg-[#00a651] hover:bg-emerald-600 text-white py-2 text-[11px] font-black uppercase tracking-wider shadow-sm transition"
                                                >
                                                    ✓ Approve
                                                </button>
                                                <button
                                                    onClick={() => setEditingItem(item)}
                                                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 text-[11px] font-black uppercase tracking-wider shadow-sm transition"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded-xl bg-red-600 hover:bg-red-700 text-white py-2 text-[11px] font-black uppercase tracking-wider shadow-sm transition"
                                                >
                                                    🗑️ Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-3 gap-2">
                                                <button
                                                    onClick={() => handleRevoke(item.id)}
                                                    className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white py-2 text-[11px] font-black uppercase tracking-wider shadow-sm transition"
                                                >
                                                    🔁 Revoke
                                                </button>
                                                <button
                                                    onClick={() => setEditingItem(item)}
                                                    className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 text-[11px] font-black uppercase tracking-wider shadow-sm transition"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="rounded-xl bg-red-600 hover:bg-red-700 text-white py-2 text-[11px] font-black uppercase tracking-wider shadow-sm transition"
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
                                                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-yellow-100"
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

            {/* Edit Item Modal */}
            <EditItemModal
                isOpen={Boolean(editingItem)}
                onClose={() => setEditingItem(null)}
                item={editingItem}
            />
        </div>
    );
}
