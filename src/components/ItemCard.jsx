import React from "react";
import { Link } from "react-router-dom";
import TrustBadge from "./TrustBadge";

export default function ItemCard({ item, isSellerView = false }) {
  if (!item) return null;

  const imageUrl = item?.imageUrl || "https://via.placeholder.com/600x400?text=No+Image";
  
  // Ensure we fallback properly to any id property stored on the item document
  const itemId = item?.id;
  const sellerId = item?.sellerId || item?.userId || item?.uid;
  const sellerName = item?.sellerName || item?.userName || "SokoHub Seller";
  const rawPhone = item?.sellerPhone || item?.phone || item?.whatsapp || item?.whatsappNumber || "";
  const locationZone = item?.locationZone || item?.location || "Meru";

  const hasVideo = !!item?.videoUrl || (Array.isArray(item?.media) && item.media.some((m) => m.type === "video"));
  const mediaCount = Array.isArray(item?.imageUrls) ? item.imageUrls.length : (Array.isArray(item?.media) ? item.media.length : 1);

  const handleWhatsAppClick = (e) => {
    e.stopPropagation();

    if (!rawPhone) {
      alert("Seller phone number unavailable");
      return;
    }

    let cleanPhone = rawPhone.toString().replace(/\+/g, "").replace(/\s+/g, "").trim();
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "254" + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith("7") || cleanPhone.startsWith("1")) {
      cleanPhone = "254" + cleanPhone;
    }

    const message = `Hi ${sellerName}, I'm interested in buying your '${item?.title || "item"}' listed for KSh ${Number(item?.price || 0).toLocaleString()} on SokoHub.`;
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Safe split helper for seller first name
  const firstName = String(sellerName).trim().split(" ")[0] || "Seller";
  const itemDetailUrl = itemId ? `/item/${itemId}` : sellerId ? `/seller/${sellerId}` : "#";

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 h-full">
      {/* Clickable Image with Standard Aspect Ratio */}
      <Link to={itemDetailUrl} className="relative aspect-square m-2 overflow-hidden rounded-xl block bg-slate-100 dark:bg-slate-900">
        <img
          src={imageUrl}
          alt={item?.title || "Item"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Location Badge Overlay */}
        <div className="absolute top-3 left-3 bg-[#0F172A]/85 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase backdrop-blur-sm shadow-sm">
          📍 {locationZone}
        </div>

        {/* Price Tag Pill */}
        <div className="absolute top-3 right-3">
          <div className="bg-[#0F172A] text-white border border-slate-700/80 px-3 py-1 rounded-xl shadow-md">
            <p className="font-black text-xs sm:text-sm text-[#F97316]">
              KSh {Number(item?.price || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Media Badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
          {item?.isFeatured && (
            <span className="bg-[#F97316] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm">
              ⭐ Featured
            </span>
          )}
          {hasVideo && (
            <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1">
              <span>▶</span> Video
            </span>
          )}
          {mediaCount > 1 && !hasVideo && (
            <span className="bg-[#0F172A]/85 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg shadow-sm">
              📷 {mediaCount}
            </span>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-4 pt-1 space-y-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase tracking-wider font-bold text-[#2563EB] dark:text-blue-400">
              {item?.category || "Listing"}
            </p>
            {item?.condition && (
              <span className="text-[9px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md uppercase">
                {item.condition}
              </span>
            )}
          </div>
          <Link to={itemDetailUrl} className="block group-hover:text-[#2563EB] transition-colors">
            <h3 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-white line-clamp-1">
              {item?.title || "Untitled Item"}
            </h3>
          </Link>
        </div>

        {/* Seller Info Header */}
        <div className="flex items-center justify-between">
          {sellerId ? (
            <Link 
              to={`/seller/${sellerId}`} 
              className="flex items-center gap-2 group/seller hover:opacity-90 transition-opacity"
            >
              <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-[10px] font-bold text-[#2563EB] group-hover/seller:bg-[#2563EB] group-hover/seller:text-white transition-colors">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 group-hover/seller:text-[#2563EB] transition-colors truncate max-w-[90px]">
                {firstName}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-500">
                S
              </div>
              <span className="text-xs font-semibold text-slate-500 truncate max-w-[90px]">{firstName}</span>
            </div>
          )}

          <TrustBadge type="verified" text="Verified" />
        </div>

        {/* High-Action CTA Button */}
        <div className="mt-auto pt-2">
          {isSellerView ? (
            <button 
              onClick={handleWhatsAppClick}
              className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>💬</span> WhatsApp Vendor
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to={itemDetailUrl} className="w-full">
                <button className="w-full bg-slate-50 hover:bg-slate-100 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition shadow-sm active:scale-95">
                  View
                </button>
              </Link>
              <button 
                onClick={handleWhatsAppClick}
                className="w-full bg-[#F97316] hover:bg-[#EA580C] text-white py-2.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 flex items-center justify-center gap-1"
              >
                <span>💬</span> WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
