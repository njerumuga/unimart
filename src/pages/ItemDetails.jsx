import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import TrustBadge from "../components/TrustBadge";
import { useAuth } from "../contexts/AuthContext";
import EditItemModal from "../components/EditItemModal";

export default function ItemDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();

    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        async function fetchItem() {
            try {
                const ref = doc(db, "items", id);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    const data = snap.data();
                    setItem({
                        ...data,
                        id: snap.id,
                        isFeatured: data.isFeatured ?? false,
                        isApproved: data.isApproved ?? true,
                        imageUrl: data.imageUrl || "https://via.placeholder.com/600x600?text=No+Image",
                    });
                } else {
                    console.error("❌ Item not found");
                }
            } catch (err) {
                console.error("⚠️ Error fetching item:", err);
            } finally {
                setLoading(false);
            }
        }
        void fetchItem();
    }, [id]);

    const isOwner = Boolean(
        user && item && (user.uid === item.userId || user.uid === item.sellerId)
    );
    const canManage = isOwner || isAdmin;

    const handleDeleteListing = async () => {
        const confirmDelete = window.confirm("Are you sure you want to permanently delete this listing?");
        if (!confirmDelete) return;

        try {
            await deleteDoc(doc(db, "items", id));
            alert("✅ Listing deleted successfully");
            navigate(isAdmin ? "/admin" : "/profile");
        } catch (err) {
            console.error("Error deleting item:", err);
            alert("Failed to delete item: " + err.message);
        }
    };

    const handleToggleFeatured = async () => {
        if (!item) return;
        try {
            const nextFeatured = !item.isFeatured;
            await updateDoc(doc(db, "items", id), { isFeatured: nextFeatured });
            setItem((prev) => ({ ...prev, isFeatured: nextFeatured }));
            alert(nextFeatured ? "⭐ Item marked as Featured!" : "Unpinned from Featured.");
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const handleToggleApproval = async () => {
        if (!item) return;
        try {
            const nextApproved = !item.isApproved;
            await updateDoc(doc(db, "items", id), { isApproved: nextApproved });
            setItem((prev) => ({ ...prev, isApproved: nextApproved }));
            alert(nextApproved ? "✓ Listing is now Live!" : "⏳ Listing set to Pending.");
        } catch (err) {
            alert("Error: " + err.message);
        }
    };

    const mediaList = useMemo(() => {
        if (!item) return [];
        if (Array.isArray(item.media) && item.media.length > 0) {
            return item.media;
        }
        const list = [];
        if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
            item.imageUrls.forEach((url) => {
                if (url) list.push({ url, type: "image" });
            });
        } else if (item.imageUrl) {
            list.push({ url: item.imageUrl, type: "image" });
        }
        if (item.videoUrl) {
            list.push({ url: item.videoUrl, type: "video" });
        }
        return list;
    }, [item]);

    const activeMedia = mediaList[activeMediaIndex] || (mediaList[0] || { url: item?.imageUrl, type: "image" });

    // WhatsApp format & link
    const sellerPhone = item?.sellerPhone || item?.whatsapp || item?.phone || "";
    let cleanPhone = sellerPhone.replace("+", "").replace(/\s+/g, "").trim();
    if (cleanPhone.startsWith("0")) {
        cleanPhone = "254" + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith("7") || cleanPhone.startsWith("1")) {
        cleanPhone = "254" + cleanPhone;
    }

    const whatsappMessage = encodeURIComponent(
        `Hi ${item?.sellerName || "there"}, I'm interested in your "${item?.title}" on SokoHub listed for KSh ${Number(item?.price || 0).toLocaleString()} (Zone: ${item?.locationZone || "Campus"}). Is it still available?`
    );

    const whatsappUrl = cleanPhone
        ? `https://wa.me/${cleanPhone}?text=${whatsappMessage}`
        : null;

    const sellerName = item?.sellerName || item?.userName || "Campus Comrade";
    const sellerId = item?.sellerId || item?.userId || "";
    const firstName = sellerName.split(" ")[0];

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: item.title,
                    text: `Check out ${item.title} for KSh ${Number(item.price || 0).toLocaleString()} on SokoHub!`,
                    url: window.location.href,
                });
            } catch (err) {
                console.log("Share skipped", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 3000);
            } catch (err) {
                console.error("Clipboard copy error:", err);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f9fffb] dark:bg-[#111827] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-[#00a651] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                        Loading listing details...
                    </p>
                </div>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 text-2xl flex items-center justify-center mb-4">
                    🔍
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Item Not Found</h2>
                <p className="text-xs text-gray-500 mb-6 max-w-sm">
                    This item may have been sold or removed by the seller.
                </p>
                <Link
                    to="/"
                    className="rounded-2xl bg-[#00a651] px-6 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-emerald-600 transition"
                >
                    Browse Other Items
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f9fffb] dark:bg-[#111827] pb-24">
            {/* Top Navigation Bar */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-4 py-4 sm:px-6 md:px-12 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-gray-600 dark:text-gray-300 hover:text-[#00a651] transition"
                    >
                        <span>←</span>
                        <span>Back</span>
                    </button>

                    <div className="flex items-center gap-2">
                        {/* Owner / Admin Management Buttons */}
                        {canManage && (
                            <>
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider hover:bg-blue-100 transition shadow-sm"
                                >
                                    <span>✏️</span>
                                    <span>Edit</span>
                                </button>
                                <button
                                    onClick={handleDeleteListing}
                                    className="inline-flex items-center gap-1.5 rounded-full bg-red-50 dark:bg-red-900/40 text-red-600 dark:text-red-400 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider hover:bg-red-100 transition shadow-sm"
                                >
                                    <span>🗑️</span>
                                    <span>Delete</span>
                                </button>
                            </>
                        )}

                        {isAdmin && (
                            <>
                                <button
                                    onClick={handleToggleApproval}
                                    className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wider transition ${
                                        item.isApproved
                                            ? "bg-green-100 text-[#00a651]"
                                            : "bg-amber-100 text-amber-900"
                                    }`}
                                >
                                    {item.isApproved ? "✓ Live" : "⏳ Approve"}
                                </button>
                                <button
                                    onClick={handleToggleFeatured}
                                    className={`rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wider transition ${
                                        item.isFeatured
                                            ? "bg-amber-100 text-amber-900"
                                            : "bg-gray-100 text-gray-700 hover:bg-yellow-100"
                                    }`}
                                >
                                    {item.isFeatured ? "⭐ Featured" : "☆ Feature"}
                                </button>
                            </>
                        )}

                        {/* Share Button */}
                        <button
                            onClick={handleShare}
                            className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-700 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-200 hover:bg-gray-200 transition"
                        >
                            <span>🔗</span>
                            <span>Share</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 pt-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Media Gallery */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* Main Media Viewport */}
                        <div className="relative aspect-square sm:aspect-[4/3] rounded-[32px] overflow-hidden bg-black border border-gray-100 dark:border-gray-700 shadow-soft flex items-center justify-center">
                            {activeMedia.type === "video" ? (
                                <video
                                    src={activeMedia.url}
                                    controls
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-contain"
                                />
                            ) : (
                                <img
                                    src={activeMedia.url}
                                    alt={item.title}
                                    className="w-full h-full object-contain bg-gray-900"
                                />
                            )}

                            {/* Badges Overlay */}
                            <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                                <span className="rounded-full bg-white/95 dark:bg-gray-900/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-black text-gray-900 dark:text-white shadow-sm flex items-center gap-1">
                                    <span>📍</span>
                                    <span>{item.locationZone || "Main Gate"}</span>
                                </span>
                                {item.condition && (
                                    <span className="rounded-full bg-black/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-white shadow-sm">
                                        {item.condition}
                                    </span>
                                )}
                            </div>

                            {item.isFeatured && (
                                <span className="absolute top-4 right-4 rounded-full bg-[#ffb800] text-black px-3 py-1 text-xs font-black uppercase tracking-wider shadow-md pointer-events-none">
                                    ⭐ FEATURED
                                </span>
                            )}
                        </div>

                        {/* Thumbnail Strip (if multiple media) */}
                        {mediaList.length > 1 && (
                            <div className="space-y-1.5">
                                <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                                    Product Photos & Video Demo ({mediaList.length} files)
                                </p>
                                <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
                                    {mediaList.map((m, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveMediaIndex(idx)}
                                            className={`relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 border-2 transition-all ${
                                                activeMediaIndex === idx
                                                    ? "border-[#00a651] scale-105 shadow-md"
                                                    : "border-transparent opacity-70 hover:opacity-100"
                                            }`}
                                        >
                                            {m.type === "video" ? (
                                                <div className="w-full h-full bg-gray-900 flex flex-col items-center justify-center text-white">
                                                    <span className="text-xl">▶</span>
                                                    <span className="text-[9px] font-black uppercase">Video</span>
                                                </div>
                                            ) : (
                                                <img
                                                    src={m.url}
                                                    alt={`Thumbnail ${idx}`}
                                                    className="w-full h-full object-cover bg-gray-100"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {copied && (
                            <div className="p-3 bg-green-100 text-[#00a651] text-xs font-bold rounded-2xl text-center">
                                ✓ Listing link copied to clipboard!
                            </div>
                        )}

                        {/* Safety Box */}
                        <div className="rounded-[24px] bg-amber-50/70 dark:bg-amber-900/20 border border-amber-200/60 dark:border-amber-800 p-5 space-y-2">
                            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-xs uppercase tracking-wider">
                                <span>🛡️</span>
                                <span>Campus Buyer Protection Tips</span>
                            </div>
                            <ul className="text-xs text-amber-900/80 dark:text-amber-200/80 space-y-1 list-disc list-inside">
                                <li>Meet the seller at safe public campus areas (e.g. Main Gate, Library, Cafeteria).</li>
                                <li>Always inspect the item thoroughly in person before paying.</li>
                                <li>Avoid sending advance payments or deposits.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Information & Actions */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Title & Price Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 sm:p-8 border border-gray-100 dark:border-gray-700 shadow-soft space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs uppercase tracking-widest font-black text-[#00a651]">
                                        {item.category || "General"}
                                    </span>
                                    {item.isApproved ? (
                                        <span className="text-[10px] font-bold bg-green-50 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-full uppercase">
                                            ✓ Verified Listing
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold bg-yellow-50 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-2.5 py-1 rounded-full uppercase">
                                            ⏳ Pending Review
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight">
                                    {item.title}
                                </h1>
                            </div>

                            {/* Price Tag */}
                            <div className="bg-[#00a651] text-white p-4 rounded-2xl flex items-center justify-between">
                                <span className="text-xs uppercase font-bold tracking-wider text-green-100">
                                    Asking Price
                                </span>
                                <span className="text-2xl sm:text-3xl font-black text-[#ffb800]">
                                    KSh {Number(item.price || 0).toLocaleString()}
                                </span>
                            </div>

                            {/* Specs Pills */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                                    <span className="block text-[10px] font-bold uppercase text-gray-400">Condition</span>
                                    <span className="text-xs font-black text-gray-800 dark:text-gray-200">
                                        {item.condition || "Used - Good"}
                                    </span>
                                </div>
                                <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-700 text-center">
                                    <span className="block text-[10px] font-bold uppercase text-gray-400">Campus Location</span>
                                    <span className="text-xs font-black text-gray-800 dark:text-gray-200 truncate block">
                                        📍 {item.locationZone || "Main Gate"}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <h3 className="text-xs uppercase tracking-widest font-black text-gray-400">
                                    Description
                                </h3>
                                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                                    {item.description || "The seller has not provided a detailed description for this item."}
                                </p>
                            </div>

                            {/* WhatsApp Action Button */}
                            <div className="pt-2">
                                {whatsappUrl ? (
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-3 bg-[#00a651] hover:bg-emerald-600 text-white py-4 px-6 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg transition active:scale-98"
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 1.761.815 2.796.815 3.182 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm9.969 5.766c0 5.514-4.486 10-10 10-1.823 0-3.539-.493-5.018-1.354l-4.982 1.306 1.332-4.862c-.939-1.528-1.474-3.323-1.474-5.244 0-5.514 4.486-10 10-10s10 4.486 10 10z" />
                                        </svg>
                                        Chat with Seller on WhatsApp
                                    </a>
                                ) : (
                                    <div className="rounded-2xl bg-gray-100 dark:bg-gray-700 p-4 text-center text-xs font-bold text-gray-500 dark:text-gray-400">
                                        Seller contact is currently unavailable.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Seller Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-[32px] p-6 border border-gray-100 dark:border-gray-700 shadow-soft space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-widest font-black text-gray-400">
                                    Seller Details
                                </span>
                                <TrustBadge type="verified" text="Verified" />
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-full bg-green-100 dark:bg-green-900/40 border-2 border-[#00a651] flex items-center justify-center text-lg font-black text-[#00a651]">
                                    {firstName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-base font-bold text-gray-900 dark:text-white truncate">
                                        {sellerName}
                                    </h4>
                                    <p className="text-xs text-gray-500">
                                        Active Campus Comrade
                                    </p>
                                </div>
                            </div>

                            {sellerId && (
                                <Link
                                    to={`/seller/${sellerId}`}
                                    className="block w-full text-center bg-[#ffb800] hover:bg-[#00a651] text-black hover:text-white py-3 px-4 rounded-2xl text-xs font-black uppercase tracking-widest transition shadow-sm active:scale-98"
                                >
                                    View Full Seller Store & Reviews
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Item Modal */}
            <EditItemModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                item={item}
                onUpdated={(updatedData) => setItem((prev) => ({ ...prev, ...updatedData }))}
            />
        </div>
    );
}
