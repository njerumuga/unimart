import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import ItemCard from "../components/ItemCard";
import SellerRatingModal from "../components/SellerRatingModal";
import TrustBadge from "../components/TrustBadge";

export default function SellerProfile() {
  const { sellerId } = useParams();
  const { user } = useAuth();
  const [sellerItems, setSellerItems] = useState([]);
  const [sellerName, setSellerName] = useState("");
  const [sellerPhone, setSellerPhone] = useState("");
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

  const isOwnProfile = user && user.uid === sellerId;
  const hasUserReviewed = user && reviews.some((r) => r.reviewerId === user.uid);

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : null;

  const initial = (sellerName || "S").trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f9fffb] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Navigation Breadcrumbs */}
        <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
          <Link to="/" className="hover:text-[#00a651] transition">Home</Link>
          <span>/</span>
          <span className="text-[#00a651]">Seller Storefront</span>
          <span>/</span>
          <span className="text-gray-700">{sellerName || "Seller"}</span>
        </nav>

        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-[#00a651] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Loading seller profile...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header Card */}
            <div className="rounded-[32px] border border-gray-100 bg-white p-6 sm:p-8 shadow-soft">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-100 border-4 border-[#00a651] flex items-center justify-center text-2xl sm:text-3xl font-black text-[#00a651] shadow-inner">
                    {initial}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl sm:text-2xl font-black text-gray-900">
                        {sellerName || "Campus Seller"}
                      </h1>
                      <TrustBadge type="verified" text="Verified Seller" />
                    </div>
                    <div className="mt-1 flex items-center gap-3">
                      {avgRating ? (
                        <span className="text-xs font-bold text-amber-500 bg-amber-50 px-2.5 py-1 rounded-full">
                          ★ {avgRating} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-gray-400">
                          New Comrade Seller
                        </span>
                      )}
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs font-bold text-gray-500">
                        {sellerItems.length} {sellerItems.length === 1 ? "Listing" : "Listings"}
                      </span>
                    </div>
                  </div>
                </div>

                {!isOwnProfile && (
                  <div className="flex items-center gap-3 flex-wrap">
                    {sellerPhone && (
                      <a
                        href={`https://wa.me/${(() => {
                          let c = sellerPhone.replace(/\D/g, "").trim();
                          if (c.startsWith("0")) return "254" + c.substring(1);
                          if (c.startsWith("7") || c.startsWith("1")) return "254" + c;
                          return c;
                        })()}?text=${encodeURIComponent(`Hi ${sellerName || "Seller"}, I'm browsing your SokoHub store and would like to inquire about your items.`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-2xl bg-[#00a651] hover:bg-emerald-600 text-white px-5 py-3.5 text-xs font-black uppercase tracking-widest shadow-md transition active:scale-95 flex items-center gap-1.5"
                      >
                        <span>💬</span> Chat
                      </a>
                    )}
                    {hasUserReviewed ? (
                      <button
                        disabled
                        className="cursor-not-allowed rounded-2xl bg-gray-100 px-5 py-3.5 text-xs font-black uppercase tracking-wider text-gray-400"
                      >
                        ✓ Reviewed
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (!user) {
                            alert("Please log in to leave a review.");
                            return;
                          }
                          setIsModalOpen(true);
                        }}
                        className="rounded-2xl bg-[#ffb800] hover:bg-yellow-400 text-black px-6 py-3.5 text-xs font-black uppercase tracking-widest shadow-md transition active:scale-95"
                      >
                        ★ Rate Seller
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Section 1: Active Listings */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 px-2">
                <h2 className="text-xl sm:text-2xl font-black text-[#00a651] uppercase italic tracking-tighter">
                  Active Listings ({sellerItems.length})
                </h2>
                <div className="h-1 flex-1 bg-[#ffb800] rounded-full opacity-30"></div>
              </div>

              {sellerItems.length === 0 ? (
                <div className="rounded-[32px] border border-dashed border-gray-200 bg-white p-12 text-center shadow-soft">
                  <div className="w-16 h-16 rounded-full bg-green-50 text-2xl flex items-center justify-center mx-auto mb-3">
                    📦
                  </div>
                  <h3 className="text-base font-bold text-gray-900">No active listings</h3>
                  <p className="text-xs text-gray-500 mt-1">This seller currently has no items listed for sale.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {sellerItems.map((item) => (
                    <ItemCard key={item.id} item={item} isSellerView={true} />
                  ))}
                </div>
              )}
            </div>

            {/* Section 2: Customer Reviews */}
            <div className="rounded-[32px] border border-gray-100 bg-white p-6 sm:p-8 shadow-soft space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-gray-900">
                    Verified Buyer Reviews
                  </h3>
                  <p className="text-xs text-gray-500">
                    Feedback from Meru University students and buyers
                  </p>
                </div>
                {avgRating && (
                  <div className="text-right">
                    <p className="text-xl font-black text-amber-500">★ {avgRating}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{reviews.length} total</p>
                  </div>
                )}
              </div>

              {reviews.length === 0 ? (
                <div className="rounded-2xl bg-gray-50/70 p-6 text-center text-xs text-gray-500 font-medium">
                  No buyer reviews yet. Be the first comrade to leave a review after purchasing!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="rounded-2xl bg-[#f9fffb] border border-green-100/60 p-5 text-sm space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-green-100 text-[#00a651] text-xs font-black flex items-center justify-center">
                            {(rev.reviewerName || "U").charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-gray-800 text-xs block">
                              {rev.reviewerName || "Verified Buyer"}
                            </span>
                            {rev.itemTitle && (
                              <span className="text-[10px] text-gray-400 truncate max-w-[150px] block">
                                Bought: {rev.itemTitle}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-amber-500 font-bold text-sm tracking-widest">
                          {"★".repeat(rev.rating || 5)}
                        </span>
                      </div>
                      {rev.comment && (
                        <p className="text-xs text-gray-600 leading-relaxed pt-1">
                          "{rev.comment}"
                        </p>
                      )}
                    </div>
                  ))}
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
        )}
      </div>
    </div>
  );
}
