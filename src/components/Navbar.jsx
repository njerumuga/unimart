import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate("/");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav className="sticky top-0 z-50 bg-[#00a651] text-white shadow-lg border-b-4 border-[#ffb800]">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
                {/* Logo Section */}
                <Link to="/" className="flex items-center gap-2 transition hover:opacity-90">
                    <div className="rounded-xl bg-white p-1 shadow-sm">
                        <div className="rounded-lg bg-[#ffb800] px-2 py-0.5 text-[10px] font-black text-black md:px-3 md:py-1 md:text-xs">
                            SH
                        </div>
                    </div>
                    <div className="flex flex-col leading-none">
                        <h1 className="text-lg font-black tracking-tighter text-white md:text-2xl">
                            Soko<span className="text-[#ffb800]">Hub</span>
                        </h1>
                        <p className="hidden text-[8px] font-bold uppercase tracking-widest text-green-100 sm:block">
                            Student Marketplace
                        </p>
                    </div>
                </Link>

                {/* Actions Section */}
                <div className="flex items-center gap-3 md:gap-5">
                    {user && (
                        <Link 
                            to="/post" 
                            className="text-[10px] font-black uppercase tracking-tighter hover:text-[#ffb800] md:text-sm"
                        >
                            Sell
                        </Link>
                    )}
                    
                    <Link
                        to="/advertise"
                        className="rounded-full bg-[#ffb800] px-3 py-1.5 text-[10px] font-black uppercase text-black transition hover:scale-105 hover:bg-yellow-400 md:px-6 md:py-2 md:text-xs"
                    >
                        Advertise
                    </Link>

                    <div className="h-4 w-[1px] bg-white/20 hidden md:block"></div>

                    {user ? (
                        <div className="flex items-center gap-3 md:gap-4">
                            <Link to="/profile" className="text-[10px] font-black text-[#ffb800] md:text-sm">
                                {user.displayName?.split(' ')[0] || "Profile"}
                            </Link>
                            <button 
                                onClick={handleLogout} 
                                className="text-[8px] font-black uppercase text-green-100 md:text-[10px]"
                            >
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/login" className="text-[10px] font-black hover:text-[#ffb800] md:text-sm">
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;