import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
          if (items[0]?.sellerName) {
            setSellerName(items[0].sellerName);
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

  return (
    <div className="container mx-auto max-w-6xl p-4">
      {loading ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">Loading seller profile...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header & Review Action */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {sellerName || "Seller Profile"}
                </h1>
                <div className="mt-1 flex items-center gap-2">
                  <TrustBadge />
                  {avgRating && (
                    <span className="text-sm font-semibold text-amber-500">
                      ★ {avgRating} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                    </span>
                  )}
                </div>
              </div>

              {!isOwnProfile && (
                <div>
                  {hasUserReviewed ? (
                    <button
                      disabled
                      className="cursor-not-allowed rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-semibold text-gray-400"
                    >
                      ✓ Review Submitted
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
                      className="rounded-lg bg-soko-green px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
                    >
                      ★ Rate & Review Seller
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 1: Items Listed by Seller */}
          <div>
            <h2 className="mb-4 text-xl font-bold text-gray-800">Items Listed by Seller</h2>
            {sellerItems.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <p className="font-medium text-gray-500">This seller currently has no active listings.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {sellerItems.map((item) => (
                  <ItemCard key={item.id} item={item} isSellerView={true} />
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Customer Reviews (Moved Below Listings) */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-gray-800">Customer Reviews</h3>
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500">No reviews yet for this seller.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="rounded-xl bg-gray-50 p-4 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800">
                          {rev.reviewerName || "Verified Buyer"}
                        </span>
                        {rev.itemTitle && (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                            Item: {rev.itemTitle}
                          </span>
                        )}
                      </div>
                      <span className="text-amber-500 font-bold">{"★".repeat(rev.rating || 5)}</span>
                    </div>
                    {rev.comment && <p className="mt-2 text-gray-600">{rev.comment}</p>}
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
  );
}
