import React from "react";
import { Link } from "react-router-dom";

export default function SellerBundleCard({ bundle }) {
  if (!bundle || !bundle.items || bundle.items.length === 0) return null;

  const { sellerId, sellerName, sellerPhone, items } = bundle;
  const primaryItem = items[0];
  const otherItems = items.slice(1, 4);

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
    <div className="flex flex-col bg-white dark:bg-[#1f2937] rounded-[32px] overflow-hidden border border-gray-200/80 dark:border-gray-700 shadow-sm hover:shadow-md transition-all">
      {/* Seller Header */}
      <div className="p-4 sm:p-5 pb-3 flex items-center justify-between gap-3">
        <Link
          to={sellerUrl}
          className="flex items-center gap-3 min-w-0 hover:opacity-90 transition"
        >
          <div className="h-11 w-11 rounded-full bg-[#00a651] text-white flex items-center justify-center text-sm font-black shadow-sm">
            {firstName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-black text-gray-900 dark:text-white truncate">
              {sellerName}
            </h3>
            <div className="flex items-center gap-2 text-[11px] font-bold text-gray-500 dark:text-gray-400">
              <span className="text-[#00a651]">✓ Verified</span>
              <span>•</span>
              <span>{items.length} {items.length === 1 ? "Listing" : "Listings"}</span>
            </div>
          </div>
        </Link>

        {/* Store Range */}
        <div className="text-right">
          <p className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
            STORE RANGE
          </p>
          <p className="text-xs font-black text-[#00a651]">
            {priceDisplay}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 pb-4 sm:px-5 sm:pb-5 flex-1 flex flex-col justify-between space-y-3.5">
        {/* Primary Featured Item */}
        <Link
          to={`/item/${primaryItem.id}`}
          className="relative aspect-[16/10] sm:aspect-[4/3] rounded-[24px] overflow-hidden block bg-gray-100 dark:bg-gray-800 group"
        >
          <img
            src={primaryItem.imageUrl || "https://via.placeholder.com/600x400?text=No+Image"}
            alt={primaryItem.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Badges Overlay */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            <span className="bg-black/80 text-white px-2.5 py-1 rounded-xl text-[10px] font-black uppercase backdrop-blur-sm tracking-wider">
              {primaryItem.category || "General"}
            </span>
            {(primaryItem.videoUrl || (primaryItem.media && primaryItem.media.some((m) => m.type === "video"))) && (
              <span className="bg-red-600 text-white px-2 py-1 rounded-xl text-[9px] font-black uppercase shadow-sm">
                ▶ Video
              </span>
            )}
          </div>

          {/* Price Pill */}
          <div className="absolute top-3 right-3">
            <div className="bg-[#00a651] text-white px-3 py-1 rounded-xl shadow-md">
              <span className="font-black text-xs text-white">
                KSh {Number(primaryItem.price || 0).toLocaleString()}
              </span>
            </div>
          </div>
        </Link>

        {/* Secondary Thumbnail Items */}
        {otherItems.length > 0 && (
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              MORE FROM THIS SELLER:
            </p>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {otherItems.map((subItem) => (
                <Link
                  key={subItem.id}
                  to={`/item/${subItem.id}`}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex-shrink-0 group"
                  title={subItem.title}
                >
                  <img
                    src={subItem.imageUrl || "https://via.placeholder.com/150"}
                    alt={subItem.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-black/75 py-0.5 text-center">
                    <span className="text-[8px] font-black text-[#ffb800] truncate block px-0.5">
                      {Number(subItem.price || 0).toLocaleString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 grid grid-cols-2 gap-2">
          <Link
            to={sellerUrl}
            className="w-full text-center bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition shadow-sm active:scale-95 flex items-center justify-center"
          >
            ALL ITEMS ({items.length})
          </Link>

          <button
            onClick={handleWhatsAppClick}
            className="w-full bg-[#00a651] hover:bg-emerald-600 text-white py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition shadow-sm active:scale-95 flex items-center justify-center"
          >
            WHATSAPP
          </button>
        </div>
      </div>
    </div>
  );
}
