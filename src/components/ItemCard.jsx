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
    <div className="group flex flex-col bg-white rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-2xl border-2 border-transparent hover:border-[#00a651] h-full shadow-soft">
      {/* Clickable Image */}
      <Link to={itemDetailUrl} className="relative aspect-square m-2 overflow-hidden rounded-[24px] block bg-gray-50">
        <img
          src={imageUrl}
          alt={item?.title || "Item"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Location Badge Overlay */}
        <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-xl text-[10px] font-bold uppercase backdrop-blur-sm">
          📍 {locationZone}
        </div>

        {/* Price Tag Pill */}
        <div className="absolute top-4 right-4">
          <div className="bg-[#00a651] text-[#ffb800] px-3.5 py-1.5 rounded-2xl shadow-lg">
            <p className="font-black text-xs sm:text-sm">
              KSh {Number(item?.price || 0).toLocaleString()}
            </p>
          </div>
        </div>

        {/* Media Badges */}
        <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
          {item?.isFeatured && (
            <span className="bg-[#ffb800] text-black text-[10px] font-black uppercase px-2.5 py-1 rounded-xl shadow-md">
              ⭐ Featured
            </span>
          )}
          {hasVideo && (
            <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-lg shadow-md flex items-center gap-1">
              <span>▶</span> Video
            </span>
          )}
          {mediaCount > 1 && !hasVideo && (
            <span className="bg-black/75 text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg shadow-md">
              📷 {mediaCount}
            </span>
          )}
        </div>
      </Link>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-6 pt-2 space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase tracking-widest font-black text-[#00a651]">
              {item?.category || "Listing"}
            </p>
            {item?.condition && (
              <span className="text-[9px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full uppercase">
                {item.condition}
              </span>
            )}
          </div>
          <Link to={itemDetailUrl} className="block group-hover:text-[#00a651] transition-colors">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1">
              {item?.title || "Untitled Item"}
            </h3>
          </Link>
        </div>

        {/* Seller Info Header */}
        <div className="flex items-center justify-between">
          {sellerId ? (
            <Link 
              to={`/seller/${sellerId}`} 
              className="flex items-center gap-2 group/seller hover:opacity-80 transition-opacity"
            >
              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-[9px] font-black text-[#00a651] group-hover/seller:bg-[#00a651] group-hover/seller:text-white transition-colors">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-gray-600 group-hover/seller:text-[#00a651] group-hover/seller:underline transition-colors truncate max-w-[100px]">
                {firstName}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[9px] font-black text-gray-500">
                S
              </div>
              <span className="text-xs font-bold text-gray-500 truncate max-w-[100px]">{firstName}</span>
            </div>
          )}

          <TrustBadge type="verified" text="Verified" />
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-2">
          {isSellerView ? (
            <button 
              onClick={handleWhatsAppClick}
              className="w-full bg-[#00a651] text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-emerald-600 shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <span>💬</span> Chat on WhatsApp
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to={itemDetailUrl} className="w-full">
                <button className="w-full bg-[#f9fffb] hover:bg-green-50 text-[#00a651] border border-green-200 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition shadow-sm active:scale-95">
                  View
                </button>
              </Link>
              <button 
                onClick={handleWhatsAppClick}
                className="w-full bg-[#00a651] text-white py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all hover:bg-emerald-600 shadow-sm active:scale-95"
              >
                WhatsApp
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
