import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import "../styles/ItemDetails.css";

export default function ItemDetails() {
    const { id } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchItem() {
            try {
                const ref = doc(db, "items", id);
                const snap = await getDoc(ref);

                if (snap.exists()) {
                    const data = snap.data();

                    // ✅ Fallbacks to prevent errors
                    setItem({
                        ...data,
                        id: snap.id,
                        isFeatured: data.isFeatured ?? false,
                        isApproved: data.isApproved ?? true,
                        imageUrl:
                            data.imageUrl ||
                            "https://via.placeholder.com/300x200?text=No+Image",
                    });
                } else {
                    console.error("❌ Item not found");
                }
            } catch (err) {
                console.error("⚠️ Error fetching item:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchItem();
    }, [id]);

    if (loading) return <p>Loading item details...</p>;
    if (!item) return <p>Item not found 😢</p>;

    // ✅ WhatsApp button setup
    const phone = item?.sellerPhone?.trim();

    const whatsappMessage = encodeURIComponent(
        `Hi, I saw "${item.title}" posted on SokoHub and I’m interested. Is it still available?`
    );

    const whatsappUrl = phone
        ? `https://wa.me/${phone}?text=${whatsappMessage}`
        : "#";
    return (
        <div className="item-details">
            {item.isFeatured && <div className="badge featured">FEATURED</div>}

            <img src={item.imageUrl} alt={item.title} className="details-image" />

            <div className="details-info">
                <h2>{item.title}</h2>
                <p className="price">KSh {Number(item.price).toLocaleString()}</p>
                <p>{item.description || "No description provided."}</p>
                <p>
                    <strong>Seller:</strong> {item.userName || "Unknown"}
                </p>

                {item.isApproved ? (
                    <span className="approved-label">Approved ✅</span>
                ) : (
                    <span className="pending-label">Pending Approval ⏳</span>
                )}

                {/* ✅ WhatsApp Contact Button */}
                {whatsappUrl ? (
                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whatsapp-btn"
                    >
                        💬 Contact Seller on WhatsApp
                    </a>
                ) : (
                    <p className="no-phone">
                        📵 Seller did not provide a phone number.
                    </p>
                )}
            </div>
        </div>
    );
}
