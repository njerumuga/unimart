import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import ItemCard from "../components/ItemCard";
import SellerRatingModal from "../components/SellerRatingModal";
import TrustBadge from "../components/TrustBadge";

export default function SellerProfile() {
  const { sellerId } = useParams();
  const [sellerItems, setSellerItems] = useState([]);
  const [sellerName, setSellerName] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // 1. Fetch Seller's Items
    const itemsQuery = query(collection(db, "items"));
    const unsubItems = onSnapshot(itemsQuery, (snapshot) => {
      const items = [];
      let name = "";

      snapshot.forEach((doc) => {
        const data = doc.data();
        const isMatch =
          data.userId === sellerId ||
          data.sellerId === sellerId ||
          data.uid === sellerId;

        if (isMatch && data.isApproved === true) {
          items.push({ id: doc.id, ...data });
          if (!name) {
            name = data.userName || data.sellerName || "Seller";
          }
        }
      });

      setSellerItems(items);
      setSellerName(name || "Seller");
      setLoading(false);
    });

    // 2. Fetch Seller's Reviews
    const reviewsQuery = query(
      collection(db, "reviews"),
      where("sellerId", "==", sellerId)
    );
    const unsubReviews = onSnapshot(reviewsQuery, (snapshot) => {
      const revs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setReviews(revs);
    });

    return () => {
      unsubItems();
      unsubReviews();
    };
  }, [sellerId]);

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : "5.0";

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-[32px] p-8 shadow-md border-2 border-[#00a651] mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrustBadge type="trusted" text="Verified Seller" />
              <div className="flex items-center text-[#ffb800] font-black text-sm">
                ★ {avgRating} <span className="text-gray-400 font-bold ml-1">({reviews.length} reviews)</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 uppercase italic">
              {sellerName}'s <span className="text-[#00a651]">Listings</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-[#00a651] text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-md hover:bg-black transition-all"
            >
              ★ Leave Review
            </button>
            <div className="bg-[#ffb800] px-6 py-3 rounded-2xl font-black text-black text-sm uppercase shadow-md shrink-0">
              {sellerItems.length} {sellerItems.length === 1 ? "Item" : "Items"}
            </div>
          </div>
        </div>

        {/* Reviews Section Summary */}
        {reviews.length > 0 && (
          <div className="bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 mb-10">
            <h3 className="text-sm font-black uppercase text-gray-700 tracking-wider mb-4">
              Recent Buyer Feedback
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.slice(0, 4).map((rev) => (
                <div key={rev.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-gray-800">{rev.reviewerName}</span>
                    <span className="text-[#ffb800] text-xs">{"★".repeat(rev.rating || 5)}</span>
                  </div>
                  <p className="text-xs text-gray-600 italic">"{rev.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-20 font-black text-[#00a651] text-lg uppercase tracking-widest animate-pulse">
            Loading Listings...
          </div>
        ) : sellerItems.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center shadow-md border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No active listings found</h3>
            <p className="text-gray-500 text-sm">This seller doesn't have any active approved items posted.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sellerItems.map((item) => (
              <ItemCard key={item.id} item={item} isSellerView={true} />
            ))}
          </div>
        )}
      </div>

      <SellerRatingModal
        sellerId={sellerId}
        sellerName={sellerName}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
