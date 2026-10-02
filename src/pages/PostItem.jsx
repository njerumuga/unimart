import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Link } from "react-router-dom";
import { uploadMultipleToCloudinary } from "../cloudinary";
import { categories } from "../data/categories";
import { locations } from "../data/locations";

export default function PostItem() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    title: "",
    price: "",
    description: "",
    category: "Electronics",
    locationZone: "Main Gate",
    condition: "Used - Good",
    sellerPhone: "",
    requestFeatured: false,
  });

  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  const conditions = [
    "Brand New",
    "Used - Like New",
    "Used - Good",
    "Refurbished",
  ];

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-3xl mb-4">
          📝
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">
          Log in to Post an Item
        </h2>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          Connect with thousands of students and buyers across Meru University and surrounding campus hostels.
        </p>
        <Link
          to="/login"
          className="rounded-2xl bg-[#00a651] px-8 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-md hover:bg-emerald-600 transition"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (!selectedFiles.length) return;

    const remainingSlots = 8 - files.length;
    if (remainingSlots <= 0) {
      alert("Maximum 8 photos/videos allowed per listing.");
      return;
    }

    const allowedFiles = selectedFiles.slice(0, remainingSlots);
    const newFileEntries = allowedFiles.map((f) => ({
      file: f,
      preview: URL.createObjectURL(f),
      type: f.type.startsWith("video/") ? "video" : "image",
      id: Math.random().toString(36).substring(7),
    }));

    setFiles((prev) => [...prev, ...newFileEntries]);
    e.target.value = "";
  };

  const handleRemoveFile = (idToRemove) => {
    setFiles((prev) => {
      const item = prev.find((f) => f.id === idToRemove);
      if (item && item.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((f) => f.id !== idToRemove);
    });
  };

  const handleSetCover = (index) => {
    if (index === 0) return;
    setFiles((prev) => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      copy.unshift(selected);
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploadStatus("Uploading media files to Cloudinary...");

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

      const primaryImageUrl =
        imageUrls.length > 0
          ? imageUrls[0]
          : uploadedMedia.length > 0
          ? uploadedMedia[0].url
          : "https://via.placeholder.com/600x400?text=No+Image";

      const phoneVal = form.sellerPhone.trim();

      setUploadStatus("Saving listing to SokoHub...");

      await addDoc(collection(db, "items"), {
        title: form.title.trim(),
        price: Number(form.price),
        description: form.description ? form.description.trim() : form.title.trim(),
        category: form.category || "General",
        locationZone: form.locationZone || "Main Gate",
        condition: form.condition || "Used - Good",
        imageUrl: primaryImageUrl,
        imageUrls: imageUrls.length > 0 ? imageUrls : [primaryImageUrl],
        videoUrl: videoUrl,
        media: uploadedMedia,
        sellerPhone: phoneVal,
        whatsapp: phoneVal,
        phone: phoneVal,
        userId: user.uid,
        sellerId: user.uid,
        userName: user.displayName || user.email,
        sellerName: user.displayName || user.email || "Student Seller",
        createdAt: serverTimestamp(),
        isFeatured: false,
        requestFeatured: form.requestFeatured || false,
        paid: false,
        isApproved: false,
      });

      // Redirect directly to WhatsApp Admin chat
      const adminPhone = "254704196402";
      const textMsg = encodeURIComponent(
        `Hello Admin, I have just posted '${form.title.trim()}' on SokoHub with ${uploadedMedia.length} media files and need approval.`
      );

      window.location.href = `https://wa.me/${adminPhone}?text=${textMsg}`;
    } catch (err) {
      console.error("❌ Error posting item:", err);
      alert("Error: " + err.message);
      setLoading(false);
      setUploadStatus("");
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fffb] dark:bg-[#111827] pb-24">
      {/* Top Green Banner */}
      <div className="bg-[#00a651] text-white px-4 py-6 sm:px-6 md:px-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Post New Listing
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photos Header */}
          <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
            <span>Product Photos ({files.length}/8)</span>
            <span className="text-gray-400">Up to 8 photos</span>
          </div>

          {/* Photo Dropzone Box */}
          <div className="rounded-[24px] border-2 border-[#00a651]/40 bg-[#eaf7ee] dark:bg-[#1a2e22] p-6 text-center hover:border-[#00a651] transition">
            <input
              type="file"
              id="product-photo-upload"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="product-photo-upload"
              className="cursor-pointer space-y-1 block py-3"
            >
              <p className="text-xs sm:text-sm font-black text-[#00a651] flex items-center justify-center gap-1.5">
                <span>📸</span> + Select Product Photos (Up to 8)
              </p>
              <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                Show multiple photos and usage angles
              </p>
            </label>
          </div>

          {/* Media Preview Grid */}
          {files.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {files.map((item, index) => (
                <div
                  key={item.id}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-black/5 border-2 border-gray-200 dark:border-gray-700 hover:border-[#00a651]"
                >
                  {item.type === "video" ? (
                    <div className="w-full h-full relative bg-black flex items-center justify-center">
                      <video
                        src={item.preview}
                        className="w-full h-full object-cover opacity-80"
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-white/80 text-black flex items-center justify-center text-[10px] font-black">
                          ▶
                        </div>
                      </div>
                    </div>
                  ) : (
                    <img
                      src={item.preview}
                      alt={`Preview ${index}`}
                      className="w-full h-full object-cover"
                    />
                  )}

                  <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                    {index === 0 ? (
                      <span className="bg-[#00a651] text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md">
                        Cover
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="bg-black/70 hover:bg-[#00a651] text-white text-[8px] font-bold uppercase px-1.5 py-0.5 rounded-md"
                      >
                        Set Cover
                      </button>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(item.id)}
                    className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold shadow-sm"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Item Title */}
          <div>
            <div className="relative">
              <input
                name="title"
                placeholder="Item Title *"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3.5 text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#00a651]"
              />
            </div>
          </div>

          {/* Price (KES) */}
          <div>
            <div className="relative">
              <input
                name="price"
                type="number"
                placeholder="Price (KES) *"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                required
                min="0"
                className="w-full rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3.5 text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#00a651]"
              />
            </div>
          </div>

          {/* Condition Dropdown */}
          <div className="relative">
            <span className="absolute -top-2.5 left-4 bg-white dark:bg-gray-800 px-1 text-[10px] font-bold text-gray-500">
              Condition *
            </span>
            <select
              value={form.condition}
              onChange={(e) => setForm({ ...form, condition: e.target.value })}
              className="w-full rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3.5 text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#00a651] appearance-none"
            >
              {conditions.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-gray-500">
              ▼
            </div>
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <span className="absolute -top-2.5 left-4 bg-white dark:bg-gray-800 px-1 text-[10px] font-bold text-[#00a651]">
              Category *
            </span>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-2xl border-2 border-[#00a651] bg-white dark:bg-gray-800 px-4 py-3.5 text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#00a651]">
              ▲
            </div>
          </div>

          {/* Campus Zone Dropdown */}
          <div className="relative">
            <span className="absolute -top-2.5 left-4 bg-white dark:bg-gray-800 px-1 text-[10px] font-bold text-[#00a651]">
              Campus Zone *
            </span>
            <select
              value={form.locationZone}
              onChange={(e) => setForm({ ...form, locationZone: e.target.value })}
              className="w-full rounded-2xl border-2 border-[#00a651] bg-white dark:bg-gray-800 px-4 py-3.5 text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none appearance-none"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  📍 {loc}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#00a651]">
              ▼
            </div>
          </div>

          {/* WhatsApp / Phone Number */}
          <div>
            <div className="relative">
              <input
                name="sellerPhone"
                placeholder="WhatsApp / Phone Number *"
                value={form.sellerPhone}
                onChange={(e) => setForm({ ...form, sellerPhone: e.target.value })}
                required
                className="w-full rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3.5 text-xs sm:text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-[#00a651]"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="relative">
              <textarea
                name="description"
                placeholder="Description & details (optional)..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows="3"
                className="w-full rounded-2xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-xs sm:text-sm font-medium text-gray-900 dark:text-white outline-none focus:border-[#00a651]"
              />
            </div>
          </div>

          {/* Upload Status Alert */}
          {uploadStatus && (
            <div className="p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-[#00a651] rounded-2xl text-xs font-bold flex items-center gap-2">
              <div className="w-3.5 h-3.5 border-2 border-[#00a651] border-t-transparent rounded-full animate-spin"></div>
              <span>{uploadStatus}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#00a651] hover:bg-emerald-600 py-4 text-xs sm:text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? "Posting..." : "Post Listing"}
          </button>
        </form>
      </div>
    </div>
  );
}
