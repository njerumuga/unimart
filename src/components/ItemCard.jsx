import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ItemCard({ item }) {
    const { user } = useAuth();
    const navigate = useNavigate();

    if (!item) return null;

    const imageUrl = item?.imageUrl || "https://via.placeholder.com/600x400?text=No+Image";

    const handleViewDetails = (e) => {
        if (!user) {
            e.preventDefault(); 
            alert("Comrade, you need to Login first to see full details! 🤝");
            navigate("/login");
        }
    };

    return (
        <div className="group flex flex-col bg-white rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-2xl border-2 border-transparent hover:border-[#00a651] h-full shadow-soft">
            {/* Image Section */}
            <div className="relative aspect-square m-2 overflow-hidden rounded-[24px]">
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
            </div>

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

                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-[8px] font-black text-[#00a651]">
                            {item?.userName?.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-gray-500">{item?.userName?.split(' ')[0]}</span>
                    </div>
                    <span className="text-[10px] font-black uppercase text-[#00a651] tracking-tighter italic">Verified ●</span>
                </div>

                <Link to={`/item/${item?.id}`} onClick={handleViewDetails} className="mt-auto">
                    <button className="w-full bg-[#ffb800] text-black py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:bg-[#00a651] hover:text-white shadow-md active:scale-95">
                        View Details
                    </button>
                </Link>
            </div>
        </div>
    );
}