import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function SellerProfile() {
  const { sellerId } = useParams();
  const [sellerItems, setSellerItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerListings = async () => {
      try {
        const q = query(collection(db, "items"), where("sellerId", "==", sellerId));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSellerItems(items);
      } catch (error) {
        console.error("Error fetching listings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerListings();
  }, [sellerId]);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Listings by Seller</h2>
      {loading ? (
        <p>Loading listings...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sellerItems.map(item => (
            <div key={item.id} className="border rounded-lg p-3 shadow-sm">
              <img src={item.imageUrl} alt={item.title} className="w-full h-48 object-cover rounded" />
              <h3 className="font-semibold text-lg mt-2">{item.title}</h3>
              <p className="text-green-600 font-bold">KSh {item.price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
