import React from "react";
import { Link } from "react-router-dom";
import TrustBadge from "./TrustBadge";

export default function SellerBundleCard({ bundle }) {
  if (!bundle || !bundle.items || bundle.items.length === 0) return null;

  const { sellerId, sellerName, sellerPhone, locationZone, items } = bundle;
  const primaryItem = items[0];
  const otherItems = items.slice(1, 4);
  const remainingCount = items.length > 4 ? items.length - 4 : 0;

  const firstName = String(sellerName).trim().split(" ")[0] || "Seller";
  const sellerUrl = sellerId ? `/seller/${sellerId}` : "#";

  // Compute price range
  const prices = items.map((i) => Number(i.price || 0)).filter((p) => p > 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const priceDisplay =
    minPrice === maxPrice || prices.length <= 1
      ? `KSh ${minPrice.toLocaleString()}`
      : `KSh ${minPrice.toLocaleString()} – ${maxPrice.toLocaleString()}`;

  // Unique categories sold by this seller
  const sellerCategories = Array.from(
    new Set(items.map((i) => i.category).filter(Boolean))
  );

  const handleWhatsAppClick = (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!sellerPhone) {
      alert("Seller phone number unavailable");
      return;
    }

    let cleanPhone = sellerPhone.toString().replace(/\+/g, "").replace(/\s+/g, "").trim();
    if (cleanPhone.startsWith("0")) {
      cleanPhone = "254" + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith("7") || cleanPhone.startsWith("1")) {
      cleanPhone = "254" + cleanPhone;
    }

    const itemTitles = items.slice(0, 3).map((i) => `'${i.title}'`).join(", ");
    const message = `Hi ${sellerName}, I saw your ${items.length} listings (${itemTitles}) on SokoHub and would like to inquire.`;
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="group flex flex-col bg-white rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-2xl border-2 border-gray-100/80 hover:border-[#00a651] shadow-soft">
      {/* Seller Header */}
      <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 flex items-center justify-between gap-3 bg-gradient-to-r from-white via-[#f9fffb] to-white">
        <Link
          to={sellerUrl}
          className="flex items-center gap-3 min-w-0 group/seller hover:opacity-90 transition"
        >
          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-[#00a651] text-white flex items-center justify-center text-base font-black shadow-md border-2 border-white">
              {firstName.charAt(0).toUpperCase()}
            </div>
            <span className="absolute -bottom-1 -right-1 block h-4 w-4 rounded-full bg-emerald-500 border-2 border-white"></span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-base font-black text-gray-900 group-hover/seller:text-[#00a651] transition truncate">
                {sellerName}
              </h3>
              <TrustBadge type="verified" text="Verified" />
            </div>
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500">
              <span>📍 {locationZone || "Campus"}</span>
              <span>•</span>
              <span className="text-[#00a651] font-black">
                {items.length} {items.length === 1 ? "Listing" : "Listings"}
              </span>
            </div>
          </div>
        </Link>

        {/* Price Range Pill */}
        <div className="hidden sm:block text-right">
          <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">Store Range</p>
          <p className="text-xs font-black text-[#00a651]">{priceDisplay}</p>
        </div>
      </div>

      {/* Main Showcase Area */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-4">
        {/* Primary Featured Item */}
        <Link
          to={`/item/${primaryItem.id}`}
          className="relative aspect-[16/10] sm:aspect-[4/3] rounded-[24px] overflow-hidden block bg-gray-50 border border-gray-100 group/image"
        >
          <img
            src={primaryItem.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"}
            alt={primaryItem.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-105"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="bg-black/75 text-white px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase backdrop-blur-sm">
              {primaryItem.category || "Listing"}
            </span>
            {primaryItem.isFeatured && (
              <span className="bg-[#ffb800] text-black px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shadow-md">
                ⭐ Featured
              </span>
            )}
            {(primaryItem.videoUrl || (primaryItem.media && primaryItem.media.some((m) => m.type === "video"))) && (
              <span className="bg-red-600 text-white px-2.5 py-1 rounded-xl text-[10px] font-black uppercase shadow-md flex items-center gap-1">
                <span>▶</span> Video Demo
              </span>
            )}
          </div>

          {/* Price Pill */}
          <div className="absolute top-3 right-3">
            <div className="bg-[#00a651] text-[#ffb800] px-3 py-1 rounded-xl shadow-lg">
              <span className="font-black text-xs">
                KSh {Number(primaryItem.price || 0).toLocaleString()}
              </span>
            </div>
          </div>

          {/* Title Banner */}
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-3 pt-6 text-white">
            <p className="text-xs font-bold truncate">
              {primaryItem.title}
            </p>
          </div>
        </Link>

        {/* Secondary Thumbnail Items if Seller has more than 1 item */}
        {otherItems.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              More from this seller:
            </p>
            <div className="grid grid-cols-3 gap-2">
              {otherItems.map((subItem) => (
                <Link
                  key={subItem.id}
                  to={`/item/${subItem.id}`}
                  className="group/sub relative aspect-square rounded-2xl overflow-hidden bg-gray-100 border border-gray-200/70 hover:border-[#00a651] transition"
                  title={subItem.title}
                >
                  <img
                    src={subItem.imageUrl || "https://via.placeholder.com/200x200?text=No+Image"}
                    alt={subItem.title}
                    className="w-full h-full object-cover group-hover/sub:scale-110 transition duration-300"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/70 px-1 py-0.5 text-center">
                    <span className="text-[9px] font-black text-[#ffb800] truncate block">
                      KSh {Number(subItem.price || 0).toLocaleString()}
                    </span>
                  </div>
                </Link>
              ))}

              {remainingCount > 0 && (
                <Link
                  to={sellerUrl}
                  className="aspect-square rounded-2xl bg-green-50 border border-green-200 flex flex-col items-center justify-center p-1 text-center hover:bg-[#00a651] hover:text-white transition group/more text-[#00a651]"
                >
                  <span className="text-xs font-black">+{remainingCount}</span>
                  <span className="text-[8px] font-bold uppercase">More</span>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Category tags */}
        {sellerCategories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {sellerCategories.map((cat) => (
              <span
                key={cat}
                className="text-[9px] font-bold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg uppercase"
              >
                {cat}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <Link
            to={sellerUrl}
            className="w-full text-center bg-[#f9fffb] hover:bg-green-50 text-[#00a651] border border-green-200 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition shadow-sm active:scale-95 flex items-center justify-center"
          >
            All Items ({items.length})
          </Link>

          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-[#00a651] hover:bg-emerald-600 text-white py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>💬</span> WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
