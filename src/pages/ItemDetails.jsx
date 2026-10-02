import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import TrustBadge from "../components/TrustBadge";

export default function ItemDetails() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [activeMediaIndex, setActiveMediaIndex] = useState(0);

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
        if (item.videoUrl && !list.some((m) => m.url === item.videoUrl)) {
            list.push({ url: item.videoUrl, type: "video" });
        }
        return list.length > 0 ? list : [{ url: "https://via.placeholder.com/600x600?text=No+Image", type: "image" }];
    }, [item]);

    const activeMedia = mediaList[activeMediaIndex] || mediaList[0] || { url: "", type: "image" };

    const formatWhatsAppNumber = (rawNumber) => {
        if (!rawNumber) return "";
        let cleaned = rawNumber.toString().replace(/\D/g, "").trim();
        if (cleaned.startsWith("0")) {
            return "254" + cleaned.substring(1);
        }
        if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
            return "254" + cleaned;
        }
        return cleaned;
    };

    const handleShare = async () => {
        const shareData = {
            title: item?.title || "SokoHub Listing",
            text: `Check out ${item?.title || "this item"} for KSh ${Number(item?.price || 0).toLocaleString()} on SokoHub!`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log("Share skipped", err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("Clipboard copy failed", err);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 bg-[#F8FAFC] dark:bg-[#0F172A]">
                <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Loading item details...</p>
            </div>
        );
    }

    if (!item) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center py-20 px-4 text-center bg-[#F8FAFC] dark:bg-[#0F172A]">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-3xl mb-4">
                    🔍
                </div>
                <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-2">Item Not Found</h2>
                <p className="text-sm text-slate-500 max-w-md mb-6">
                    This listing may have been sold, removed, or is no longer available on SokoHub.
                </p>
                <Link
                    to="/"
                    className="rounded-xl bg-[#2563EB] px-6 py-3 text-xs font-bold uppercase tracking-widest text-white shadow-md hover:bg-blue-700 transition"
                >
                    Back to Marketplace
                </Link>
            </div>
        );
    }

    const sellerId = item?.sellerId || item?.userId || item?.uid;
    const sellerName = item?.sellerName || item?.userName || "SokoHub Seller";
    const rawPhone = item?.sellerPhone || item?.whatsapp || item?.phone || "";
    const cleanPhone = formatWhatsAppNumber(rawPhone);
    const locationZone = item?.locationZone || item?.location || "Campus";

    const whatsappMessage = encodeURIComponent(
        `Hi ${sellerName}, I saw '${item.title}' posted on SokoHub for KSh ${Number(item.price || 0).toLocaleString()} and I'm interested. Is it still available?`
    );

    const whatsappUrl = cleanPhone
        ? `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${whatsappMessage}`
        : null;

    const firstName = String(sellerName).trim().split(" ")[0] || "Seller";

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Breadcrumbs */}
                <nav className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <Link to="/" className="hover:text-[#2563EB] transition">Home</Link>
                    <span>/</span>
                    <span className="text-[#2563EB]">{item.category || "Listing"}</span>
                    <span>/</span>
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px] sm:max-w-xs">{item.title}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* Left Column: Media & Highlights */}
                    <div className="lg:col-span-7 space-y-4">
                        {/* Primary Media Display Viewport */}
                        <div className="relative aspect-square sm:aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center justify-center">
                            {activeMedia.type === "video" ? (
                                <div className="w-full h-full bg-black flex items-center justify-center">
                                    <video
                                        key={activeMedia.url}
                                        src={activeMedia.url}
                                        controls
                                        playsInline
                                        autoPlay
                                        className="w-full h-full object-contain max-h-[500px]"
                                    />
                                </div>
                            ) : (
                                <img
                                    src={activeMedia.url}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                            )}

                            {/* Badges Overlays */}
                            <div className="absolute top-4 left-4 flex flex-wrap gap-2 pointer-events-none">
                                <div className="bg-[#0F172A]/85 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase backdrop-blur-md shadow-sm">
                                    📍 {locationZone}
                                </div>
                                {item.isFeatured && (
                                    <div className="bg-[#F97316] text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm">
                                        ⭐ Featured
                                    </div>
                                )}
                                {activeMedia.type === "video" && (
                                    <div className="bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                                        <span>▶</span> Product Video Demo
                                    </div>
                                )}
                            </div>

                            {item.condition && (
                                <div className="absolute bottom-4 left-4 pointer-events-none">
                                    <div className="bg-white/95 dark:bg-slate-800/95 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-lg text-xs font-bold uppercase backdrop-blur-md shadow-sm border border-slate-200/60 dark:border-slate-700">
                                        Condition: <span className="text-[#2563EB] dark:text-blue-400">{item.condition}</span>
                                    </div>
                                </div>
                            )}

                            {/* Share button */}
                            <button
                                onClick={handleShare}
                                className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 hover:bg-white text-slate-700 dark:text-slate-200 p-2.5 rounded-full shadow-md backdrop-blur-md transition hover:scale-110 active:scale-95 z-10"
                                title="Share Listing"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                </svg>
                            </button>
                        </div>

                        {/* Interactive Media Thumbnail Strip */}
                        {mediaList.length > 1 && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700 shadow-sm">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Media Gallery ({activeMediaIndex + 1} of {mediaList.length})
                                    </span>
                                    <span className="text-[10px] font-bold text-[#2563EB] dark:text-blue-400">
                                        Click thumbnail to preview
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
                                    {mediaList.map((media, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setActiveMediaIndex(idx)}
                                            className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                                                activeMediaIndex === idx
                                                    ? "border-[#2563EB] ring-2 ring-[#2563EB]/30 scale-105"
                                                    : "border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100"
                                            }`}
                                        >
                                            {media.type === "video" ? (
                                                <div className="w-full h-full bg-black flex items-center justify-center">
                                                    <span className="text-white text-xs font-black">▶ Video</span>
                                                </div>
                                            ) : (
                                                <img
                                                    src={media.url}
                                                    alt={`Thumbnail ${idx}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {copied && (
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-300 text-xs font-bold rounded-xl text-center border border-blue-200 dark:border-blue-800">
                                ✓ Listing link copied to clipboard!
                            </div>
                        )}

                        {/* Safety Box */}
                        <div className="rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-5 space-y-2">
                            <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs uppercase tracking-wider">
                                <span>🛡️</span>
                                <span>Campus Buyer Protection Tips</span>
                            </div>
                            <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                                <li>Meet the seller at safe public campus areas (e.g. Main Gate, Library, Cafeteria).</li>
                                <li>Always inspect the item thoroughly in person before paying.</li>
                                <li>Prefer verified vendors and avoid sending advance deposits.</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Information & Actions */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Title & Price Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-6">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs uppercase tracking-wider font-bold text-[#2563EB] dark:text-blue-400">
                                        {item.category || "General"}
                                    </span>
                                    {item.isApproved ? (
                                        <span className="text-[10px] font-bold bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-300 px-2.5 py-1 rounded-full uppercase border border-blue-200/60 dark:border-blue-800/60">
                                            ✓ Verified Listing
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full uppercase border border-amber-200">
                                            ⏳ Pending Review
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] dark:text-white leading-tight">
                                    {item.title}
                                </h1>
                            </div>

                            <div className="bg-[#0F172A] text-white rounded-xl p-4 border border-slate-700 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Price</p>
                                    <p className="text-2xl sm:text-3xl font-black text-[#F97316]">
                                        KSh {Number(item.price || 0).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Location</p>
                                    <p className="text-xs font-bold text-slate-200">📍 {locationZone}</p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <h3 className="text-xs uppercase tracking-wider font-bold text-slate-400">
                                    Description & Details
                                </h3>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                    {item.description || "No specific description provided by seller."}
                                </p>
                            </div>

                            {/* High-Action CTA Button (Energetic Orange WhatsApp Button) */}
                            <div className="pt-2">
                                {whatsappUrl ? (
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full flex items-center justify-center gap-2 bg-[#F97316] hover:bg-[#EA580C] text-white py-4 px-6 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-98"
                                    >
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 1.761.815 2.796.815 3.182 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm9.969 5.766c0 5.514-4.486 10-10 10-1.823 0-3.539-.493-5.018-1.354l-4.982 1.306 1.332-4.862c-.939-1.528-1.474-3.323-1.474-5.244 0-5.514 4.486-10 10-10s10 4.486 10 10z" />
                                        </svg>
                                        Contact Seller on WhatsApp
                                    </a>
                                ) : (
                                    <div className="rounded-xl bg-slate-100 dark:bg-slate-700 p-4 text-center text-xs font-bold text-slate-500">
                                        Seller contact is currently unavailable.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Seller Card */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-xs uppercase tracking-wider font-bold text-slate-400">
                                    Vendor Details
                                </span>
                                <TrustBadge type="verified" text="Verified" />
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-base font-black shadow-sm">
                                    {firstName.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-base font-bold text-[#0F172A] dark:text-white truncate">
                                        {sellerName}
                                    </h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Active Campus Vendor
                                    </p>
                                </div>
                            </div>

                            {sellerId && (
                                <Link
                                    to={`/seller/${sellerId}`}
                                    className="block w-full text-center bg-slate-100 dark:bg-slate-700 hover:bg-[#2563EB] text-slate-800 dark:text-slate-200 hover:text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm active:scale-98"
                                >
                                    View Full Vendor Store & Reviews
                                </Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}