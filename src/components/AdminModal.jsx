import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { uploadToCloudinary } from "../cloudinary";
import EditItemModal from "./EditItemModal";

export default function AdminModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingItems, setPendingItems] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [allItems, setAllItems] = useState([]);
  const [activeBanners, setActiveBanners] = useState([]);

  // Banner form state
  const [bannerForm, setBannerForm] = useState({
    title: "",
    details: "",
    phone: "",
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [bannerPreview, setBannerPreview] = useState("");
  const [bannerSubmitting, setBannerSubmitting] = useState(false);
  const [bannerUploadProgress, setBannerUploadProgress] = useState(0);

  // Edit item state
  const [editingItem, setEditingItem] = useState(null);

  // Fetch pending items
  useEffect(() => {
    if (!isOpen) return;
    const q = query(collection(db, "items"), where("isApproved", "==", false));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPendingItems(arr);
    }, (err) => console.error("Error fetching pending:", err));
    return () => unsub();
  }, [isOpen]);

  // Fetch featured items
  useEffect(() => {
    if (!isOpen) return;
    const q = query(collection(db, "items"), where("isFeatured", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFeaturedItems(arr);
    }, (err) => console.error("Error fetching featured:", err));
    return () => unsub();
  }, [isOpen]);

  // Fetch all live approved items
  useEffect(() => {
    if (!isOpen) return;
    const q = query(collection(db, "items"), where("isApproved", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setAllItems(arr);
    }, (err) => console.error("Error fetching live items:", err));
    return () => unsub();
  }, [isOpen]);

  // Fetch active banners from banners collection or items fallback
  useEffect(() => {
    if (!isOpen) return;
    let unsubBanners = () => {};
    try {
      const q = query(collection(db, "banners"));
      unsubBanners = onSnapshot(q, (snap) => {
        const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setActiveBanners(arr);
      }, (err) => {
        console.warn("Banners collection listen failed, trying items fallback:", err);
      });
    } catch (e) {
      console.warn("Could not query banners:", e);
    }
    return () => unsubBanners();
  }, [isOpen]);

  const handleDecision = async (id, approved) => {
    try {
      const ref = doc(db, "items", id);
      await updateDoc(ref, { isApproved: approved });
      alert(approved ? "✅ Approved and published to SokoHub feed!" : "❌ Rejected");
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("🗑️ Permanently delete this listing?")) return;
    try {
      await deleteDoc(doc(db, "items", id));
      alert("✅ Listing deleted successfully");
    } catch (err) {
      alert("Error deleting: " + err.message);
    }
  };

  const handleDeleteBanner = async (bannerId) => {
    if (!window.confirm("🗑️ Delete this ad banner?")) return;
    try {
      await deleteDoc(doc(db, "banners", bannerId));
      setActiveBanners((prev) => prev.filter((b) => b.id !== bannerId));
      alert("✅ Banner deleted");
    } catch (err) {
      console.error("Error deleting banner:", err);
      try {
        await deleteDoc(doc(db, "items", bannerId));
        setActiveBanners((prev) => prev.filter((b) => b.id !== bannerId));
        alert("✅ Banner deleted");
      } catch (err2) {
        alert("Error deleting banner: " + err2.message);
      }
    }
  };

  const handleToggleFeatured = async (id, currentFeatured) => {
    try {
      const ref = doc(db, "items", id);
      await updateDoc(ref, { isFeatured: !currentFeatured });
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const handleBannerFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
  };

  const removeBannerFile = () => {
    setBannerFile(null);
    setBannerPreview("");
  };

  const handlePublishBanner = async (e) => {
    e.preventDefault();
    if (!bannerForm.title.trim() || !bannerForm.details.trim()) {
      alert("Please enter banner title and promo details.");
      return;
    }

    setBannerSubmitting(true);
    setBannerUploadProgress(10);

    try {
      let imageUrl = "";
      if (bannerFile) {
        imageUrl = await uploadToCloudinary(bannerFile, (pct) => {
          setBannerUploadProgress(pct);
        });
      }

      const bannerData = {
        title: bannerForm.title.trim(),
        details: bannerForm.details.trim(),
        phone: bannerForm.phone.trim(),
        imageUrl: imageUrl || "",
        createdAt: serverTimestamp(),
        active: true,
        category: "AdBanner",
      };

      try {
        // Attempt primary write to banners collection
        await addDoc(collection(db, "banners"), bannerData);
      } catch (permissionErr) {
        console.warn("Direct banners collection failed, saving as featured banner item:", permissionErr);
        // Fallback: write to items collection
        await addDoc(collection(db, "items"), {
          ...bannerData,
          price: 0,
          description: bannerForm.details.trim(),
          sellerName: "SokoHub Sponsor",
          sellerPhone: bannerForm.phone.trim(),
          isBanner: true,
          isApproved: true,
          isFeatured: true,
          locationZone: "Main Gate",
        });
      }

      // Also save in local storage cache for immediate local preview
      try {
        const localCached = JSON.parse(localStorage.getItem("sokohub_active_banners") || "[]");
        localCached.unshift({ ...bannerData, id: "local_" + Date.now() });
        localStorage.setItem("sokohub_active_banners", JSON.stringify(localCached));
      } catch (storageErr) {
        console.warn("Storage cache note:", storageErr);
      }

      alert("🎉 Business Spotlight Banner published successfully!");
      setBannerForm({ title: "", details: "", phone: "" });
      removeBannerFile();
    } catch (err) {
      console.error("Error creating banner:", err);
      alert("Failed to publish banner: " + err.message);
    } finally {
      setBannerSubmitting(false);
      setBannerUploadProgress(0);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      >
        <div 
          className="relative w-full max-w-2xl rounded-[32px] bg-[#f0ecf4] dark:bg-[#1f2937] p-6 sm:p-8 shadow-2xl transition-all max-h-[90vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-black text-gray-900 dark:text-white flex items-center gap-2">
              <span>⚙️</span> SokoHub Admin Panel
            </h3>
            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mt-3 text-xs font-black overflow-x-auto no-scrollbar gap-1">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 min-w-[90px] py-2.5 text-center transition border-b-2 uppercase tracking-wider ${
                activeTab === "pending"
                  ? "border-[#00a651] text-[#00a651]"
                  : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Pending ({pendingItems.length})
            </button>
            <button
              onClick={() => setActiveTab("featured")}
              className={`flex-1 min-w-[90px] py-2.5 text-center transition border-b-2 uppercase tracking-wider ${
                activeTab === "featured"
                  ? "border-[#ffb800] text-amber-600 dark:text-[#ffb800]"
                  : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              Featured ({featuredItems.length})
            </button>
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 min-w-[90px] py-2.5 text-center transition border-b-2 uppercase tracking-wider ${
                activeTab === "all"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              All Live ({allItems.length})
            </button>
            <button
              onClick={() => setActiveTab("banner")}
              className={`flex-1 min-w-[100px] py-2.5 text-center transition border-b-2 uppercase tracking-wider ${
                activeTab === "banner"
                  ? "border-[#00a651] text-[#00a651]"
                  : "border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
              }`}
            >
              📢 Post Ad / Banners ({activeBanners.length})
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
            {/* PENDING TAB */}
            {activeTab === "pending" && (
              <div>
                {pendingItems.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-2xl">🎉</p>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      No pending items for review. All caught up!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-sm space-y-3"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl || "https://via.placeholder.com/100"}
                            alt={item.title}
                            className="w-14 h-14 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs sm:text-sm font-black text-gray-900 dark:text-white truncate">
                              {item.title}
                            </h4>
                            <p className="text-xs font-bold text-[#00a651]">
                              KSh {Number(item.price || 0).toLocaleString()}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              By {item.sellerName || "Seller"} • 📍 {item.locationZone || "Main Gate"}
                            </p>
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-100 dark:border-gray-700">
                          <button
                            onClick={() => handleDecision(item.id, true)}
                            className="rounded-xl bg-[#00a651] hover:bg-emerald-600 text-white py-2 text-[11px] font-black uppercase tracking-wider transition shadow-sm"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => setEditingItem(item)}
                            className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white py-2 text-[11px] font-black uppercase tracking-wider transition shadow-sm"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-xl bg-red-600 hover:bg-red-700 text-white py-2 text-[11px] font-black uppercase tracking-wider transition shadow-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FEATURED TAB */}
            {activeTab === "featured" && (
              <div>
                {featuredItems.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      No active featured items at the moment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {featuredItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.imageUrl || "https://via.placeholder.com/100"}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                              {item.title}
                            </h4>
                            <p className="text-[11px] font-bold text-[#ffb800]">
                              KSh {Number(item.price || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 text-[10px] font-bold uppercase transition"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                            className="rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 px-3 py-1.5 text-[10px] font-bold uppercase transition"
                          >
                            Unpin
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-xl bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 text-[10px] font-bold uppercase transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ALL LIVE LISTINGS TAB */}
            {activeTab === "all" && (
              <div>
                {allItems.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      No active listings found.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={item.imageUrl || "https://via.placeholder.com/100"}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-black text-gray-900 dark:text-white truncate">
                              {item.title}
                            </h4>
                            <p className="text-[11px] font-bold text-[#00a651]">
                              KSh {Number(item.price || 0).toLocaleString()} • {item.locationZone}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingItem(item)}
                            className="rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 text-[10px] font-bold uppercase transition"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                            className={`rounded-xl px-2.5 py-1.5 text-[10px] font-bold uppercase transition ${
                              item.isFeatured
                                ? "bg-amber-100 text-amber-900"
                                : "bg-gray-100 text-gray-700 hover:bg-yellow-100"
                            }`}
                          >
                            {item.isFeatured ? "⭐ Featured" : "☆ Feature"}
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded-xl bg-red-50 hover:bg-red-100 text-red-600 px-2.5 py-1.5 text-[10px] font-bold uppercase transition"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* POST AD / BANNERS TAB */}
            {activeTab === "banner" && (
              <div className="space-y-6">
                <form onSubmit={handlePublishBanner} className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white">
                    Post Campus Ad / Business Spotlight Banner
                  </p>

                  <div>
                    <input
                      type="text"
                      placeholder="Business / Banner Title *"
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                      required
                      className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-xs font-medium outline-none focus:border-[#00a651]"
                    />
                  </div>

                  <div>
                    <textarea
                      placeholder="Promo Details & Offer description *"
                      value={bannerForm.details}
                      onChange={(e) => setBannerForm({ ...bannerForm, details: e.target.value })}
                      required
                      rows="3"
                      className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-xs font-medium outline-none focus:border-[#00a651]"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Contact WhatsApp / Phone Number"
                      value={bannerForm.phone}
                      onChange={(e) => setBannerForm({ ...bannerForm, phone: e.target.value })}
                      className="w-full rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-xs font-medium outline-none focus:border-[#00a651]"
                    />
                  </div>

                  {/* Direct Image File Upload from Computer */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                      Upload Banner Graphic / Poster from Computer:
                    </label>

                    {bannerPreview ? (
                      <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 max-h-48 bg-gray-100 flex items-center justify-center">
                        <img
                          src={bannerPreview}
                          alt="Banner Preview"
                          className="w-full h-auto max-h-48 object-contain"
                        />
                        <button
                          type="button"
                          onClick={removeBannerFile}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-black shadow hover:bg-red-700"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="cursor-pointer rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-[#00a651] p-4 flex flex-col items-center justify-center text-center gap-1.5 transition bg-gray-50 dark:bg-gray-700/50">
                        <span className="text-2xl">🖼️</span>
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-200">
                          Click to select banner image from computer
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Supports PNG, JPEG, WebP, GIF
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleBannerFileSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {bannerUploadProgress > 0 && (
                    <div className="p-2.5 bg-green-50 dark:bg-green-900/30 text-[#00a651] text-xs font-bold rounded-xl flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-[#00a651] border-t-transparent rounded-full animate-spin"></div>
                      <span>Uploading to cloud ({bannerUploadProgress}%)...</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={bannerSubmitting}
                    className="w-full rounded-2xl bg-[#00a651] hover:bg-emerald-600 text-white py-3.5 text-xs font-black uppercase tracking-wider shadow-md transition disabled:opacity-50"
                  >
                    {bannerSubmitting ? "Publishing Ad Banner..." : "Publish Ad Banner"}
                  </button>
                </form>

                {/* Existing Banners Management List */}
                {activeBanners.length > 0 && (
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-black uppercase text-gray-700 dark:text-gray-300">
                      Existing Active Banners ({activeBanners.length})
                    </h4>
                    <div className="space-y-2">
                      {activeBanners.map((b) => (
                        <div
                          key={b.id}
                          className="rounded-2xl bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 flex items-center justify-between gap-3 shadow-sm"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {b.imageUrl ? (
                              <img
                                src={b.imageUrl}
                                alt={b.title}
                                className="w-12 h-12 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-sm font-bold text-[#00a651]">
                                📢
                              </div>
                            )}
                            <div className="min-w-0">
                              <h5 className="text-xs font-black text-gray-900 dark:text-white truncate">
                                {b.title}
                              </h5>
                              <p className="text-[10px] text-gray-500 truncate">
                                {b.details || b.description}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteBanner(b.id)}
                            className="rounded-xl bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 text-[10px] font-bold uppercase transition flex-shrink-0"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 text-center border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="text-xs font-black text-[#00a651] hover:underline uppercase tracking-wider py-1"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Edit Item Modal for Admins */}
      <EditItemModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        item={editingItem}
      />
    </>
  );
}
