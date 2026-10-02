import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";
import { categories } from "../data/categories";
import { locations } from "../data/locations";
import { uploadMultipleToCloudinary } from "../cloudinary";
import { useAuth } from "../contexts/AuthContext";

export default function EditItemModal({ isOpen, onClose, item, onUpdated }) {
  const { isAdmin } = useAuth();

  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "Electronics",
    condition: "Used - Good",
    locationZone: "Main Gate",
    sellerPhone: "",
    description: "",
    isApproved: true,
    isFeatured: false,
  });

  const [existingMedia, setExistingMedia] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const conditions = [
    "Brand New",
    "Used - Like New",
    "Used - Good",
    "Refurbished",
  ];

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || "",
        price: item.price !== undefined ? String(item.price) : "",
        category: item.category || "Electronics",
        condition: item.condition || "Used - Good",
        locationZone: item.locationZone || "Main Gate",
        sellerPhone: item.sellerPhone || item.whatsapp || item.phone || "",
        description: item.description || "",
        isApproved: item.isApproved !== undefined ? item.isApproved : true,
        isFeatured: item.isFeatured !== undefined ? item.isFeatured : false,
      });

      // Assemble existing media
      let mediaArr = [];
      if (Array.isArray(item.media) && item.media.length > 0) {
        mediaArr = [...item.media];
      } else if (Array.isArray(item.imageUrls) && item.imageUrls.length > 0) {
        mediaArr = item.imageUrls.map((url) => ({ url, type: "image", name: "Photo" }));
      } else if (item.imageUrl) {
        mediaArr = [{ url: item.imageUrl, type: "image", name: "Photo" }];
      }
      setExistingMedia(mediaArr);
      setNewFiles([]);
      setUploadStatus("");
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const currentTotal = existingMedia.length + newFiles.length;
    const remainingSlots = 8 - currentTotal;
    if (remainingSlots <= 0) {
      alert("Maximum 8 photos/videos allowed per listing.");
      return;
    }

    const allowed = selectedFiles.slice(0, remainingSlots);
    const mapped = allowed.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      type: f.type.startsWith("video/") ? "video" : "image",
      id: Math.random().toString(36).substring(7),
    }));

    setNewFiles((prev) => [...prev, ...mapped]);
  };

  const removeExistingMedia = (index) => {
    setExistingMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const removeNewFile = (id) => {
    setNewFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      alert("Please enter a listing title.");
      return;
    }
    if (!form.price || isNaN(form.price)) {
      alert("Please enter a valid price in KSh.");
      return;
    }
    if (!form.sellerPhone.trim()) {
      alert("Please enter a valid WhatsApp or phone number.");
      return;
    }

    if (existingMedia.length === 0 && newFiles.length === 0) {
      alert("Please provide at least one photo for this listing.");
      return;
    }

    setLoading(true);

    try {
      let finalMedia = [...existingMedia];

      // Upload newly attached files if any
      if (newFiles.length > 0) {
        setUploadStatus("Uploading updated media to Cloudinary...");
        const rawFiles = newFiles.map((nf) => nf.file);
        const uploadedResults = await uploadMultipleToCloudinary(
          rawFiles,
          (completed, total, percent) => {
            setUploadStatus(`Uploading media ${completed}/${total} (${percent}%)...`);
          }
        );
        finalMedia = [...finalMedia, ...uploadedResults];
      }

      setUploadStatus("Saving listing updates...");

      const imageUrls = finalMedia
        .filter((m) => m.type === "image" || !m.type)
        .map((m) => m.url);

      const videoMedia = finalMedia.find((m) => m.type === "video");
      const videoUrl = videoMedia ? videoMedia.url : "";

      const primaryImageUrl = imageUrls[0] || (finalMedia[0] ? finalMedia[0].url : "");

      const updatePayload = {
        title: form.title.trim(),
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        locationZone: form.locationZone,
        sellerPhone: form.sellerPhone.trim(),
        description: form.description.trim(),
        imageUrl: primaryImageUrl,
        imageUrls: imageUrls,
        videoUrl: videoUrl,
        media: finalMedia,
        updatedAt: new Date().toISOString(),
      };

      if (isAdmin) {
        updatePayload.isApproved = form.isApproved;
        updatePayload.isFeatured = form.isFeatured;
      }

      const itemRef = doc(db, "items", item.id);
      await updateDoc(itemRef, updatePayload);

      alert("✅ Listing updated successfully!");
      if (onUpdated) onUpdated({ id: item.id, ...updatePayload });
      onClose();
    } catch (err) {
      console.error("Failed to update item:", err);
      alert("Error updating listing: " + err.message);
    } finally {
      setLoading(false);
      setUploadStatus("");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl rounded-[32px] bg-white dark:bg-gray-800 p-6 sm:p-8 shadow-2xl transition-all max-h-[92vh] overflow-y-auto space-y-4 border border-gray-100 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">✏️</span>
            <div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                Edit Listing
              </h3>
              <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                Update item details, price, location, or photos
              </p>
            </div>
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

        {/* Edit Form */}
        <form onSubmit={handleSave} className="space-y-4">
          {/* Photos / Media Gallery */}
          <div className="space-y-2">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300">
              Listing Media (Photos & Videos)
            </label>

            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {/* Existing Media Items */}
              {existingMedia.map((m, idx) => (
                <div
                  key={`exist-${idx}`}
                  className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-100 group"
                >
                  {m.type === "video" ? (
                    <div className="w-full h-full bg-black flex items-center justify-center text-white text-xs font-bold">
                      🎬 Video
                    </div>
                  ) : (
                    <img src={m.url} alt="media" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeExistingMedia(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black shadow hover:bg-red-700 transition"
                  >
                    ✕
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-[#00a651] text-white text-[8px] font-black uppercase px-1 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}

              {/* Newly Picked Files */}
              {newFiles.map((nf) => (
                <div
                  key={nf.id}
                  className="relative aspect-square rounded-xl overflow-hidden border-2 border-dashed border-[#00a651] bg-gray-100 group"
                >
                  {nf.type === "video" ? (
                    <div className="w-full h-full bg-black flex items-center justify-center text-white text-xs font-bold">
                      🎬 New Vid
                    </div>
                  ) : (
                    <img src={nf.preview} alt="preview" className="w-full h-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => removeNewFile(nf.id)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black shadow hover:bg-red-700 transition"
                  >
                    ✕
                  </button>
                  <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[8px] font-black uppercase px-1 rounded">
                    New
                  </span>
                </div>
              ))}

              {/* Add More Media Button */}
              {existingMedia.length + newFiles.length < 8 && (
                <label className="cursor-pointer aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#00a651] flex flex-col items-center justify-center text-center p-2 text-gray-500 hover:text-[#00a651] transition">
                  <span className="text-xl">➕</span>
                  <span className="text-[10px] font-black uppercase mt-1">Add File</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-[10px] text-gray-400">
              Select images or videos from your computer. First image is the cover.
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Title / Item Name *
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-[#00a651]"
            />
          </div>

          {/* Price & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Price (KSh) *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-xs sm:text-sm font-black text-[#00a651] outline-none focus:border-[#00a651]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#00a651]"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Condition & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Condition *
              </label>
              <select
                value={form.condition}
                onChange={(e) => setForm({ ...form, condition: e.target.value })}
                className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#00a651]"
              >
                {conditions.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Campus Location Zone *
              </label>
              <select
                value={form.locationZone}
                onChange={(e) => setForm({ ...form, locationZone: e.target.value })}
                className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#00a651]"
              >
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    📍 {loc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Seller WhatsApp / Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              WhatsApp / Contact Phone *
            </label>
            <input
              type="text"
              value={form.sellerPhone}
              onChange={(e) => setForm({ ...form, sellerPhone: e.target.value })}
              required
              placeholder="e.g. 0712345678"
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-xs sm:text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-[#00a651]"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Description & Details
            </label>
            <textarea
              rows="3"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Key specifications, reason for selling, hostel location..."
              className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-[#00a651]"
            />
          </div>

          {/* Admin Controls (Approve/Feature toggles) */}
          {isAdmin && (
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl flex items-center justify-between gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={form.isApproved}
                  onChange={(e) => setForm({ ...form, isApproved: e.target.checked })}
                  className="rounded text-[#00a651] focus:ring-[#00a651]"
                />
                <span>✓ Approved (Live)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-gray-800 dark:text-gray-200">
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="rounded text-[#ffb800] focus:ring-[#ffb800]"
                />
                <span>⭐ Featured</span>
              </label>
            </div>
          )}

          {/* Upload Status */}
          {uploadStatus && (
            <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-[#00a651] rounded-2xl text-xs font-bold flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-[#00a651] border-t-transparent rounded-full animate-spin"></div>
              <span>{uploadStatus}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-1/3 rounded-2xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 py-3.5 text-xs font-black uppercase text-gray-700 dark:text-gray-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-2/3 rounded-2xl bg-[#00a651] hover:bg-emerald-600 py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-lg transition active:scale-98 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
