import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function SellerRatingModal({
  sellerId,
  sellerName,
  sellerItems = [],
  isOpen,
  onClose,
  onRatingSubmitted,
}) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [selectedItemId, setSelectedItemId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in to submit a review.");
      return;
    }

    if (user.uid === sellerId) {
      alert("You cannot rate yourself.");
      return;
    }

    setSubmitting(true);

    try {
      const selectedItem = sellerItems.find((item) => item.id === selectedItemId);

      await addDoc(collection(db, "reviews"), {
        sellerId,
        reviewerId: user.uid,
        reviewerName: user.displayName || user.email || "Anonymous Comrade",
        rating: Number(rating),
        comment: comment.trim(),
        itemId: selectedItemId || null,
        itemTitle: selectedItem ? selectedItem.title : null,
        createdAt: serverTimestamp(),
      });

      alert("Thank you! Review submitted successfully.");
      setComment("");
      setRating(5);
      setSelectedItemId("");
      if (onRatingSubmitted) onRatingSubmitted();
      onClose();
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("Error submitting review: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-lg font-black uppercase text-gray-900">
            Rate <span className="text-[#00a651]">{sellerName || "Seller"}</span>
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Optional Product Selector */}
          {sellerItems.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
                Purchased Item (Optional)
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 p-3 text-sm outline-none focus:border-[#00a651]"
              >
                <option value="">-- General Seller Review --</option>
                {sellerItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} (KSh {item.price})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Star Rating Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Star Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-2xl transition-transform hover:scale-125 ${
                    star <= rating ? "text-[#ffb800]" : "text-gray-300"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Review Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Review / Experience
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience buying from this seller..."
              rows="4"
              required
              className="w-full rounded-2xl border border-gray-200 p-3 text-sm outline-none focus:border-[#00a651]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-[#00a651] py-3 text-xs font-black uppercase tracking-widest text-white shadow-md transition-all hover:bg-black disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
