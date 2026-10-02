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
import EditItemModal from "../components/EditItemModal";

export default function Profile() {
  const { user, isAdmin, logout } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center text-3xl mb-4">
          👤
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">
          Log in to view your profile
        </h2>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          Manage your active campus listings, view approval status, and manage your account.
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

  const displayName = user.displayName || user.email?.split("@")[0] || "Comrade Seller";

  return (
    <div className="min-h-screen bg-[#f9fffb] dark:bg-[#111827] pb-24">
      {/* Top Green Banner */}
      <div className="bg-[#00a651] text-white px-4 py-6 sm:px-6 md:px-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            My Profile
          </h1>
          <button
            onClick={handleLogout}
            className="text-xs font-black text-white hover:text-green-100 transition underline underline-offset-4"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 -mt-2 space-y-6 pt-4">
        {/* User / Admin Card */}
        <div className="rounded-[24px] bg-[#eaf5ee] dark:bg-[#1a2e22] p-6 border border-green-200/60 dark:border-green-800 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-[#00a651] dark:text-[#22c55e]">
                {displayName}
              </h2>
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mt-0.5">
                {user.email}
              </p>
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mt-2">
                Total Posted Items: {items.length}
              </p>
            </div>

            {isAdmin && (
              <span className="rounded-lg bg-[#ffb800] text-black px-3 py-1 text-[11px] font-black uppercase shadow-sm">
                ADMIN
              </span>
            )}
          </div>

          {/* If Admin: Open Admin Dashboard Panel Button */}
          {isAdmin && (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              className="w-full rounded-2xl bg-[#00a651] hover:bg-emerald-600 text-white py-3.5 text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-98 flex items-center justify-center gap-2"
            >
              <span>⚙️</span>
              <span>OPEN ADMIN DASHBOARD PANEL</span>
            </button>
          )}
        </div>

        {/* My Posted Listings Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
              My Posted Listings
            </h3>
            <Link
              to="/post"
              className="text-xs font-black text-[#00a651] hover:underline uppercase tracking-wider"
            >
              + Post New Item
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center">
              <div className="w-8 h-8 border-4 border-[#00a651] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-xs font-bold text-gray-400">Loading listings...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                You haven't posted any items yet.
              </p>
              <Link
                to="/post"
                className="inline-block rounded-2xl bg-[#00a651] hover:bg-emerald-600 text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider transition shadow-sm"
              >
                + Post Your First Item
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-3 justify-between"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.imageUrl || "https://via.placeholder.com/100"}
                      alt={item.title}
                      className="w-16 h-16 rounded-xl object-cover bg-gray-100 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                        {item.isApproved ? (
                          <span className="bg-green-100 dark:bg-green-900/40 text-[#00a651] text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                            ✓ Live
                          </span>
                        ) : (
                          <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-md">
                            ⏳ Pending
                          </span>
                        )}
                        {item.isFeatured && (
                          <span className="bg-yellow-100 text-yellow-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md">
                            ⭐ Featured
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs font-black text-[#00a651]">
                        KSh {Number(item.price || 0).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-gray-400 truncate">
                        📍 {item.locationZone || "Main Gate"}
                      </p>
                    </div>
                  </div>

                  {/* Actions: View, Edit, Delete */}
                  <div className="flex flex-col gap-1.5 pl-2 flex-shrink-0">
                    <Link
                      to={`/item/${item.id}`}
                      className="text-center bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-xl text-[10px] font-bold"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => setEditingItem(item)}
                      className="text-center bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-xl text-[10px] font-bold transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-center bg-red-50 hover:bg-red-100 dark:bg-red-900/30 text-red-600 px-3 py-1 rounded-xl text-[10px] font-bold transition"
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

      {/* Seller Edit Listing Modal */}
      <EditItemModal
        isOpen={Boolean(editingItem)}
        onClose={() => setEditingItem(null)}
        item={editingItem}
      />
    </div>
  );
}
