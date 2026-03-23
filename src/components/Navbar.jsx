import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
    const { user, logout, isAdmin } = useAuth();
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
        <nav className="sticky top-0 z-50 border-b border-yellow-200 bg-soko-dark text-white shadow-soft">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
                <Link to="/" className="flex items-center gap-2">
                    <div className="rounded-xl bg-soko-yellow px-3 py-2 font-extrabold text-soko-dark shadow">
                        SH
                    </div>
                    <div>
                        <h1 className="text-xl font-extrabold tracking-tight text-soko-yellow">
                            SokoHub
                        </h1>
                        <p className="text-xs text-yellow-100">Campus marketplace</p>
                    </div>
                </Link>

                <div className="hidden items-center gap-4 md:flex">
                    <Link to="/" className="text-sm font-medium text-white hover:text-soko-yellow">
                        Home
                    </Link>

                    {user && (
                        <Link
                            to="/post"
                            className="text-sm font-medium text-white hover:text-soko-yellow"
                        >
                            Sell Item
                        </Link>
                    )}

                    {isAdmin && (
                        <Link
                            to="/admin"
                            className="text-sm font-medium text-white hover:text-soko-yellow"
                        >
                            Admin Dashboard
                        </Link>
                    )}

                    <Link
                        to="/advertise"
                        className="rounded-full bg-soko-yellow px-4 py-2 text-sm font-bold text-soko-dark transition hover:scale-105 hover:bg-yellow-300"
                    >
                        Advertise
                    </Link>

                    {user ? (
                        <>
                            <Link
                                to="/profile"
                                className="text-sm font-medium text-white hover:text-soko-yellow"
                            >
                                {user.displayName || "Profile"}
                            </Link>

                            <button
                                onClick={handleLogout}
                                className="rounded-full border border-white px-4 py-2 text-sm font-semibold text-white transition hover:bg-white hover:text-soko-dark"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-sm font-medium text-white hover:text-soko-yellow">
                                Login
                            </Link>

                            <Link
                                to="/signup"
                                className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                            >
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <div className="border-t border-white/10 px-4 py-3 md:hidden">
                <div className="flex flex-wrap gap-3 text-sm">
                    <Link to="/" className="text-white hover:text-soko-yellow">
                        Home
                    </Link>

                    {user && (
                        <Link to="/post" className="text-white hover:text-soko-yellow">
                            Sell Item
                        </Link>
                    )}

                    {isAdmin && (
                        <Link to="/admin" className="text-white hover:text-soko-yellow">
                            Admin
                        </Link>
                    )}

                    <Link to="/advertise" className="text-white hover:text-soko-yellow">
                        Advertise
                    </Link>

                    {user ? (
                        <>
                            <Link to="/profile" className="text-white hover:text-soko-yellow">
                                Profile
                            </Link>
                            <button onClick={handleLogout} className="text-white hover:text-soko-yellow">
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-white hover:text-soko-yellow">
                                Login
                            </Link>
                            <Link to="/signup" className="text-white hover:text-soko-yellow">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;