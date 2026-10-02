import React from "react";

export default function AdDetailsModal({ isOpen, onClose, banner }) {
  if (!isOpen || !banner) return null;

  const phone = banner.phone || banner.sellerPhone || "";
  let cleanPhone = phone.replace("+", "").replace(/\s+/g, "").trim();
  if (cleanPhone.startsWith("0")) {
    cleanPhone = "254" + cleanPhone.substring(1);
  } else if (cleanPhone.startsWith("7") || cleanPhone.startsWith("1")) {
    cleanPhone = "254" + cleanPhone;
  }

  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Hi! I saw your "${banner.title}" ad banner on SokoHub and I'd like more details.`
      )}`
    : null;

  const telUrl = phone ? `tel:${phone}` : null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-[32px] bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-2xl transition-all max-h-[90vh] overflow-y-auto space-y-5 border border-gray-100 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-1 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="rounded-lg bg-[#ffb800] text-black px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
              📢 SPONSORED AD
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Banner Image */}
        {banner.imageUrl ? (
          <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 max-h-72 flex items-center justify-center">
            <img
              src={banner.imageUrl}
              alt={banner.title}
              className="w-full h-auto max-h-72 object-contain"
            />
          </div>
        ) : null}

        {/* Title & Details */}
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
            {banner.title}
          </h2>
          <div className="bg-[#f9fffb] dark:bg-gray-900/50 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {banner.details || banner.description || "Special offer / business promotion on campus."}
          </div>
        </div>

        {/* Contact Info & Action Buttons */}
        <div className="space-y-3 pt-2">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#00a651] hover:bg-emerald-600 text-white py-3.5 text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg transition active:scale-98"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.54 1.761.815 2.796.815 3.182 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.766-5.768-5.766zm9.969 5.766c0 5.514-4.486 10-10 10-1.823 0-3.539-.493-5.018-1.354l-4.982 1.306 1.332-4.862c-.939-1.528-1.474-3.323-1.474-5.244 0-5.514 4.486-10 10-10s10 4.486 10 10z" />
              </svg>
              <span>Chat on WhatsApp ({phone || "Vendor"})</span>
            </a>
          )}

          {telUrl && (
            <a
              href={telUrl}
              className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 py-3 text-xs sm:text-sm font-bold transition active:scale-98"
            >
              <span>📞</span>
              <span>Call {phone}</span>
            </a>
          )}

          <button
            onClick={onClose}
            className="w-full text-center text-xs font-bold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 py-1"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
