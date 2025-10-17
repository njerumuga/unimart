import React from "react";
import { Link } from "react-router-dom";
import "../styles/ItemCard.css";

export default function ItemCard({ item }) {
    if (!item) return null; // prevent null/undefined crashes

    const isFeatured = item?.isFeatured || false;
    const isApproved = item?.isApproved ?? true;
    const imageUrl = item?.imageUrl || "https://via.placeholder.com/300x200?text=No+Image";

    return (
        <div className={`item-card ${isFeatured ? "featured" : ""}`}>
            {isFeatured && <div className="badge">FEATURED</div>}
            {!isApproved && <div className="pending-badge">Pending Approval</div>}

            <img
                src={imageUrl}
                alt={item?.title || "Item image"}
                className="item-image"
            />

            <div className="item-content">
                <h3>{item?.title || "Untitled Item"}</h3>
                <p className="price">
                    KSh {item?.price ? Number(item.price).toLocaleString() : "N/A"}
                </p>
                <p className="seller">By: {item?.userName || "Unknown"}</p>

                <Link to={`/item/${item?.id}`}>
                    <button className="view-btn">View Details</button>
                </Link>
            </div>
        </div>
    );
}
