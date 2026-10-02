import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import SellerRatingModal from "../components/SellerRatingModal";

export default function SellerProfile() {
  const { sellerId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [sellerItems, setSellerItems] = useState([]);
  const [sellerName, setSellerName] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!sellerId) return;

    // 1. Fetch Seller's Items
    const itemsQuery = query(
      collection(db, "items"),
      where("sellerId", "==", sellerId)
    );

    const unsubscribeItems = onSnapshot(
      itemsQuery,
      (snapshot) => {
        let items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        if (items.length === 0) {
          const fallbackQuery = query(
            collection(db, "items"),
            where("userId", "==", sellerId)
          );

          onSnapshot(
            fallbackQuery,
            (fallbackSnap) => {
              const fallbackItems = fallbackSnap.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
              }));
              setSellerItems(fallbackItems);
              if (fallbackItems.length > 0) {
                setSellerName(
                  fallbackItems[0].sellerName ||
                    fallbackItems[0].userName ||
                    "Campus Comrade"
                );
                setSellerPhone(
                  fallbackItems[0].sellerPhone ||
                    fallbackItems[0].whatsapp ||
                    fallbackItems[0].phone ||
                    ""
                );
              }
              setLoading(false);
            },
            (err) => {
              console.error("Error fetching fallback items:", err);
              setLoading(false);
            }
          );
        } else {
          setSellerItems(items);
          if (items[0]?.sellerName || items[0]?.userName) {
            setSellerName(items[0].sellerName || items[0].userName);
          }
          if (items[0]?.sellerPhone || items[0]?.whatsapp || items[0]?.phone) {
            setSellerPhone(items[0].sellerPhone || items[0].whatsapp || items[0].phone);
          }
          setLoading(false);
        }
      },
      (error) => {
        console.error("Error fetching seller items:", error);
        setLoading(false);
      }
    );

    // 2. Fetch Seller's Reviews
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("sellerId", "==", sellerId)
    );

    const unsubscribeReviews = onSnapshot(
      reviewsQuery,
      (snapshot) => {
        const revs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReviews(revs);
      },
      (error) => {
        console.error("Error fetching reviews:", error);
      }
    );

    return () => {
      unsubscribeItems();
      unsubscribeReviews();
    };
  }, [sellerId]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${sellerName} on SokoHub`,
          text: `Check out ${sellerName}'s items on SokoHub Meru:`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share skipped");
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("🔗 Seller storefront link copied to clipboard!");
    }
  };

  const getCleanPhone = (phone) => {
    let clean = String(phone || "").replace(/\D/g, "").trim();
    if (clean.startsWith("0")) return "254" + clean.substring(1);
    if (clean.startsWith("7") || clean.startsWith("1")) return "254" + clean;
    return clean;
  };

  const filteredItems = sellerItems.filter((it) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (it.title || "").toLowerCase().includes(q) ||
      (it.category || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] pb-24">
      {/* Top Midnight Bar */}
      <div className="bg-[#0F172A] text-white px-4 py-4 sm:px-6 md:px-12 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 rounded-full hover:bg-slate-800 transition"
            title="Go Back"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-base sm:text-lg font-bold tracking-tight truncate">
            {sellerName || "Vendor Storefront"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Share Storefront"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 py-6 space-y-6">
        {/* Seller Info Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-5 sm:p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[#0F172A] dark:text-white">
              {sellerName || "Campus Vendor"}
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 px-2.5 py-0.5 text-xs font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span>
                <span>Verified Vendor</span>
              </span>
              <span className="rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 text-xs font-medium">
                Main Campus
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 pt-0.5">
              {sellerItems.length} Active Listing(s)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFollowing(!isFollowing)}
              className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                isFollowing
                  ? "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
                  : "bg-[#2563EB] hover:bg-blue-700 text-white shadow-sm"
              }`}
            >
              {isFollowing ? "✓ Following" : "Follow Vendor"}
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-5 py-2.5 text-xs font-bold transition-all shadow-sm"
            >
              Rate Vendor
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div>
          <div className="relative flex items-center bg-white dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 p-2 shadow-sm focus-within:ring-2 focus-within:ring-[#2563EB]">
            <span className="pl-3 pr-2 text-slate-400 text-sm">🔍</span>
            <input
              type="text"
              placeholder={`Search in ${sellerName ? sellerName + "'s" : "vendor's"} shop...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm font-semibold text-slate-900 dark:text-white outline-none"
            />
          </div>
        </div>

        {/* Items Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[#0F172A] dark:text-white uppercase tracking-wider">
            Items Listed by Vendor
          </h3>

          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs font-bold text-slate-400">Loading products...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              No items match your search in this store.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const phone = item.sellerPhone || item.whatsapp || item.phone || sellerPhone;
                const cleanPhone = getCleanPhone(phone);
                const waUrl = cleanPhone
                  ? `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(
                      `Hi ${sellerName}, I am interested in '${item.title}' on SokoHub.`
                    )}`
                  : null;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200/80 dark:border-slate-700 p-3 shadow-sm hover:shadow-md transition-all justify-between"
                  >
                    <Link to={`/item/${item.id}`} className="block space-y-2">
                      <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900">
                        <img
                          src={item.imageUrl || "https://via.placeholder.com/300"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs font-black text-[#F97316] mt-0.5">
                          KSh {Number(item.price || 0).toLocaleString()}
                        </p>
                      </div>
                    </Link>

                    {/* WhatsApp and Call Buttons (High-Action Orange CTA) */}
                    <div className="grid grid-cols-2 gap-1.5 pt-3 mt-auto">
                      {waUrl ? (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full text-center rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white py-2 text-[10px] font-black uppercase transition shadow-sm"
                        >
                          WHATSAPP
                        </a>
                      ) : (
                        <button
                          disabled
                          className="w-full text-center rounded-xl bg-slate-200 text-slate-400 py-2 text-[10px] font-bold uppercase"
                        >
                          WHATSAPP
                        </button>
                      )}

                      {phone ? (
                        <a
                          href={`tel:${phone}`}
                          className="w-full text-center rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300 py-2 text-[10px] font-bold uppercase transition shadow-sm"
                        >
                          CALL
                        </a>
                      ) : (
                        <button
                          disabled
                          className="w-full text-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400 py-2 text-[10px] font-bold uppercase"
                        >
                          CALL
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Customer Reviews Section */}
        {reviews.length > 0 && (
          <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[#0F172A] dark:text-white">
              Customer Reviews ({reviews.length})
            </h3>
            <div className="space-y-3">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="rounded-xl bg-slate-50 dark:bg-slate-900/50 p-4 border border-slate-200 dark:border-slate-700 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-800 dark:text-gray-200">
                      {rev.reviewerName || "Verified Buyer"}
                    </span>
                    <span className="text-amber-500 font-black">
                      {"★".repeat(rev.rating || 5)}
                    </span>
                  </div>
                  {rev.comment && (
                    <p className="text-gray-600 dark:text-gray-300">
                      "{rev.comment}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {isModalOpen && (
        <SellerRatingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          sellerId={sellerId}
          sellerName={sellerName}
          sellerItems={sellerItems}
        />
      )}
    </div>
  );
}
