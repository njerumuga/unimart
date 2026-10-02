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

export default function AdminModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState("pending");
  const [pendingItems, setPendingItems] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [bannerForm, setBannerForm] = useState({
    title: "",
    details: "",
    phone: "",
    imageUrl: "",
  });
  const [bannerSubmitting, setBannerSubmitting] = useState(false);

  // Fetch pending items
  useEffect(() => {
    if (!isOpen) return;
    const q = query(collection(db, "items"), where("isApproved", "==", false));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setPendingItems(arr);
    });
    return () => unsub();
  }, [isOpen]);

  // Fetch featured items
  useEffect(() => {
    if (!isOpen) return;
    const q = query(collection(db, "items"), where("isFeatured", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setFeaturedItems(arr);
    });
    return () => unsub();
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
      alert("✅ Deleted");
    } catch (err) {
      alert("Error deleting: " + err.message);
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

  const handlePublishBanner = async (e) => {
    e.preventDefault();
    if (!bannerForm.title || !bannerForm.details) {
      alert("Please enter title and promo details.");
      return;
    }
    setBannerSubmitting(true);
    try {
      await addDoc(collection(db, "banners"), {
        title: bannerForm.title.trim(),
        details: bannerForm.details.trim(),
        phone: bannerForm.phone.trim(),
        imageUrl: bannerForm.imageUrl.trim(),
        createdAt: serverTimestamp(),
        active: true,
      });
      alert("🎉 Business Spotlight Banner published successfully!");
      setBannerForm({ title: "", details: "", phone: "", imageUrl: "" });
    } catch (err) {
      console.error("Error creating banner:", err);
      alert("Failed to publish banner: " + err.message);
    } finally {
      setBannerSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-800 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 transition-all max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-base font-bold text-[#0F172A] dark:text-white flex items-center gap-2">
            <span>⚙️</span> SokoHub Admin Panel
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tab Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-t-xl px-2 mt-3">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 text-center ${
              activeTab === "pending"
                ? "border-[#2563EB] text-[#2563EB] dark:text-blue-400 font-black"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            Pending ({pendingItems.length})
          </button>
          <button
            onClick={() => setActiveTab("featured")}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 text-center ${
              activeTab === "featured"
                ? "border-[#2563EB] text-[#2563EB] dark:text-blue-400 font-black"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            Featured ({featuredItems.length})
          </button>
          <button
            onClick={() => setActiveTab("banner")}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 text-center ${
              activeTab === "banner"
                ? "border-[#2563EB] text-[#2563EB] dark:text-blue-400 font-black"
                : "border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            Post Banner
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto py-4 px-1 space-y-4">
          {activeTab === "pending" && (
            <div>
              {pendingItems.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    No pending listings requiring approval right now. All caught up!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl || "https://via.placeholder.com/100"}
                          alt={item.title}
                          className="w-14 h-14 rounded-xl object-cover bg-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] font-bold text-[#2563EB] dark:text-blue-400">
                            KSh {Number(item.price || 0).toLocaleString()} • {item.category}
                          </p>
                          <p className="text-[10px] text-slate-500 truncate">
                            Seller: {item.sellerName || "User"} (📍 {item.locationZone})
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => handleDecision(item.id, true)}
                          className="w-full rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white py-2 text-[11px] font-bold uppercase tracking-wider transition shadow-sm"
                        >
                          ✓ Approve
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-full rounded-xl bg-red-600 hover:bg-red-700 text-white py-2 text-[11px] font-bold uppercase tracking-wider transition shadow-sm"
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "featured" && (
            <div>
              {featuredItems.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    No active featured items at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {featuredItems.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-slate-50 dark:bg-slate-900/60 p-4 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.imageUrl || "https://via.placeholder.com/100"}
                          alt={item.title}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-200"
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] font-bold text-[#F97316]">
                            KSh {Number(item.price || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                        className="rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-900 px-3 py-1.5 text-[10px] font-bold uppercase transition"
                      >
                        Unpin
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "banner" && (
            <form onSubmit={handlePublishBanner} className="space-y-3">
              <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                Post Campus Ad / Business Spotlight Banner
              </p>

              <div>
                <input
                  type="text"
                  placeholder="Banner Title"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  required
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-medium outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <textarea
                  placeholder="Promo Details"
                  value={bannerForm.details}
                  onChange={(e) => setBannerForm({ ...bannerForm, details: e.target.value })}
                  required
                  rows="3"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-medium outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Contact Phone"
                  value={bannerForm.phone}
                  onChange={(e) => setBannerForm({ ...bannerForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-medium outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <input
                  type="url"
                  placeholder="Image URL"
                  value={bannerForm.imageUrl}
                  onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-2.5 text-xs font-medium outline-none focus:border-[#2563EB]"
                />
              </div>

              <button
                type="submit"
                disabled={bannerSubmitting}
                className="w-full rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white py-3 text-xs font-black uppercase tracking-wider shadow-md transition disabled:opacity-50"
              >
                {bannerSubmitting ? "Publishing..." : "Publish Ad Banner"}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 text-center border-t border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white uppercase tracking-wider py-1"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
