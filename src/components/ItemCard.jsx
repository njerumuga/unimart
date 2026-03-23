import React from "react";
import { Link } from "react-router-dom";

export default function ItemCard({ item }) {
    if (!item) return null;

    const isFeatured = item?.isFeatured || false;
    const isApproved = item?.isApproved ?? true;
    const imageUrl =
        item?.imageUrl || "https://via.placeholder.com/600x400?text=No+Image";

    return (
        <div className="group overflow-hidden rounded-2xl border border-yellow-100 bg-white shadow-soft transition duration-300 hover:-translate-y-1">
            <div className="relative">
                {isFeatured && (
                    <span className="absolute left-3 top-3 z-10 rounded-full bg-soko-yellow px-3 py-1 text-xs font-extrabold text-soko-dark shadow">
            FEATURED
          </span>
                )}

                {!isApproved && (
                    <span className="absolute right-3 top-3 z-10 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600 shadow">
            Pending Approval
          </span>
                )}

                <img
                    src={imageUrl}
                    alt={item?.title || "Item image"}
                    className="h-56 w-full object-cover"
                />
            </div>

            <div className="space-y-3 p-4">
                <h3 className="line-clamp-1 text-lg font-bold text-soko-dark">
                    {item?.title || "Untitled Item"}
                </h3>

                <p className="text-2xl font-extrabold text-green-700">
                    KSh {Number(item?.price || 0).toLocaleString()}
                </p>

                <p className="text-sm text-soko-muted">
                    Seller: <span className="font-semibold text-soko-dark">{item?.userName || "Unknown"}</span>
                </p>

                <Link to={`/item/${item?.id}`} className="block">
                    <button className="w-full rounded-xl bg-soko-dark px-4 py-3 font-semibold text-white transition hover:bg-green-700">
                        View Details
                    </button>
                </Link>
            </div>
        </div>
    );
}