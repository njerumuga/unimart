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
                    setItem({
                        ...data,
                        id: snap.id,
                        isFeatured: data.isFeatured ?? false,
                        isApproved: data.isApproved ?? true,
                        imageUrl: data.imageUrl || "https://via.placeholder.com/300x200?text=No+Image",
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

    if (loading) return <p className="text-center py-10">Loading item details...</p>;
    if (!item) return <p className="text-center py-10">Item not found 😢</p>;

    // ✅ Helper to fix the WhatsApp number format (International 254)
    const formatWhatsAppNumber = (rawNumber) => {
        if (!rawNumber) return "";
        let cleaned = rawNumber.toString().replace(/\D/g, ""); // Remove non-digits
        
        if (cleaned.startsWith("0")) {
            return "254" + cleaned.substring(1); // 07... -> 2547...
        }
        if (cleaned.startsWith("7") || cleaned.startsWith("1")) {
            return "254" + cleaned; // 7... -> 2547...
        }
        return cleaned;
    };

    const cleanPhone = formatWhatsAppNumber(item?.sellerPhone);
    const whatsappMessage = encodeURIComponent(
        `Hi, I saw "${item.title}" posted on SokoHub and I’m interested. Is it still available?`
    );

    const whatsappUrl = cleanPhone 
        ? `https://api.whatsapp.com/send/?phone=${cleanPhone}&text=${whatsappMessage}` 
        : null;

    return (
        <div className="item-details">
            {item.isFeatured && <div className="badge featured">FEATURED</div>}

            <img src={item.imageUrl} alt={item.title} className="details-image" />

            <div className="details-info">
                <h2>{item.title}</h2>
                <p className="price">KSh {Number(item.price).toLocaleString()}</p>
                <p className="description">{item.description || "No description provided."}</p>
                <p className="seller-info">
                    <strong>Seller:</strong> {item.userName || "Unknown"}
                </p>

                {item.isApproved ? (
                    <span className="approved-label">Approved ✅</span>
                ) : (
                    <span className="pending-label">Pending Approval ⏳</span>
                )}

                <div className="action-area mt-6">
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
                        <p className="no-phone text-red-500 italic">
                            📵 Seller did not provide a valid phone number.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}