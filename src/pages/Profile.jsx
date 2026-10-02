import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import AdminModal from "../components/AdminModal";

export default function Profile() {
  const { user, isAdmin, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "items"),
      where("userId", "==", user.uid)
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setItems(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching user profile items:", err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleDeleteItem = async (itemId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this listing?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "items", itemId));
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Could not delete item: " + err.message);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center bg-[#F8FAFC] dark:bg-[#0F172A]">
        <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-3xl mb-4 text-[#2563EB]">
          👤
        </div>
        <h2 className="text-2xl font-bold text-[#0F172A] dark:text-white mb-2">
          Log in to view your profile
        </h2>
        <p className="text-sm text-slate-500 max-w-sm mb-6">
          Manage your active campus listings, view approval status, and manage your account.
        </p>
        <Link
          to="/login"
          className="rounded-xl bg-[#2563EB] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-blue-700 transition"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const displayName = user.displayName || user.email?.split("@")[0] || "Comrade Seller";

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0F172A] pb-24">
      {/* Top Midnight Banner */}
      <div className="bg-[#0F172A] text-white px-4 py-6 sm:px-6 md:px-12 border-b border-slate-800">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            My Profile
          </h1>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-slate-300 hover:text-white transition underline underline-offset-4"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 -mt-2 space-y-6 pt-4">
        {/* User / Admin Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 border border-slate-200/80 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-white">
                {displayName}
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                {user.email}
              </p>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2">
                Total Posted Items: {items.length}
              </p>
            </div>

            {isAdmin && (
              <span className="rounded-lg bg-[#2563EB] text-white px-3 py-1 text-[11px] font-bold uppercase shadow-sm">
                ADMIN
              </span>
            )}
          </div>

          {/* If Admin: Open Admin Dashboard Panel Button */}
          {isAdmin && (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="w-full rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white py-3.5 text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <span>⚙️</span>
              <span>OPEN ADMIN DASHBOARD PANEL</span>
            </button>
          )}
        </div>

        {/* My Posted Listings Section */}
        <div className="space-y-4 pt-2">
          <h3 className="text-base sm:text-lg font-bold text-[#0F172A] dark:text-white">
            My Posted Listings
          </h3>

          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs font-bold text-slate-400">Loading listings...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                You haven't posted any items yet.
              </p>
              <Link
                to="/post"
                className="inline-block rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider transition shadow-sm"
              >
                + Post Your First Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white dark:bg-slate-800 p-4 border border-slate-200/80 dark:border-slate-700 shadow-sm flex items-center gap-3 justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.imageUrl || "https://via.placeholder.com/100"}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover bg-slate-100 dark:bg-slate-900"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        {item.isApproved ? (
                          <span className="bg-blue-50 dark:bg-blue-900/30 text-[#2563EB] dark:text-blue-300 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border border-blue-200/60 dark:border-blue-800">
                            ✓ Live
                          </span>
                        ) : (
                          <span className="bg-amber-50 text-amber-700 text-[9px] font-bold uppercase px-2 py-0.5 rounded-md border border-amber-200">
                            ⏳ Pending
                          </span>
                        )}
                        {item.isFeatured && (
                          <span className="bg-orange-50 text-[#F97316] text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md border border-orange-200">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs font-black text-[#F97316]">
                        KSh {Number(item.price || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 pl-2">
                    <Link
                      to={`/item/${item.id}`}
                      className="text-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 px-3 py-1.5 rounded-xl text-[10px] font-bold"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-center bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded-xl text-[10px] font-bold"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Admin Panel Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
}
