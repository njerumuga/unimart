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
                <Link to="/" className="flex items-center gap-3 transition hover:opacity-90">
                    <div className="rounded-xl bg-white p-1.5 shadow-sm">
                        <div className="rounded-lg bg-[#ffb800] px-3 py-1 font-black text-black">
                            SH
                        </div>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter text-white">
                            Soko<span className="text-[#ffb800]">Hub</span>
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-green-100">Student Marketplace</p>
                    </div>
                </Link>

                <div className="flex items-center gap-4">
                    {user && (
                        <Link to="/post" className="hidden text-sm font-bold uppercase tracking-tighter hover:text-[#ffb800] md:block">
                            Sell
                        </Link>
                    )}
                    
                    <Link
                        to="/advertise"
                        className="rounded-full bg-[#ffb800] px-6 py-2 text-xs font-black uppercase text-black transition hover:scale-105 hover:bg-yellow-400"
                    >
                        Advertise
                    </Link>

                    <div className="h-6 w-[1px] bg-white/20 mx-1 hidden md:block"></div>

                    {user ? (
                        <div className="flex items-center gap-4">
                            <Link to="/profile" className="text-sm font-black text-[#ffb800]">
                                {user.displayName?.split(' ')[0] || "Profile"}
                            </Link>
                            <button onClick={handleLogout} className="text-[10px] font-black uppercase text-green-100">Logout</button>
                        </div>
                    ) : (
                        <Link to="/login" className="text-sm font-black hover:text-[#ffb800]">Login</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;