import React, { useEffect, useState } from "react";
import "../styles/Home.css";
import ItemCard from "../components/ItemCard";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";

export default function Home() {
    const [items, setItems] = useState([]);
    const { isAdmin } = useAuth();

    useEffect(() => {
        console.log("📡 Fetching items from Firestore...");

        const q = query(
            collection(db, "items"),
            orderBy("isFeatured", "desc"),
            orderBy("createdAt", "desc")
        );

        const unsub = onSnapshot(q, (snap) => {
            const arr = snap.docs.map((d) => ({
                id: d.id,
                isFeatured: d.data().isFeatured ?? false, // ✅ safe fallback
                isApproved: d.data().isApproved ?? true,  // ✅ safe fallback
                ...d.data(),
            }));

            // 🔹 Show only approved items to normal users
            const visibleItems = isAdmin ? arr : arr.filter((item) => item.isApproved);

            console.log("✅ Items fetched:", visibleItems);
            setItems(visibleItems);
        });

        return () => unsub();
    }, [isAdmin]);

    // ✅ Admin approval functions
    const handleApproval = async (id, approved) => {
        try {
            const ref = doc(db, "items", id);
            await updateDoc(ref, { isApproved: approved });
            alert(approved ? "✅ Item approved" : "❌ Item rejected");
        } catch (err) {
            console.error("⚠️ Error updating item:", err);
            alert("Error: " + err.message);
        }
    };

    return (
        <div className="home">
            <h2>Latest Listings</h2>

            <div className="items-container">
                {items.length === 0 ? (
                    <p style={{ textAlign: "center", marginTop: "50px" }}>
                        {isAdmin
                            ? "No items yet 😢 — waiting for users to post."
                            : "No approved items yet 😢 — check back soon!"}
                    </p>
                ) : (
                    items.map((item) => (
                        <div key={item.id} className="admin-item-card">
                            <ItemCard item={item} />

                            {/* ✅ Show admin controls */}
                            {isAdmin && (
                                <div className="admin-controls">
                                    {!item.isApproved ? (
                                        <>
                                            <button
                                                className="approve-btn"
                                                onClick={() => handleApproval(item.id, true)}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="reject-btn"
                                                onClick={() => handleApproval(item.id, false)}
                                            >
                                                Reject
                                            </button>
                                        </>
                                    ) : (
                                        <span className="approved-label">Approved ✅</span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
