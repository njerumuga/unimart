import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import ItemCard from "../components/ItemCard";
import SellerRatingModal from "../components/SellerRatingModal";
import TrustBadge from "../components/TrustBadge";

export default function SellerProfile() {
  const { sellerId } = useParams();
  const [sellerItems, setSellerItems] = useState([]);
  const [sellerName, setSellerName] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!sellerId) return;

    // 1. Fetch Seller's Items filtered by sellerId
    const itemsQuery = query(
      collection(db, "items"),
      where("sellerId", "==", sellerId)
    );

    const unsubscribeItems = onSnapshot(
      itemsQuery,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setSellerItems(items);
        if (items.length > 0 && items[0].sellerName) {
          setSellerName(items[0].sellerName);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching seller items:", error);
        setLoading(false);
      }
    );

    return () => unsubscribeItems();
  }, [sellerId]);

  return (
    <div className="container mx-auto p-4">
      {loading ? (
        <p>Loading seller profile...</p>
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-4">
            {sellerName || "Seller Profile"}
          </h1>
          <TrustBadge />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {sellerItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
          {isModalOpen && (
            <SellerRatingModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              sellerId={sellerId}
            />
          )}
        </div>
      )}
    </div>
  );
}
