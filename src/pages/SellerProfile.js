import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import ItemCard from "../components/ItemCard";

export default function SellerProfile() {
  const { sellerId } = useParams();
  const [sellerItems, setSellerItems] = useState([]);
  const [sellerName, setSellerName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerListings = async () => {
      try {
        const itemsRef = collection(db, "items");
        const querySnapshot = await getDocs(itemsRef);

        const items = [];
        let name = "";

        querySnapshot.forEach((doc) => {
          const data = doc.data();

          // Match seller ID across all potential database field names
          const isMatch =
            data.userId === sellerId ||
            data.sellerId === sellerId ||
            data.uid === sellerId;

          if (isMatch) {
            items.push({ id: doc.id, ...data });
            if (!name) {
              name = data.userName || data.sellerName || "Seller";
            }
          }
        });

        setSellerItems(items);
        setSellerName(name || "Seller");
      } catch (error) {
        console.error("Error fetching seller listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerListings();
  }, [sellerId]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 pt-24 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-[32px] p-8 shadow-md border-2 border-[#00a651] mb-10 flex items-center justify-between">
          <div>
            <p className="text-[#00a651] font-black uppercase tracking-widest text-xs mb-1">
              Seller Profile
            </p>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 uppercase italic">
              {sellerName}'s <span className="text-[#00a651]">Listings</span>
            </h1>
          </div>
          <div className="bg-[#ffb800] px-6 py-3 rounded-2xl font-black text-black text-sm uppercase shadow-md">
            {sellerItems.length} {sellerItems.length === 1 ? "Item" : "Items"}
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="text-center py-20 font-black text-[#00a651] text-lg uppercase tracking-widest animate-pulse">
            Loading Comrade Listings...
          </div>
        ) : sellerItems.length === 0 ? (
          <div className="bg-white rounded-[32px] p-12 text-center shadow-md border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No active listings found</h3>
            <p className="text-gray-500 text-sm">This seller doesn't have any active items posted.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sellerItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
