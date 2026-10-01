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
        reviewerName: user.displayName || user.email?.split("@")[0] || "Verified Comrade",
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-[32px] bg-white p-6 sm:p-8 shadow-2xl border border-gray-100">
        <div className="flex items-center justify-between border-b border-gray-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00a651]">Feedback</span>
            <h3 className="text-lg font-black text-gray-900">
              Rate {sellerName || "Seller"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Optional Product Selector */}
          {sellerItems.length > 0 && (
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                Purchased Item (Optional)
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20 bg-white"
              >
                <option value="">-- General Seller Review --</option>
                {sellerItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title} (KSh {Number(item.price || 0).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Star Rating Selection */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
              Rating
            </label>
            <div className="flex items-center gap-2 bg-[#f9fffb] p-3 rounded-2xl border border-green-100 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-transform hover:scale-125 focus:outline-none ${
                    star <= rating ? "text-[#ffb800]" : "text-gray-200"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Review Input */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
              Your Review / Experience
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Was the item in good condition? Fast response? Polite seller?"
              rows="3"
              required
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[#00a651] focus:ring-2 focus:ring-[#00a651]/20"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-2xl bg-[#00a651] hover:bg-emerald-600 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
          >
            {submitting ? "Submitting Review..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
