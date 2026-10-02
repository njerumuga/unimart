import React, { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { uploadMultipleToCloudinary } from "../cloudinary";

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
  const [files, setFiles] = useState([]); // Array of { file, preview, type, id }
  const [submitting, setSubmitting] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const remainingSlots = 4 - files.length;
    if (remainingSlots <= 0) {
      alert("Maximum 4 photos/videos allowed per review.");
      return;
    }

    const allowed = selectedFiles.slice(0, remainingSlots);
    const newEntries = allowed.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      type: f.type.startsWith("video/") ? "video" : "image",
      id: Math.random().toString(36).substring(7),
    }));

    setFiles((prev) => [...prev, ...newEntries]);
    e.target.value = "";
  };

  const handleRemoveFile = (idToRemove) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === idToRemove);
      if (item && item.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== idToRemove);
    });
  };

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
    setUploadStatus("Uploading review photos/video...");

    try {
      let uploadedMedia = [];
      if (files.length > 0) {
        const rawFiles = files.map((item) => item.file);
        uploadedMedia = await uploadMultipleToCloudinary(
          rawFiles,
          (done, total, percent) => {
            setUploadStatus(`Uploading media (${done}/${total}) — ${percent}%...`);
          }
        );
      }

      const imageUrls = uploadedMedia
        .filter((m) => m.type === "image")
        .map((m) => m.url);
      
      const videoMedia = uploadedMedia.find((m) => m.type === "video");
      const videoUrl = videoMedia ? videoMedia.url : "";

      const selectedItem = sellerItems.find((item) => item.id === selectedItemId);

      setUploadStatus("Saving your review...");

      await addDoc(collection(db, "reviews"), {
        sellerId,
        reviewerId: user.uid,
        reviewerName: user.displayName || user.email?.split("@")[0] || "Verified Comrade",
        rating: Number(rating),
        comment: comment.trim(),
        itemId: selectedItemId || null,
        itemTitle: selectedItem ? selectedItem.title : null,
        media: uploadedMedia,
        images: imageUrls,
        imageUrl: imageUrls[0] || "",
        videoUrl: videoUrl,
        createdAt: serverTimestamp(),
      });

      alert("Thank you! Review submitted successfully.");
      setComment("");
      setRating(5);
      setSelectedItemId("");
      setFiles([]);
      if (onRatingSubmitted) onRatingSubmitted();
      onClose();
    } catch (err) {
      console.error("Error submitting rating:", err);
      alert("Error submitting review: " + err.message);
    } finally {
      setSubmitting(false);
      setUploadStatus("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2563EB] dark:text-blue-400">Verified Feedback</span>
            <h3 className="text-lg font-bold text-[#0F172A] dark:text-white">
              Rate & Review {sellerName || "Vendor"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 transition"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          {/* Optional Product Selector */}
          {sellerItems.length > 0 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                Purchased Item (Optional)
              </label>
              <select
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="">-- General Vendor Review --</option>
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
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Rating
            </label>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl transition-transform hover:scale-125 focus:outline-none ${
                    star <= rating ? "text-[#F97316]" : "text-slate-300 dark:text-slate-600"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Review Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Your Review / Experience <span className="text-red-500">*</span>
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Was the item in good condition? Fast response? How did the transaction go?"
              rows="3"
              required
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] font-medium text-slate-900 dark:text-white"
            />
          </div>

          {/* Review Photos & Video Proof Upload */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
              Attach Photos or Video Proof ({files.length}/4) <span className="text-slate-400 font-normal lowercase">(optional)</span>
            </label>
            
            <div className="space-y-3">
              <div className="rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-4 text-center hover:border-[#2563EB] transition bg-slate-50 dark:bg-slate-900/40">
                <input
                  type="file"
                  id="review-media-upload"
                  multiple
                  accept="image/*,video/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="review-media-upload" className="cursor-pointer block space-y-1">
                  <div className="text-xl">📸 🎥</div>
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Add photos of received product or unboxing video
                  </p>
                  <p className="text-[10px] text-slate-400">
                    Helps other comrades verify item quality & authenticity
                  </p>
                </label>
              </div>

              {/* Previews */}
              {files.length > 0 && (
                <div className="grid grid-cols-4 gap-2">
                  {files.map((item) => (
                    <div
                      key={item.id}
                      className="relative aspect-square rounded-xl overflow-hidden bg-black/5 border border-slate-200 dark:border-slate-700"
                    >
                      {item.type === "video" ? (
                        <div className="w-full h-full bg-black flex items-center justify-center">
                          <span className="text-white text-[10px] font-black">▶ Video</span>
                        </div>
                      ) : (
                        <img
                          src={item.preview}
                          alt="Review attachment"
                          className="w-full h-full object-cover"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(item.id)}
                        className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {uploadStatus && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-[#2563EB] dark:text-blue-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
              <span>{uploadStatus}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-[#F97316] hover:bg-[#EA580C] py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50"
          >
            {submitting ? "Submitting Review..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
