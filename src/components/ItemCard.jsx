import React from "react";
import { Link } from "react-router-dom";
import TrustBadge from "./TrustBadge";

export default function ItemCard({ item, isSellerView = false }) {
  if (!item) return null;

  const imageUrl = item?.imageUrl || "https://via.placeholder.com/600x400?text=No+Image";
  
  // Ensure we fallback properly to any id property stored on the item document
  const sellerId = item?.sellerId || item?.userId || item?.uid || item?.id;
  const sellerName = item?.sellerName || item?.userName || "SokoHub Seller";
  const rawPhone = item?.sellerPhone || item?.phone || item?.whatsappNumber || "";
  const locationZone = item?.locationZone || item?.location || "Meru";

  const handleWhatsAppClick = (e) => {
    e.stopPropagation();

    if (!rawPhone) {
      alert("Seller phone number unavailable");
      return;
    }

    let cleanPhone = rawPhone.toString().replace(/\+/g, "").replace(/\s+/g, "").trim();
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "254" + cleanPhone.substring(1);
    }

    const message = `Hi ${sellerName}, I'm interested in buying your '${item?.title || "item"}' listed for KSh ${item?.price || 0} on SokoHub.`;
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  // Safe split helper for seller first name
  const firstName = String(sellerName).trim().split(" ")[0] || "Seller";

  return (
    <div className="group flex flex-col bg-white rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-2xl border-2 border-transparent hover:border-[#00a651] h-full shadow-soft">
      {/* Clickable Image */}
      {sellerId ? (
        <Link to={`/seller/${sellerId}`} className="relative aspect-square m-2 overflow-hidden rounded-[24px] block">
          <img
            src={imageUrl}
            alt={item?.title || "Item"}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          
          {/* Location Badge Overlay */}
          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-xl text-[10px] font-bold uppercase backdrop-blur-sm">
            📍 {locationZone}
          </div>

          <div className="absolute top-4 right-4">
            <div className="bg-[#00a651] text-[#ffb800] px-4 py-2 rounded-2xl shadow-lg">
              <p className="font-black text-sm">
                KSh {Number(item?.price || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </Link>
      ) : (
        <div className="relative aspect-square m-2 overflow-hidden rounded-[24px] block">
          <img
            src={imageUrl}
            alt={item?.title || "Item"}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-6 pt-2">
        <div className="mb-4">
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
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
            {item?.title || "Untitled Item"}
          </h3>
        </div>

        {/* Seller Info Header */}
        <div className="flex items-center justify-between mb-6">
          {sellerId ? (
            <Link 
              to={`/seller/${sellerId}`} 
              className="flex items-center gap-2 group/seller hover:opacity-80 transition-opacity"
            >
              <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-[8px] font-black text-[#00a651] group-hover/seller:bg-[#00a651] group-hover/seller:text-white transition-colors">
                {firstName.charAt(0).toUpperCase()}
              </div>
              <span className="text-xs font-bold text-gray-500 group-hover/seller:text-[#00a651] group-hover/seller:underline transition-colors">
                {firstName}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[8px] font-black text-gray-500">
                S
              </div>
              <span className="text-xs font-bold text-gray-500">{firstName}</span>
            </div>
          )}

          <TrustBadge type="verified" text="Verified" />
        </div>

        {/* Action Button */}
        {isSellerView ? (
          <button 
            onClick={handleWhatsAppClick}
            className="w-full mt-auto bg-[#00a651] text-white py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-emerald-600 shadow-md active:scale-95"
          >
            Chat on WhatsApp
          </button>
        ) : sellerId ? (
          <Link to={`/seller/${sellerId}`} className="mt-auto">
            <button className="w-full bg-[#ffb800] text-black py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-[#00a651] hover:text-white shadow-md active:scale-95">
              View Seller Profile
            </button>
          </Link>
        ) : (
          <button 
            onClick={handleWhatsAppClick}
            className="w-full mt-auto bg-[#ffb800] text-black py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-[#00a651] hover:text-white shadow-md active:scale-95"
          >
            Chat on WhatsApp
          </button>
        )}
      </div>
    </div>
  );
}
