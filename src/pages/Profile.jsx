import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { db } from "../firebase";
import { collection, query, where, onSnapshot, doc, updateDoc, Timestamp } from "firebase/firestore";

export default function Profile() {
    const { user } = useAuth();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, "items"), where("userId", "==", user.uid));
        const unsub = onSnapshot(q, (snap) => {
            setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
        return () => unsub();
    }, [user]);

    if (!user) return <div>Please login to see profile</div>;

    const markFeatured = async (itemId) => {
        const ref = doc(db, "items", itemId);
        await updateDoc(ref, {
            isFeatured: true,
            paid: true,
            featuredUntil: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 3600 * 1000)),
        });
        alert("Marked featured for 7 days (you can change this in admin)");
    };

    return (
        <div className="profile-page">
            <h2>{user.displayName || user.email}'s Listings</h2>
            <div className="items-container">
                {items.length === 0 && <p>No listings yet</p>}
                {items.map(it => (
                    <div key={it.id} className="profile-item">
                        <h3>{it.title} {it.isFeatured && <span className="small-badge">FEATURED</span>}</h3>
                        <p>{it.price}</p>
                        <p>{it.description}</p>
                        {/* allow user to request admin to feature: */}
                        {!it.isFeatured && <button onClick={() => markFeatured(it.id)}>Mark Featured (test - admin only)</button>}
                    </div>
                ))}
            </div>
        </div>
    );
}
