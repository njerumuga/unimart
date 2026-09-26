import React from "react";
import { Link } from "react-router-dom";

export default function ItemCard({ item }) {
    if (!item) return null;

    const imageUrl = item?.imageUrl || "https://via.placeholder.com/600x400?text=No+Image";
    const sellerId = item?.userId || item?.sellerId || item?.uid;
    const sellerName = item?.userName || item?.sellerName || "Seller";

    return (
        <div className="group flex flex-col bg-white rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-2xl border-2 border-transparent hover:border-[#00a651] h-full shadow-soft">
            
            {/* Clickable Image -> Goes to Seller Profile */}
            <Link to={`/seller/${sellerId}`} className="relative aspect-square m-2 overflow-hidden rounded-[24px] block">
                <img
                    src={imageUrl}
                    alt={item?.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 right-4">
                    <div className="bg-[#00a651] text-[#ffb800] px-4 py-2 rounded-2xl shadow-lg">
                        <p className="font-black text-sm">
                            KSh {Number(item?.price || 0).toLocaleString()}
                        </p>
                    </div>
                </div>
            </Link>

            {/* Content Section */}
            <div className="flex flex-col flex-1 p-6 pt-2">
                <div className="mb-6">
                    <p className="text-[10px] uppercase tracking-widest font-black text-[#00a651] mb-1">
                        {item?.category || "Listing"}
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                        {item?.title}
                    </h3>
                </div>

                {/* Seller Profile Link */}
                <div className="flex items-center justify-between mb-8">
                    <Link 
                        to={`/seller/${sellerId}`} 
                        className="flex items-center gap-2 group/seller hover:opacity-80 transition-opacity"
                    >
                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-[8px] font-black text-[#00a651] group-hover/seller:bg-[#00a651] group-hover/seller:text-white transition-colors">
                            {sellerName.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-gray-500 group-hover/seller:text-[#00a651] group-hover/seller:underline transition-colors">
                            {sellerName.split(' ')[0]}
                        </span>
                    </Link>

                    <span className="text-[10px] font-black uppercase text-[#00a651] tracking-tighter italic">Verified ●</span>
                </div>

                {/* Button -> Routes to Seller Profile */}
                <Link to={`/seller/${sellerId}`} className="mt-auto">
                    <button className="w-full bg-[#ffb800] text-black py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-[#00a651] hover:text-white shadow-md active:scale-95">
                        View Seller Listings
                    </button>
                </Link>
            </div>
        </div>
    );
}
